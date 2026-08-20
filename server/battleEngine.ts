import { Server, Socket } from 'socket.io';
import { BattleRoomState, BattlePlayer, CommentaryMessage, Challenge, PersonaMode, AiEngine, SupportedLanguage } from '../src/types';
import { CHALLENGES } from './challenges';
import { analyzeCodeForLint, generateBattleCommentary, validateChallengeSolution } from './aiService';

export class BattleEngine {
  private io: Server;
  private rooms = new Map<string, BattleRoomState>();
  private playerDebounceTimers = new Map<string, NodeJS.Timeout>();
  private commentaryTimers = new Map<string, NodeJS.Timeout>();
  private battleIntervals = new Map<string, NodeJS.Timeout>();
  private botIntervals = new Map<string, NodeJS.Timeout>();

  constructor(io: Server) {
    this.io = io;
  }

  public getOrCreateRoom(
    roomId: string, 
    challengeId?: string, 
    persona: PersonaMode = 'standard', 
    engine: AiEngine = 'gemini-3.7-flash',
    language: SupportedLanguage = 'javascript'
  ): BattleRoomState {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }

    const selectedChallenge = challengeId
      ? CHALLENGES.find(c => c.id === challengeId) || CHALLENGES[0]
      : CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

    const starterCode = (selectedChallenge.starterCodes && selectedChallenge.starterCodes[language])
      ? selectedChallenge.starterCodes[language]
      : selectedChallenge.brokenCode;

    const room: BattleRoomState = {
      roomId,
      status: 'waiting',
      challenge: {
        ...selectedChallenge,
        language
      },
      players: {},
      playerOrder: [],
      countdown: 3,
      timeRemaining: 180, // 3 minutes standard
      duration: 180,
      commentary: [
        {
          id: `comm-init-${Date.now()}`,
          timestamp: Date.now(),
          speaker: persona === 'roast' ? 'RoastSensei' : 'Sensei',
          text: persona === 'roast'
            ? `Welcome to the arena of spaghetti code. Today's DSA challenge: "${selectedChallenge.title}" in ${language.toUpperCase()}. Ready to see who writes fewer edge-case bugs?`
            : `Welcome to CodeSensei Debugging Arena. DSA Challenge: "${selectedChallenge.title}" in ${language.toUpperCase()}. Prepare your logic and may the cleanest refactor win!`,
          type: 'milestone'
        }
      ],
      persona,
      aiEngine: engine
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public handleConnection(socket: Socket) {
    // Join or create battle room
    socket.on('battle:join', ({ roomId, username, avatar, persona, aiEngine, vsAi, challengeId, language }) => {
      const roomLang: SupportedLanguage = language || 'javascript';
      const room = this.getOrCreateRoom(roomId, challengeId, persona || 'standard', aiEngine || 'gemini-3.7-flash', roomLang);
      socket.join(roomId);

      const playerId = socket.id;
      const isPlayer1 = room.playerOrder.length === 0;

      const starter = (room.challenge.starterCodes && room.challenge.starterCodes[room.challenge.language || 'javascript'])
        || room.challenge.brokenCode;

      const player: BattlePlayer = {
        id: playerId,
        username: username || (isPlayer1 ? 'Player 1' : 'Player 2'),
        avatar: avatar || (isPlayer1 ? '⚡' : '🔥'),
        ready: false,
        score: 0,
        code: starter,
        testResults: {
          passed: 0,
          total: room.challenge.testCases.length,
          tests: room.challenge.testCases.map(t => ({ ...t, passed: false }))
        }
      };

      if (!room.players[playerId] && room.playerOrder.length < 2) {
        room.players[playerId] = player;
        room.playerOrder.push(playerId);
      }

      // If user requested vs AI bot and room has only 1 player, spawn AI Bot as Player 2
      if (vsAi && room.playerOrder.length === 1) {
        const botId = `bot-${Date.now()}`;
        const botPlayer: BattlePlayer = {
          id: botId,
          username: room.persona === 'roast' ? 'RoastSensei Bot' : 'Sensei AI Bot',
          avatar: '🤖',
          ready: true,
          score: 0,
          code: starter,
          testResults: {
            passed: 0,
            total: room.challenge.testCases.length,
            tests: room.challenge.testCases.map(t => ({ ...t, passed: false }))
          },
          isAiBot: true
        };
        room.players[botId] = botPlayer;
        room.playerOrder.push(botId);
      }

      this.broadcastRoomState(roomId);
    });

    // Player toggles ready
    socket.on('battle:ready', ({ roomId, ready }) => {
      const room = this.rooms.get(roomId);
      if (!room || !room.players[socket.id]) return;

      room.players[socket.id].ready = ready;
      this.broadcastRoomState(roomId);

      // Check if both players are ready to begin countdown
      const players = Object.values(room.players);
      if (players.length >= 2 && players.every(p => p.ready) && room.status === 'waiting') {
        this.startCountdown(roomId);
      }
    });

    // Code change event from a player
    socket.on('battle:code_change', ({ roomId, code, cursor }) => {
      const room = this.rooms.get(roomId);
      if (!room || !room.players[socket.id]) return;

      const player = room.players[socket.id];
      player.code = code;
      if (cursor) player.cursor = cursor;

      // Broadcast remote preview (without heavy spam)
      socket.to(roomId).emit('battle:peer_update', {
        playerId: socket.id,
        codeLength: code.length,
        cursor
      });

      // Trigger debounced code watcher (1.5s) for AI real-time linting
      this.debouncePlayerCodeWatch(roomId, socket.id, code);
    });

    // Player switches room language
    socket.on('battle:set_language', ({ roomId, language }) => {
      const room = this.rooms.get(roomId);
      if (!room || room.status === 'active') return;

      room.challenge.language = language;
      const starter = (room.challenge.starterCodes && room.challenge.starterCodes[language as SupportedLanguage])
        || room.challenge.brokenCode;

      Object.values(room.players).forEach(p => {
        p.code = starter;
      });

      this.broadcastRoomState(roomId);
    });

    // Player runs tests
    socket.on('battle:run_tests', async ({ roomId }) => {
      const room = this.rooms.get(roomId);
      if (!room || !room.players[socket.id]) return;

      const player = room.players[socket.id];
      const validation = await validateChallengeSolution(
        player.code,
        room.challenge.id,
        room.challenge.language || 'javascript',
        room.challenge.testCases
      );

      player.testResults = {
        passed: validation.passedCount,
        total: validation.totalCount,
        tests: validation.tests
      };

      // Check if winner
      if (validation.passed && room.status === 'active') {
        this.endBattle(roomId, socket.id);
      } else {
        this.broadcastRoomState(roomId);
        // Trigger quick shoutcast commentary
        this.triggerMilestoneCommentary(room, `${player.username} ran test suite (${validation.passedCount}/${validation.totalCount} passing)`);
      }
    });

    // Persona switch
    socket.on('battle:set_persona', ({ roomId, persona }) => {
      const room = this.rooms.get(roomId);
      if (!room) return;
      room.persona = persona;
      this.broadcastRoomState(roomId);
    });

    // Engine switch
    socket.on('battle:set_engine', ({ roomId, engine }) => {
      const room = this.rooms.get(roomId);
      if (!room) return;
      room.aiEngine = engine;
      this.broadcastRoomState(roomId);
    });

    // Reset / Rematch
    socket.on('battle:rematch', ({ roomId, challengeId, language }) => {
      const room = this.rooms.get(roomId);
      if (!room) return;

      this.clearRoomTimers(roomId);
      const nextChallenge = challengeId
        ? CHALLENGES.find(c => c.id === challengeId) || CHALLENGES[0]
        : CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

      const lang: SupportedLanguage = language || room.challenge.language || 'javascript';
      const starter = (nextChallenge.starterCodes && nextChallenge.starterCodes[lang])
        || nextChallenge.brokenCode;

      room.challenge = {
        ...nextChallenge,
        language: lang
      };
      room.status = 'waiting';
      room.countdown = 3;
      room.timeRemaining = room.duration;
      room.winnerId = null;
      room.startTime = undefined;
      room.endTime = undefined;

      Object.values(room.players).forEach(p => {
        p.ready = p.isAiBot ? true : false;
        p.code = starter;
        p.isWinner = false;
        p.finishedAt = undefined;
        p.testResults = {
          passed: 0,
          total: nextChallenge.testCases.length,
          tests: nextChallenge.testCases.map(t => ({ ...t, passed: false }))
        };
      });

      room.commentary.push({
        id: `comm-rematch-${Date.now()}`,
        timestamp: Date.now(),
        speaker: room.persona === 'roast' ? 'RoastSensei' : 'Sensei',
        text: `Rematch initialized! Next challenge loaded: "${nextChallenge.title}". Ready up when set!`,
        type: 'milestone'
      });

      this.broadcastRoomState(roomId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      this.rooms.forEach((room, roomId) => {
        if (room.players[socket.id]) {
          delete room.players[socket.id];
          room.playerOrder = room.playerOrder.filter(id => id !== socket.id);
          this.broadcastRoomState(roomId);
        }
      });
    });
  }

  private startCountdown(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'countdown';
    room.countdown = 3;
    this.broadcastRoomState(roomId);

    const interval = setInterval(() => {
      room.countdown--;
      if (room.countdown <= 0) {
        clearInterval(interval);
        this.startBattle(roomId);
      } else {
        this.broadcastRoomState(roomId);
      }
    }, 1000);
  }

  private startBattle(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'active';
    room.startTime = Date.now();
    room.timeRemaining = room.duration;

    const lang = (room.challenge.language || 'javascript') as SupportedLanguage;
    const starter = (room.challenge.starterCodes && room.challenge.starterCodes[lang])
      || room.challenge.brokenCode;

    // Reset code to fresh broken code
    Object.values(room.players).forEach(p => {
      p.code = starter;
    });

    room.commentary.push({
      id: `comm-start-${Date.now()}`,
      timestamp: Date.now(),
      speaker: room.persona === 'roast' ? 'RoastSensei' : 'Sensei',
      text: room.persona === 'roast'
        ? `🔥 ROUND START! The DSA speedrun is ON! Fix those boundary edge cases!`
        : `⚔️ ROUND START! Both contestants have received the algorithm challenge. Clocks are ticking!`,
      type: 'action'
    });

    this.broadcastRoomState(roomId);

    // Start battle timer tick
    const timerInterval = setInterval(() => {
      if (room.status !== 'active') {
        clearInterval(timerInterval);
        return;
      }

      room.timeRemaining--;
      if (room.timeRemaining <= 0) {
        clearInterval(timerInterval);
        this.handleTimeOut(roomId);
      } else {
        // Send lightweight time update
        this.io.to(roomId).emit('battle:tick', { timeRemaining: room.timeRemaining });
      }
    }, 1000);
    this.battleIntervals.set(roomId, timerInterval);

    // Periodic AI Commentary shoutcaster (every 12 seconds)
    const commInterval = setInterval(() => {
      if (room.status !== 'active') {
        clearInterval(commInterval);
        return;
      }
      this.triggerPeriodicCommentary(room);
    }, 12000);
    this.commentaryTimers.set(roomId, commInterval);

    // If there is an AI Bot player, start Bot Simulation
    const botPlayer = Object.values(room.players).find(p => p.isAiBot);
    if (botPlayer) {
      this.startBotSimulation(room, botPlayer);
    }
  }

  private startBotSimulation(room: BattleRoomState, bot: BattlePlayer) {
    let step = 0;
    const lang = (room.challenge.language || 'javascript') as SupportedLanguage;
    const sol = (room.challenge.solutions && room.challenge.solutions[lang])
      || room.challenge.solutionCode;
    const starter = (room.challenge.starterCodes && room.challenge.starterCodes[lang])
      || room.challenge.brokenCode;

    const solutionLines = sol.split('\n');
    const brokenLines = starter.split('\n');

    const botInterval = setInterval(async () => {
      if (room.status !== 'active') {
        clearInterval(botInterval);
        return;
      }

      step++;
      // Progressively modify code towards solution
      if (step === 2) {
        bot.code = brokenLines.slice(0, 4).join('\n') + '\n  // AI Bot refactoring logic...\n' + solutionLines.slice(4, 12).join('\n') + '\n' + brokenLines.slice(12).join('\n');
        bot.testResults.passed = Math.min(1, room.challenge.testCases.length);
        this.broadcastRoomState(room.roomId);
      } else if (step === 4) {
        bot.code = solutionLines.slice(0, Math.floor(solutionLines.length * 0.8)).join('\n') + '\n' + brokenLines.slice(Math.floor(brokenLines.length * 0.8)).join('\n');
        bot.testResults.passed = Math.max(1, room.challenge.testCases.length - 1);
        this.broadcastRoomState(room.roomId);
      } else if (step === 7) {
        // Bot finishes solution
        bot.code = sol;
        bot.testResults.passed = room.challenge.testCases.length;
        this.endBattle(room.roomId, bot.id);
        clearInterval(botInterval);
      }
    }, 6000);

    this.botIntervals.set(room.roomId, botInterval);
  }

  private debouncePlayerCodeWatch(roomId: string, playerId: string, code: string) {
    const key = `${roomId}:${playerId}`;
    if (this.playerDebounceTimers.has(key)) {
      clearTimeout(this.playerDebounceTimers.get(key)!);
    }

    const timer = setTimeout(async () => {
      const room = this.rooms.get(roomId);
      if (!room) return;

      try {
        const diagnostics = await analyzeCodeForLint(
          code,
          room.challenge.language || 'javascript',
          room.persona,
          room.aiEngine
        );

        // Send inline decorations only to the specific player socket
        this.io.to(playerId).emit('decorations:update', {
          diagnostics,
          persona: room.persona
        });
      } catch (err) {
        console.error('Error in debounced lint watcher:', err);
      }
    }, 1500);

    this.playerDebounceTimers.set(key, timer);
  }

  private async triggerPeriodicCommentary(room: BattleRoomState) {
    const pIds = room.playerOrder;
    if (pIds.length < 2) return;

    const p1 = room.players[pIds[0]];
    const p2 = room.players[pIds[1]];
    if (!p1 || !p2) return;

    const message = await generateBattleCommentary(
      {
        name: p1.username,
        passedTests: p1.testResults.passed,
        totalTests: p1.testResults.total,
        codeLength: p1.code.length
      },
      {
        name: p2.username,
        passedTests: p2.testResults.passed,
        totalTests: p2.testResults.total,
        codeLength: p2.code.length
      },
      room.challenge.title,
      room.persona,
      room.aiEngine
    );

    room.commentary.push(message);
    if (room.commentary.length > 25) room.commentary.shift();
    this.io.to(room.roomId).emit('battle:commentary', message);
  }

  private triggerMilestoneCommentary(room: BattleRoomState, text: string) {
    const message: CommentaryMessage = {
      id: `comm-mile-${Date.now()}`,
      timestamp: Date.now(),
      speaker: room.persona === 'roast' ? 'RoastSensei' : 'Sensei',
      text,
      type: 'milestone'
    };
    room.commentary.push(message);
    this.io.to(room.roomId).emit('battle:commentary', message);
  }

  private handleTimeOut(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.clearRoomTimers(roomId);
    room.status = 'finished';
    room.endTime = Date.now();

    // Determine highest score/tests passed
    const players = Object.values(room.players);
    players.sort((a, b) => b.testResults.passed - a.testResults.passed);

    if (players.length > 0 && players[0].testResults.passed > 0) {
      room.winnerId = players[0].id;
      players[0].isWinner = true;
    } else {
      room.winnerId = null; // Tie / No winner
    }

    room.commentary.push({
      id: `comm-timeout-${Date.now()}`,
      timestamp: Date.now(),
      speaker: room.persona === 'roast' ? 'RoastSensei' : 'Sensei',
      text: room.persona === 'roast'
        ? `⏰ TIME'S UP! Both contestants ran out the clock. Hope you enjoyed debugging on production!`
        : `⏰ TIME EXPIRED! The round has concluded. Well fought!`,
      type: 'win'
    });

    this.broadcastRoomState(roomId);
  }

  private endBattle(roomId: string, winnerId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.clearRoomTimers(roomId);
    room.status = 'finished';
    room.winnerId = winnerId;
    room.endTime = Date.now();

    const winner = room.players[winnerId];
    if (winner) {
      winner.isWinner = true;
      winner.finishedAt = Date.now();
      winner.score += 100;
    }

    const elapsedSeconds = room.startTime ? Math.floor((Date.now() - room.startTime) / 1000) : 0;

    room.commentary.push({
      id: `comm-win-${Date.now()}`,
      timestamp: Date.now(),
      speaker: room.persona === 'roast' ? 'RoastSensei' : 'Sensei',
      text: room.persona === 'roast'
        ? `🏆 VICTORY! ${winner?.username || 'Player'} solved the challenge in ${elapsedSeconds}s! Opponent, your code looks like it was written in 1995.`
        : `🏆 VICTORY! ${winner?.username || 'Player'} has passed 100% of test cases in ${elapsedSeconds}s! Brilliant algorithm execution!`,
      type: 'win',
      highlightPlayerId: winnerId
    });

    this.broadcastRoomState(roomId);
  }

  private clearRoomTimers(roomId: string) {
    if (this.battleIntervals.has(roomId)) {
      clearInterval(this.battleIntervals.get(roomId)!);
      this.battleIntervals.delete(roomId);
    }
    if (this.commentaryTimers.has(roomId)) {
      clearInterval(this.commentaryTimers.get(roomId)!);
      this.commentaryTimers.delete(roomId);
    }
    if (this.botIntervals.has(roomId)) {
      clearInterval(this.botIntervals.get(roomId)!);
      this.botIntervals.delete(roomId);
    }
  }

  private broadcastRoomState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.io.to(roomId).emit('battle:state', room);
    }
  }
}

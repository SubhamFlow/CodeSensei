import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getAiConfig, analyzeCodeForLint, streamExplainCode, validateChallengeSolution } from './server/aiService';
import { CHALLENGES } from './server/challenges';
import { BattleEngine } from './server/battleEngine';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json());

  // Initialize Socket.io with CORS & WebSocket support
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const battleEngine = new BattleEngine(io);

  // --- API Endpoints ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.get('/api/config', (req, res) => {
    res.json(getAiConfig());
  });

  app.get('/api/challenges', (req, res) => {
    res.json(CHALLENGES);
  });

  // Direct lint endpoint
  app.post('/api/ai/lint', async (req, res) => {
    try {
      const { code, language, persona, engine } = req.body;
      const diagnostics = await analyzeCodeForLint(code, language || 'typescript', persona || 'standard', engine);
      res.json({ diagnostics });
    } catch (err: any) {
      console.error('Lint API error:', err);
      res.status(500).json({ error: err.message || 'Lint failed' });
    }
  });

  // Streaming Explain API (Server-Sent Events)
  app.post('/api/ai/explain', async (req, res) => {
    const { code, question, selectedLine, language, persona, engine } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const generator = streamExplainCode(
        code,
        question,
        selectedLine,
        language || 'typescript',
        persona || 'standard',
        engine
      );

      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('Explain streaming error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
      res.end();
    }
  });

  // Solution Validation
  app.post('/api/ai/validate', async (req, res) => {
    try {
      const { code, challengeId, language, testCases } = req.body;
      const result = await validateChallengeSolution(code, challengeId, language, testCases);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Validation error' });
    }
  });

  // --- Real-Time Collaborative Pair Programming & Battle Sockets ---
  // In-memory state for Collaborative Pair Rooms
  const pairRooms = new Map<string, {
    roomId: string;
    code: string;
    language: string;
    persona: 'standard' | 'roast';
    engine: string;
    peers: Record<string, { id: string; name: string; color: string; cursor?: { line: number; column: number } }>;
    messages: Array<{ id: string; sender: string; text: string; timestamp: number; isAi?: boolean }>;
  }>();

  const pairDebounceTimers = new Map<string, NodeJS.Timeout>();

  io.on('connection', (socket) => {
    // Battle Mode socket delegator
    battleEngine.handleConnection(socket);

    // Collaborative Pair Programming handlers
    socket.on('pair:join', ({ roomId, username, userColor }) => {
      socket.join(`pair:${roomId}`);
      let room = pairRooms.get(roomId);
      if (!room) {
        room = {
          roomId,
          code: `// CodeSensei Collaborative Pair-Programming Sandbox\n// Edit together with live AI pair-programming linting & roasts!\n\nfunction calculateMetrics(records) {\n  let total = 0;\n  for (var i = 0; i < records.length; i++) {\n    // Type your algorithm or debug together here...\n    total += records[i].value;\n  }\n  return total;\n}\n`,
          language: 'typescript',
          persona: 'standard',
          engine: 'groq-llama3.3',
          peers: {},
          messages: [
            {
              id: `msg-init-${Date.now()}`,
              sender: 'CodeSensei AI',
              text: 'Connected to collaborative pair room! Start coding together and I will analyze bugs in real time.',
              timestamp: Date.now(),
              isAi: true
            }
          ]
        };
        pairRooms.set(roomId, room);
      }

      room.peers[socket.id] = {
        id: socket.id,
        name: username || `Dev_${socket.id.slice(0, 4)}`,
        color: userColor || '#6366f1'
      };

      // Send initial room state to joining peer
      socket.emit('pair:init', room);
      // Broadcast updated peer list
      io.to(`pair:${roomId}`).emit('pair:peers', Object.values(room.peers));
    });

    socket.on('pair:edit', ({ roomId, code, cursor }) => {
      const room = pairRooms.get(roomId);
      if (!room) return;

      room.code = code;
      if (cursor && room.peers[socket.id]) {
        room.peers[socket.id].cursor = cursor;
      }

      // Broadcast changes to peers in room
      socket.to(`pair:${roomId}`).emit('pair:sync', {
        code,
        senderId: socket.id,
        cursor
      });

      // Debounced AI Lint Watcher for pair room
      const debounceKey = `pair:${roomId}`;
      if (pairDebounceTimers.has(debounceKey)) {
        clearTimeout(pairDebounceTimers.get(debounceKey)!);
      }

      const timer = setTimeout(async () => {
        try {
          const diagnostics = await analyzeCodeForLint(
            code,
            room.language,
            room.persona,
            room.engine as any
          );
          io.to(`pair:${roomId}`).emit('decorations:update', {
            diagnostics,
            persona: room.persona
          });
        } catch (err) {
          console.error('Pair room lint error:', err);
        }
      }, 1500);

      pairDebounceTimers.set(debounceKey, timer);
    });

    socket.on('pair:chat_message', ({ roomId, text, senderName }) => {
      const room = pairRooms.get(roomId);
      if (!room) return;

      const message = {
        id: `msg-${Date.now()}`,
        sender: senderName || 'Anonymous',
        text,
        timestamp: Date.now()
      };
      room.messages.push(message);
      io.to(`pair:${roomId}`).emit('pair:new_message', message);
    });

    socket.on('pair:set_persona', ({ roomId, persona }) => {
      const room = pairRooms.get(roomId);
      if (!room) return;
      room.persona = persona;
      io.to(`pair:${roomId}`).emit('pair:persona_changed', persona);
    });

    socket.on('disconnect', () => {
      pairRooms.forEach((room, roomId) => {
        if (room.peers[socket.id]) {
          delete room.peers[socket.id];
          io.to(`pair:${roomId}`).emit('pair:peers', Object.values(room.peers));
        }
      });
    });
  });

  // --- Vite Middleware / Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeSensei server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

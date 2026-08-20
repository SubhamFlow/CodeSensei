# 🥷 CodeSensei

> **Real-time collaborative debugging arena powered by ultra-low-latency AI.**  
> CodeSensei turns passive code editing into an interactive, high-stakes multiplayer arena. Pair-program in real time while an autonomous Groq-driven AI watches your code, roasts bad practices, and judges live 1v1 debugging battles.

![CodeSensei Banner](https://raw.githubusercontent.com/placeholder/codesensei-demo.gif)

---

## ⚡ Key Features

* **🏎️ Silent Real-Time Linting:** Background AI debouncer scans Yjs document diffs as you type, highlighting logic bugs, syntax errors, and edge cases in Monaco Editor without needing explicit prompts.
* **🔥 Roast Mode Toggle:** Switch seamlessly between a helpful senior engineer persona and a hilarious, sarcastic tech lead that comments on bad variable names, missing edge cases, and questionable code choices.
* **💬 Streaming "Explain Why" Panel:** Highlight any flagged code to ask for an explanation. Explanations stream token-by-token at sub-second speeds powered by Groq.
* **⚔️ 1v1 Battle Mode:** Dual-room competitive debugging. Two coders get the exact same broken code snippet, a live timer counts down, and the engine monitors both codebases for fixes while an AI esports narrator comments on the action in real time.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Editor** | React, Monaco Editor, Yjs | Live multi-cursor code synchronization & decorations |
| **Real-Time Engine** | Socket.io, WebSockets | Yjs document syncing, battle state machine, and event logs |
| **AI Inference** | Groq API (`llama-3.3-70b-versatile`) | High-speed streaming linting, roasting, and narration |
| **Backend Service** | Node.js, Express | Room management, debounced watcher, test runner |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js** v18+
* **npm** or **pnpm**
* A **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

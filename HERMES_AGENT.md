# Hermes Agent - Visual AI Orchestration

This fork of shapez.io provides a visual interface for orchestrating AI agents using a factory metaphor.

## Quick Start

### Prerequisites

- Node.js 16+ and Yarn
- Python 3.11+ with a virtual environment
- Hermes Agent installed (`pip install hermes-agent` or clone the repo)

### 1. Start the WebSocket Bridge (Hermes Agent side)

```bash
cd /path/to/hermes-agent
source venv/bin/activate
python shapez/server.py &
```

This starts:
- WebSocket server on `ws://localhost:8765` (connects game to AI)
- Flask server on `http://localhost:8080` (optional factory API)

### 2. Start the Game Server (shapez.io side)

```bash
cd /path/to/shapez.io
NODE_OPTIONS=--openssl-legacy-provider yarn dev
```

This starts the game at `http://localhost:3005`

### 3. Open the Game

Navigate to `http://localhost:3005` in your browser. The game will:
1. Load the Hermes Agent mod automatically
2. Connect to the WebSocket bridge
3. Show "Hermes Agent connected" when ready

## How It Works

### Shape-Based Task Types

Each shape represents a different type of AI task:

| Shape | Task Type | Backend |
|-------|-----------|---------|
| ⬛ Square | Web Browser Automation | Vers VM + Playwright |
| ⚪ Circle | iMessage | Local (macOS only) |
| ⭐ Star | GitHub Admin | Apple Container / Local |
| 🔷 Any + Yellow | Cloud Code | Vers VM + pi |

### Color-Based AI Providers

Paint shapes with colors to select the AI provider:

| Color | Provider | Model |
|-------|----------|-------|
| 🟢 Green | Google Gemini | gemini-2.0-flash |
| 🔴 Red | Anthropic Claude | claude-sonnet-4-20250514 |
| 🟡 Yellow | Cloud Code Mode | (mix green + red) |

### Gameplay Loop

1. **Place a Task Source** (miner) on a shape patch (square, circle, star)
2. **Double-click** the Task Source to set your prompt/instruction
3. **Connect to a Painter** to assign an AI provider (green or red)
4. **Route to the Hub** - the AI executes your task when shapes arrive
5. **View results** in the notification panel or history (hamburger menu)

### Levels

| Level | Goal | Description |
|-------|------|-------------|
| 1 | Red Square | Web Browser Agent - Playwright automation |
| 2 | Red Circle | iMessage Agent - Read & send messages |
| 3 | Red Star | GitHub Admin - Manage repos, issues, PRs |
| 4 | Yellow Shape | Cloud Code - Full coding environment |

## Configuration

### API Keys

Set these in `~/.hermes/.env`:

```bash
# Required for AI providers
OPENROUTER_API_KEY=sk-or-...
ANTHROPIC_API_KEY=sk-ant-...    # Optional, for direct Anthropic access
GOOGLE_API_KEY=...              # For Gemini

# Required for Playwright browser tasks
VERS_API_KEY=...

# Optional for GitHub tasks
GITHUB_TOKEN=ghp_...
```

### Troubleshooting

**"Hermes Agent not connected"**
- Ensure the WebSocket bridge is running on port 8765
- Check browser console for connection errors

**Tasks not executing**
- Shapes must be painted (green or red) before reaching the Hub
- Grey/uncolored shapes are rejected with a warning

**Browser tasks failing**
- Ensure `VERS_API_KEY` is set
- The Vers VM needs to be provisioned with Playwright

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   shapez.io     │◄──────────────────►│  Hermes Agent   │
│   (Browser)     │    localhost:8765  │  (Python)       │
│                 │                    │                 │
│  - Visual UI    │                    │  - AI Agents    │
│  - Task input   │                    │  - Tool calling │
│  - Results      │                    │  - Vers/Local   │
└─────────────────┘                    └─────────────────┘
        │                                      │
        │ HTTP :3005                           │ API calls
        ▼                                      ▼
   ┌─────────┐                          ┌─────────────┐
   │ Browser │                          │ OpenRouter  │
   │  Game   │                          │ Anthropic   │
   └─────────┘                          │ Google      │
                                        └─────────────┘
```

## Files

- `mod_examples/hermes_agent.js` - Main mod file (auto-loaded)
- `src/js/core/config.local.js` - Local config overrides

## Related Repositories

- [hermes-agent](https://github.com/hdresearch/hermes-agent) - Main Hermes Agent project
- [shapez](https://github.com/hdresearch/shapez) - WebSocket bridge (submodule of hermes-agent)

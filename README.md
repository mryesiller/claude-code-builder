# Claude Code Visual Builder

A visual drag-and-drop tool for designing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) project structures. Build your agents, skills, hooks, and MCP servers on a canvas — then export as a ready-to-use ZIP.

> **No account needed. Runs locally in your browser.**

<!-- TODO: Add screenshot here -->
<!-- ![Screenshot](public/screenshot.png) -->

## Quick Start

```bash
git clone https://github.com/anthropics/claude-code-visual-builder.git
cd claude-code-visual-builder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building.

## How It Works

1. **Pick a template** or start from scratch
2. **Drag nodes** from the palette onto the canvas (agents, skills, MCP servers, hooks, etc.)
3. **Connect them** by dragging edges between nodes
4. **Configure** each node by clicking on it
5. **Export ZIP** — download and drop it into your project folder

That's it. The builder generates the full `.claude/` directory structure for you.

## What You Can Build

| Node | What It Does |
|------|-------------|
| **Chef** | Root orchestrator — becomes your `CLAUDE.md` |
| **Agent** | Subagent with its own persona, model, and tools |
| **Skill** | Reusable prompt templates (slash commands for agents) |
| **Command** | User-facing slash commands |
| **MCP Server** | Connect external tools (GitHub, Slack, Postgres, etc.) |
| **Hook** | Lifecycle hooks that run before/after tool calls |
| **Rule** | Project-wide or path-specific coding rules |
| **Tool Permission** | Allow/deny specific tools per agent |
| **Memory** | Persistent memory configuration |
| **Env Variables** | Environment variable definitions |
| **Plugin** | Plugin configurations |
| **Team** | Multi-agent team setups |

## Features

- **Templates** — 4 starter templates (Web App, API Service, Data Pipeline, Minimal)
- **Smart connections** — linking a Skill to an Agent auto-updates the agent's config
- **Live file tree** — see the generated project structure update in real-time
- **Auto-layout** — one-click Dagre-based layout
- **Import/Export** — ZIP files and shareable URLs
- **Undo/Redo** — full history with Ctrl+Z / Ctrl+Shift+Z
- **Dark mode** — follows your system preference
- **Validation** — catches common config mistakes before export
- **MCP templates** — 11 pre-configured servers (GitHub, Slack, Postgres, and more)
- **Skills browser** — browse community skills from [skills.sh](https://skills.sh)

## Generated Output

The exported ZIP contains a standard Claude Code project:

```
my-project/
├── CLAUDE.md                    # Main project instructions
├── .claude/
│   ├── settings.json            # Permissions, hooks, env
│   ├── agents/
│   │   ├── code-reviewer.md     # Agent definitions
│   │   └── test-writer.md
│   ├── skills/
│   │   └── deploy/
│   │       └── SKILL.md         # Skill prompts
│   ├── commands/
│   │   └── review-pr.md         # Slash commands
│   └── rules/
│       └── testing.md           # Project rules
└── .mcp.json                    # MCP server configs
```

Drop this into any project folder and Claude Code picks it up automatically.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicate selected nodes |
| `Delete` / `Backspace` | Delete selected nodes |

## Tech Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Flow, Zustand, JSZip

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make changes and verify: `npm run build`
4. Open a pull request

**Dev notes:**
- Uses **Next.js 16** (breaking changes from earlier versions — check `node_modules/next/dist/docs/` if stuck)
- UI components use **Base UI** (not Radix) — uses `render` prop, not `asChild`
- **Tailwind v4** with `@custom-variant` for dark mode

## License

MIT

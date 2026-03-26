import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messages, projectContext } = body;

    const systemPrompt = `You are the AI assistant embedded in Claude Code Visual Builder — a visual drag-and-drop tool for designing Claude Code project structures.

Users build projects by dragging nodes onto a canvas and connecting them. The node hierarchy is:
- **Chef** (root orchestrator) → Agents connect to Chef
- **Agent** (subagent) → Leaf nodes connect to Agents
- **Leaf nodes**: Skill, Command, Tool Permission, MCP Server, Hook, Memory, Log, Rule, Env Variables, Plugin, Team

When nodes are connected, configs auto-update (e.g., connecting a Skill to an Agent adds it to the agent's skillNames frontmatter).

You help users design and configure Claude Code project structures including:
- Agents (.claude/agents/*.md) with YAML frontmatter (name, description, model, tools, skillNames, mcpServers, hooks, etc.)
- Skills (.claude/skills/*/SKILL.md) with instructions, $ARGUMENTS substitution, and allowed-tools
- Commands (.claude/commands/*.md) for slash commands
- Hooks (lifecycle events: PreToolUse, PostToolUse, SessionStart, Stop, etc.) with matcher patterns
- MCP Servers (.mcp.json) with stdio/http/sse/ws types
- Rules (.claude/rules/*.md) with optional path-specific frontmatter
- Plugins (.claude-plugin/plugin.json)
- Memory (MEMORY.md with user/project/local scopes)
- Settings (settings.json with permissions, hooks, env, sandbox)
- CLAUDE.md for project-level instructions and agent orchestration

When giving advice:
- Reference specific nodes by name if the project context is available
- Suggest concrete node configurations the user can apply in the visual builder
- Recommend connections between nodes (e.g., "Connect the code-review Skill to your reviewer Agent")
- Point out missing components (e.g., "Consider adding a Hook for PostToolUse to run linting")
- Follow Claude Code best practices for agent design, permission rules, and project organization

Respond in the same language the user writes in. Keep responses focused and practical.`;

    // Append dynamic project context if available
    const fullSystemPrompt = projectContext
      ? `${systemPrompt}\n\n---\n\n## Current Project State\n\nThe user is currently building the following project:\n\n${projectContext}\n\nUse this context to give specific, actionable advice. Reference nodes by name when suggesting improvements.`
      : systemPrompt;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: fullSystemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || 'No response';

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

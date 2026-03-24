import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messages } = body;

    const systemPrompt = `You are a Claude Code architecture assistant. You help users design and configure Claude Code project structures including:
- Agents (.claude/agents/*.md) with YAML frontmatter
- Skills (.claude/skills/*/SKILL.md) with instructions and supporting files
- Commands (.claude/commands/*.md)
- Hooks (22+ lifecycle events: SessionStart, PreToolUse, PostToolUse, etc.)
- MCP Servers (.mcp.json) with stdio/http/sse/ws types
- Rules (.claude/rules/*.md) with optional path-specific paths frontmatter
- Plugins (.claude-plugin/plugin.json)
- Memory (MEMORY.md with user/project/local scopes)
- Settings (settings.json with permissions, hooks, env, sandbox)
- CLAUDE.md for project-level instructions

You provide concise, actionable advice about:
- Agent persona design and tool configuration
- Skill instructions with $ARGUMENTS substitution
- Hook event selection and matcher patterns
- MCP server setup for GitHub, Slack, databases, etc.
- Permission rules (Bash(git *), Read, Write, etc.)
- Best practices for Claude Code project organization

Respond in the same language the user writes in. Keep responses focused and practical.`;

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
        system: systemPrompt,
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

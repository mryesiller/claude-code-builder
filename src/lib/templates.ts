import {
  AgentData, ChefData, SkillData, CommandData, ToolData,
  McpData, HookData, MemoryData, LogData, RuleData,
  PluginData, EnvData, TeamData, ClaudeNodeType, NodeDataMap,
} from './types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

let nodeCounter = 0;
export function getNextId(): string {
  return `node_${Date.now()}_${++nodeCounter}`;
}

// --- Default Data Factories ---

export function createDefaultChef(): ChefData {
  return {
    projectName: 'my-project',
    persona: `# Project: My Project

## Tech Stack
- Define your tech stack here

## Conventions
- Always write tests before code
- Use conventional commits
- Run lint + typecheck before PR

## Architecture
- src/components — UI components
- src/services — Business logic
- src/utils — Shared helpers

## Security
- No secrets in code or logs
- Validate all user inputs
- Use parameterized queries only`,
    model: 'sonnet',
    systemPrompt: '',
    permissions: {
      mode: 'default',
      allow: [],
      deny: [],
    },
    env: {},
    sandbox: {
      enabled: false,
      pathPrefixes: [],
    },
    autoMemoryEnabled: true,
  };
}

export function createDefaultAgent(name?: string): AgentData {
  const agentName = name || `agent-${Date.now().toString(36).slice(-4)}`;
  return {
    name: slugify(agentName),
    description: `Handles ${agentName} related tasks`,
    persona: `You are a specialized agent for ${agentName}.

## Responsibilities
- Define your agent responsibilities here

## Guidelines
- Follow project conventions
- Be thorough and accurate
- Ask clarifying questions when needed`,
    model: 'sonnet',
    tools: ['Read', 'Grep', 'Glob', 'Bash'],
    disallowedTools: [],
    permissionMode: 'default',
    maxTurns: undefined,
    background: false,
    effort: 'medium',
    isolation: undefined,
    memory: undefined,
    skillNames: [],
    mcpServerNames: [],
    hooks: {},
  };
}

export function createDefaultSkill(name?: string): SkillData {
  const skillName = name || `skill-${Date.now().toString(36).slice(-4)}`;
  return {
    name: slugify(skillName),
    description: `Performs ${skillName} tasks`,
    content: `# ${skillName}

Describe what this skill does and how to use it.

## Usage
\`/${ slugify(skillName)} $ARGUMENTS\`

## Instructions
1. Step 1
2. Step 2
3. Step 3`,
    argumentHint: undefined,
    disableModelInvocation: false,
    userInvocable: true,
    allowedTools: ['Read', 'Grep', 'Glob'],
    model: undefined,
    effort: undefined,
    context: undefined,
    agent: undefined,
    hooks: {},
    supportingFiles: [],
  };
}

export function createDefaultCommand(name?: string): CommandData {
  const cmdName = name || `command-${Date.now().toString(36).slice(-4)}`;
  return {
    name: slugify(cmdName),
    content: `# ${cmdName}

Describe what this command does.

$ARGUMENTS`,
    description: `Runs ${cmdName}`,
  };
}

export function createDefaultTool(): ToolData {
  return {
    name: 'Bash',
    pattern: 'Bash(npm run *)',
    scope: 'allow',
  };
}

export function createDefaultMcp(name?: string): McpData {
  return {
    serverName: name || 'my-server',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@example/mcp-server'],
    url: undefined,
    env: {},
  };
}

export function createDefaultHook(): HookData {
  return {
    event: 'PreToolUse',
    matcher: 'Bash',
    hookType: 'command',
    command: './scripts/validate.sh',
    url: undefined,
    prompt: undefined,
    timeout: 600,
    statusMessage: undefined,
    async: false,
    model: undefined,
  };
}

export function createDefaultMemory(): MemoryData {
  return {
    scope: 'project',
    initialContent: `---
name: project-memory
description: Shared project memory
type: project
---

# Project Memory

Add shared knowledge here.`,
    isShared: true,
  };
}

export function createDefaultLog(): LogData {
  return {
    name: 'agent-log',
    directory: 'logs',
    format: 'jsonl',
  };
}

export function createDefaultRule(name?: string): RuleData {
  return {
    name: name || 'code-style',
    content: `# Code Style Rules

- Use consistent formatting
- Follow established patterns
- Write clear, readable code`,
    paths: undefined,
    isPathSpecific: false,
  };
}

export function createDefaultPlugin(name?: string): PluginData {
  return {
    name: name || 'my-plugin',
    description: 'A custom Claude Code plugin',
    version: '1.0.0',
    includeSkills: true,
    includeAgents: true,
    includeHooks: false,
    includeMcp: false,
  };
}

export function createDefaultEnv(): EnvData {
  return {
    variables: {
      NODE_ENV: 'development',
    },
    label: 'Environment',
  };
}

export function createDefaultTeam(name?: string): TeamData {
  return {
    name: name || 'dev-team',
    description: 'A team of agents working together',
    agentNames: [],
    displayMode: 'in-process',
  };
}

// --- Factory Map ---
export function createDefaultNodeData(type: ClaudeNodeType): NodeDataMap[ClaudeNodeType] {
  const factories: Record<ClaudeNodeType, () => NodeDataMap[ClaudeNodeType]> = {
    chef: createDefaultChef,
    agent: createDefaultAgent,
    skill: createDefaultSkill,
    command: createDefaultCommand,
    tool: createDefaultTool,
    mcp: createDefaultMcp,
    hook: createDefaultHook,
    memory: createDefaultMemory,
    log: createDefaultLog,
    rule: createDefaultRule,
    plugin: createDefaultPlugin,
    env: createDefaultEnv,
    team: createDefaultTeam,
  };
  return factories[type]();
}

// --- Label Generator ---
export function getDefaultLabel(type: ClaudeNodeType, config: NodeDataMap[ClaudeNodeType]): string {
  switch (type) {
    case 'chef': return (config as ChefData).projectName;
    case 'agent': return (config as AgentData).name;
    case 'skill': return (config as SkillData).name;
    case 'command': return (config as CommandData).name;
    case 'tool': return (config as ToolData).pattern;
    case 'mcp': return (config as McpData).serverName;
    case 'hook': return (config as HookData).event;
    case 'memory': return `Memory (${(config as MemoryData).scope})`;
    case 'log': return (config as LogData).name;
    case 'rule': return (config as RuleData).name;
    case 'plugin': return (config as PluginData).name;
    case 'env': return (config as EnvData).label;
    case 'team': return (config as TeamData).name;
  }
}

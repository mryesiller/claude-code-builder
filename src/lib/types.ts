// ============================================================
// Claude Code Visual Builder — All TypeScript Types
// ============================================================

// --- Node Type Enum ---
export type ClaudeNodeType =
  | 'chef'
  | 'agent'
  | 'skill'
  | 'command'
  | 'tool'
  | 'mcp'
  | 'hook'
  | 'memory'
  | 'log'
  | 'rule'
  | 'plugin'
  | 'env'
  | 'team';

// --- Hook Event Types (22+ events) ---
export type HookEventType =
  | 'SessionStart'
  | 'InstructionsLoaded'
  | 'UserPromptSubmit'
  | 'PreToolUse'
  | 'PermissionRequest'
  | 'PostToolUse'
  | 'PostToolUseFailure'
  | 'Notification'
  | 'SubagentStart'
  | 'SubagentStop'
  | 'Stop'
  | 'StopFailure'
  | 'TeammateIdle'
  | 'TaskCompleted'
  | 'ConfigChange'
  | 'WorktreeCreate'
  | 'WorktreeRemove'
  | 'PreCompact'
  | 'PostCompact'
  | 'Elicitation'
  | 'ElicitationResult'
  | 'SessionEnd';

export type HookHandlerType = 'command' | 'http' | 'prompt' | 'agent';
export type PermissionMode = 'default' | 'acceptEdits' | 'dontAsk' | 'bypassPermissions' | 'plan';
export type ModelChoice = 'sonnet' | 'opus' | 'haiku' | 'inherit' | string;
export type EffortLevel = 'low' | 'medium' | 'high' | 'max';
export type MemoryScope = 'user' | 'project' | 'local';
export type McpServerType = 'stdio' | 'http' | 'sse' | 'ws';
export type ToolScope = 'allow' | 'deny';

// --- Hook Configuration ---
export interface HookHandler {
  type: HookHandlerType;
  command?: string;
  url?: string;
  prompt?: string;
  timeout?: number;
  statusMessage?: string;
  async?: boolean;
  headers?: Record<string, string>;
  model?: string;
}

export interface HookMatcherGroup {
  matcher?: string;
  hooks: HookHandler[];
}

export interface HookConfig {
  [event: string]: HookMatcherGroup[];
}

// --- Per-Node-Type Data Payloads ---

export interface ChefData {
  projectName: string;
  persona: string;
  model: ModelChoice;
  systemPrompt: string;
  permissions: {
    mode: PermissionMode;
    allow: string[];
    deny: string[];
  };
  env: Record<string, string>;
  sandbox: {
    enabled: boolean;
    pathPrefixes: string[];
  };
  autoMemoryEnabled: boolean;
}

export interface AgentData {
  name: string;
  description: string;
  persona: string;
  model: ModelChoice;
  tools: string[];
  disallowedTools: string[];
  permissionMode: PermissionMode;
  maxTurns?: number;
  background: boolean;
  effort: EffortLevel;
  isolation?: 'worktree';
  memory?: MemoryScope;
  skillNames: string[];
  mcpServerNames: string[];
  hooks: HookConfig;
}

export interface SkillData {
  name: string;
  description: string;
  content: string;
  argumentHint?: string;
  disableModelInvocation: boolean;
  userInvocable: boolean;
  allowedTools: string[];
  model?: ModelChoice;
  effort?: EffortLevel;
  context?: 'fork';
  agent?: string;
  hooks: HookConfig;
  supportingFiles: Array<{
    path: string;
    content: string;
  }>;
}

export interface CommandData {
  name: string;
  content: string;
  description: string;
}

export interface ToolData {
  name: string;
  pattern: string;
  scope: ToolScope;
}

export interface McpData {
  serverName: string;
  type: McpServerType;
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

export interface HookData {
  event: HookEventType;
  matcher?: string;
  hookType: HookHandlerType;
  command?: string;
  url?: string;
  prompt?: string;
  timeout?: number;
  statusMessage?: string;
  async?: boolean;
  model?: string;
}

export interface MemoryData {
  scope: MemoryScope;
  initialContent: string;
  isShared: boolean;
}

export interface LogData {
  name: string;
  directory: string;
  format: 'jsonl' | 'txt';
}

export interface RuleData {
  name: string;
  content: string;
  paths?: string[];
  isPathSpecific: boolean;
}

export interface PluginData {
  name: string;
  description: string;
  version: string;
  includeSkills: boolean;
  includeAgents: boolean;
  includeHooks: boolean;
  includeMcp: boolean;
}

export interface EnvData {
  variables: Record<string, string>;
  label: string;
}

export interface TeamData {
  name: string;
  description: string;
  agentNames: string[];
  displayMode: 'in-process' | 'tmux' | 'split-panes';
}

// --- Discriminated Union ---
export type NodeDataMap = {
  chef: ChefData;
  agent: AgentData;
  skill: SkillData;
  command: CommandData;
  tool: ToolData;
  mcp: McpData;
  hook: HookData;
  memory: MemoryData;
  log: LogData;
  rule: RuleData;
  plugin: PluginData;
  env: EnvData;
  team: TeamData;
};

// --- Canvas Node (React Flow compatible) ---
export interface CanvasNodeData {
  label: string;
  nodeType: ClaudeNodeType;
  config: NodeDataMap[ClaudeNodeType];
  [key: string]: unknown;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// --- Generated File Tree ---
export interface TreeEntry {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: TreeEntry[];
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// --- Connection Rule ---
export interface ConnectionRule {
  source: ClaudeNodeType;
  target: ClaudeNodeType;
  allowed: boolean;
  effect: string;
}

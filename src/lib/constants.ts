import { ClaudeNodeType, HookEventType } from './types';

// --- Node Type Definitions ---
export interface NodeTypeConfig {
  type: ClaudeNodeType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  category: 'core' | 'config' | 'advanced';
}

export const NODE_TYPES: Record<ClaudeNodeType, NodeTypeConfig> = {
  chef: {
    type: 'chef',
    label: 'Chef (Orchestrator)',
    description: 'Proje root — CLAUDE.md & settings',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    icon: '👨‍🍳',
    category: 'core',
  },
  agent: {
    type: 'agent',
    label: 'Agent',
    description: 'Subagent — .claude/agents/*.md',
    color: '#2563eb',
    bgColor: '#eff6ff',
    icon: '🤖',
    category: 'core',
  },
  skill: {
    type: 'skill',
    label: 'Skill',
    description: 'Yetenek — .claude/skills/*/SKILL.md',
    color: '#059669',
    bgColor: '#ecfdf5',
    icon: '⚡',
    category: 'core',
  },
  command: {
    type: 'command',
    label: 'Command',
    description: 'Slash command — .claude/commands/*.md',
    color: '#0891b2',
    bgColor: '#ecfeff',
    icon: '💻',
    category: 'core',
  },
  tool: {
    type: 'tool',
    label: 'Tool Permission',
    description: 'Araç izni — settings.json permissions',
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: '🔧',
    category: 'config',
  },
  mcp: {
    type: 'mcp',
    label: 'MCP Server',
    description: 'MCP server — .mcp.json',
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '🔌',
    category: 'config',
  },
  hook: {
    type: 'hook',
    label: 'Hook',
    description: 'Lifecycle hook — settings.json hooks',
    color: '#9333ea',
    bgColor: '#faf5ff',
    icon: '🪝',
    category: 'config',
  },
  memory: {
    type: 'memory',
    label: 'Memory',
    description: 'Bellek — MEMORY.md',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    icon: '🧠',
    category: 'config',
  },
  log: {
    type: 'log',
    label: 'Log',
    description: 'Log dosyası',
    color: '#6b7280',
    bgColor: '#f9fafb',
    icon: '📋',
    category: 'config',
  },
  rule: {
    type: 'rule',
    label: 'Rule',
    description: 'Kural — .claude/rules/*.md',
    color: '#ea580c',
    bgColor: '#fff7ed',
    icon: '📏',
    category: 'config',
  },
  plugin: {
    type: 'plugin',
    label: 'Plugin',
    description: 'Plugin — .claude-plugin/',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    icon: '🧩',
    category: 'advanced',
  },
  env: {
    type: 'env',
    label: 'Env Variables',
    description: 'Ortam değişkenleri — settings.json env',
    color: '#65a30d',
    bgColor: '#f7fee7',
    icon: '🔐',
    category: 'config',
  },
  team: {
    type: 'team',
    label: 'Team',
    description: 'Agent Teams — çoklu agent oturumu',
    color: '#0d9488',
    bgColor: '#f0fdfa',
    icon: '👥',
    category: 'advanced',
  },
};

// --- Node Categories ---
export const NODE_CATEGORIES = [
  { key: 'core', label: 'Temel', types: ['chef', 'agent', 'skill', 'command'] as ClaudeNodeType[] },
  { key: 'config', label: 'Yapılandırma', types: ['tool', 'mcp', 'hook', 'memory', 'log', 'rule', 'env'] as ClaudeNodeType[] },
  { key: 'advanced', label: 'Gelişmiş', types: ['plugin', 'team'] as ClaudeNodeType[] },
];

// --- Hook Events ---
export const HOOK_EVENTS: { value: HookEventType; label: string; canBlock: boolean; matcherHint: string }[] = [
  { value: 'SessionStart', label: 'Session Start', canBlock: false, matcherHint: 'startup, resume, clear, compact' },
  { value: 'InstructionsLoaded', label: 'Instructions Loaded', canBlock: false, matcherHint: 'load_reason' },
  { value: 'UserPromptSubmit', label: 'User Prompt Submit', canBlock: true, matcherHint: '' },
  { value: 'PreToolUse', label: 'Pre Tool Use', canBlock: true, matcherHint: 'Bash, Edit|Write, mcp__*' },
  { value: 'PermissionRequest', label: 'Permission Request', canBlock: true, matcherHint: 'tool name' },
  { value: 'PostToolUse', label: 'Post Tool Use', canBlock: false, matcherHint: 'tool name' },
  { value: 'PostToolUseFailure', label: 'Post Tool Use Failure', canBlock: false, matcherHint: 'tool name' },
  { value: 'Notification', label: 'Notification', canBlock: false, matcherHint: 'notification type' },
  { value: 'SubagentStart', label: 'Subagent Start', canBlock: false, matcherHint: 'agent type' },
  { value: 'SubagentStop', label: 'Subagent Stop', canBlock: true, matcherHint: 'agent type' },
  { value: 'Stop', label: 'Stop', canBlock: true, matcherHint: '' },
  { value: 'StopFailure', label: 'Stop Failure', canBlock: false, matcherHint: 'error type' },
  { value: 'TeammateIdle', label: 'Teammate Idle', canBlock: true, matcherHint: '' },
  { value: 'TaskCompleted', label: 'Task Completed', canBlock: true, matcherHint: '' },
  { value: 'ConfigChange', label: 'Config Change', canBlock: true, matcherHint: 'config source' },
  { value: 'WorktreeCreate', label: 'Worktree Create', canBlock: true, matcherHint: '' },
  { value: 'WorktreeRemove', label: 'Worktree Remove', canBlock: false, matcherHint: '' },
  { value: 'PreCompact', label: 'Pre Compact', canBlock: false, matcherHint: 'manual, auto' },
  { value: 'PostCompact', label: 'Post Compact', canBlock: false, matcherHint: 'manual, auto' },
  { value: 'Elicitation', label: 'Elicitation', canBlock: true, matcherHint: 'MCP server name' },
  { value: 'ElicitationResult', label: 'Elicitation Result', canBlock: true, matcherHint: 'MCP server name' },
  { value: 'SessionEnd', label: 'Session End', canBlock: false, matcherHint: 'exit reason' },
];

// --- Available Tools ---
export const AVAILABLE_TOOLS = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash',
  'WebFetch', 'WebSearch', 'Agent', 'TodoWrite',
  'NotebookEdit', 'AskUserQuestion',
];

// --- Models ---
export const AVAILABLE_MODELS = [
  { value: 'sonnet', label: 'Sonnet (claude-sonnet-4-6)' },
  { value: 'opus', label: 'Opus (claude-opus-4-6)' },
  { value: 'haiku', label: 'Haiku (claude-haiku-4-5)' },
  { value: 'inherit', label: 'Inherit (parent model)' },
];

// --- Permission Modes ---
export const PERMISSION_MODES = [
  { value: 'default', label: 'Default — Standard permission prompts' },
  { value: 'acceptEdits', label: 'Accept Edits — Auto-accept file edits' },
  { value: 'dontAsk', label: "Don't Ask — Auto-deny prompts" },
  { value: 'bypassPermissions', label: 'Bypass — Skip all prompts' },
  { value: 'plan', label: 'Plan — Read-only mode' },
];

// --- Effort Levels ---
export const EFFORT_LEVELS = [
  { value: 'low', label: 'Low — Fast, cheaper' },
  { value: 'medium', label: 'Medium — Balanced' },
  { value: 'high', label: 'High — More thorough' },
  { value: 'max', label: 'Max — Maximum (Opus 4.6 only)' },
];

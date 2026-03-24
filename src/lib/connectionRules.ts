import { ClaudeNodeType, ConnectionRule } from './types';

// Connection rules: which source node type can connect to which target
const rules: ConnectionRule[] = [
  // Agent → Chef
  { source: 'agent', target: 'chef', allowed: true, effect: 'Agent becomes a project-level agent' },
  // Skill → Agent
  { source: 'skill', target: 'agent', allowed: true, effect: 'Skill added to agent skills list' },
  // Skill → Chef (project-level skill)
  { source: 'skill', target: 'chef', allowed: true, effect: 'Skill added to project skills' },
  // Command → Agent
  { source: 'command', target: 'agent', allowed: true, effect: 'Command available to agent' },
  // Command → Chef
  { source: 'command', target: 'chef', allowed: true, effect: 'Command added to project' },
  // Tool → Agent
  { source: 'tool', target: 'agent', allowed: true, effect: 'Tool permission added to agent' },
  // Tool → Chef
  { source: 'tool', target: 'chef', allowed: true, effect: 'Tool permission added to settings.json' },
  // MCP → Agent
  { source: 'mcp', target: 'agent', allowed: true, effect: 'MCP server scoped to agent' },
  // MCP → Chef
  { source: 'mcp', target: 'chef', allowed: true, effect: 'MCP server added to .mcp.json' },
  // Hook → Agent
  { source: 'hook', target: 'agent', allowed: true, effect: 'Hook added to agent hooks config' },
  // Hook → Chef
  { source: 'hook', target: 'chef', allowed: true, effect: 'Hook added to settings.json hooks' },
  // Memory → Agent
  { source: 'memory', target: 'agent', allowed: true, effect: 'Memory scope set for agent' },
  // Log → Agent
  { source: 'log', target: 'agent', allowed: true, effect: 'Log file created for agent' },
  // Rule → Chef
  { source: 'rule', target: 'chef', allowed: true, effect: 'Rule file added to .claude/rules/' },
  // Env → Chef
  { source: 'env', target: 'chef', allowed: true, effect: 'Env vars added to settings.json' },
  // Plugin → Chef
  { source: 'plugin', target: 'chef', allowed: true, effect: 'Plugin structure created' },
  // Team → Agent (multiple agents can connect to a team)
  { source: 'agent', target: 'team', allowed: true, effect: 'Agent added to team' },
  // Team → Chef
  { source: 'team', target: 'chef', allowed: true, effect: 'Team configured for project' },
];

export function isValidConnection(sourceType: ClaudeNodeType, targetType: ClaudeNodeType): boolean {
  return rules.some(r => r.source === sourceType && r.target === targetType && r.allowed);
}

export function getConnectionEffect(sourceType: ClaudeNodeType, targetType: ClaudeNodeType): string | null {
  const rule = rules.find(r => r.source === sourceType && r.target === targetType && r.allowed);
  return rule?.effect ?? null;
}

export function getValidTargets(sourceType: ClaudeNodeType): ClaudeNodeType[] {
  return rules.filter(r => r.source === sourceType && r.allowed).map(r => r.target);
}

export function getValidSources(targetType: ClaudeNodeType): ClaudeNodeType[] {
  return rules.filter(r => r.target === targetType && r.allowed).map(r => r.source);
}

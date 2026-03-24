import JSZip from 'jszip';
import {
  type ClaudeNodeType, type NodeDataMap,
  type AgentData, type SkillData, type McpData,
  type HookData, type RuleData, type CommandData,
  type ChefData,
} from '@/lib/types';
import {
  createDefaultChef, createDefaultAgent, createDefaultSkill,
  createDefaultMcp, createDefaultHook, createDefaultRule,
  createDefaultCommand, getNextId, getDefaultLabel,
} from '@/lib/templates';
import { type AppNode } from '@/store/useProjectStore';
import { type Edge } from '@xyflow/react';

interface ImportResult {
  nodes: AppNode[];
  edges: Edge[];
  projectName: string;
}

function createNode(type: ClaudeNodeType, config: NodeDataMap[ClaudeNodeType], x: number, y: number): AppNode {
  return {
    id: getNextId(),
    type,
    position: { x, y },
    data: {
      label: getDefaultLabel(type, config),
      nodeType: type,
      config,
    },
  };
}

export async function importFromZip(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);
  const nodes: AppNode[] = [];
  const edges: Edge[] = [];
  let projectName = 'imported-project';

  // Find root directory name
  const paths = Object.keys(zip.files);
  const rootDir = paths[0]?.split('/')[0] || '';
  if (rootDir) projectName = rootDir;

  const prefix = rootDir ? `${rootDir}/` : '';

  // Helper to read file content
  async function readFile(path: string): Promise<string | null> {
    const file = zip.file(prefix + path) || zip.file(path);
    if (!file) return null;
    return await file.async('string');
  }

  // 1. Parse CLAUDE.md → Chef node
  const claudeMd = await readFile('CLAUDE.md');
  const chefConfig: ChefData = {
    ...createDefaultChef(),
    projectName,
    persona: claudeMd || createDefaultChef().persona,
  };

  // Parse settings.json
  const settingsRaw = await readFile('.claude/settings.json');
  if (settingsRaw) {
    try {
      const settings = JSON.parse(settingsRaw);
      if (settings.permissions) {
        chefConfig.permissions = {
          mode: settings.permissions.mode || 'default',
          allow: settings.permissions.allow || [],
          deny: settings.permissions.deny || [],
        };
      }
      if (settings.env) chefConfig.env = settings.env;
      if (settings.sandbox) chefConfig.sandbox = settings.sandbox;
      if (settings.autoMemoryEnabled !== undefined) chefConfig.autoMemoryEnabled = settings.autoMemoryEnabled;
    } catch {}
  }

  const chefNode = createNode('chef', chefConfig, 400, 50);
  nodes.push(chefNode);

  let yOffset = 250;
  let xOffset = 100;

  // 2. Parse agents
  const agentFiles = Object.keys(zip.files)
    .filter((p) => p.includes('.claude/agents/') && p.endsWith('.md'))
    .map((p) => p.split('/').pop()!);

  for (const agentFile of agentFiles) {
    const content = await readFile(`.claude/agents/${agentFile}`);
    if (!content) continue;

    const agentConfig = parseAgentMd(content, agentFile.replace('.md', ''));
    const agentNode = createNode('agent', agentConfig, xOffset, yOffset);
    nodes.push(agentNode);

    // Connect agent to chef
    edges.push({
      id: `edge_${agentNode.id}_${chefNode.id}`,
      source: agentNode.id,
      target: chefNode.id,
    });

    xOffset += 300;
    if (xOffset > 900) { xOffset = 100; yOffset += 200; }
  }

  // 3. Parse skills
  yOffset += 200;
  xOffset = 100;
  const skillDirs = Object.keys(zip.files)
    .filter((p) => p.includes('.claude/skills/') && p.endsWith('SKILL.md'))
    .map((p) => {
      const parts = p.split('/');
      return parts[parts.indexOf('skills') + 1];
    });

  for (const skillDir of skillDirs) {
    const content = await readFile(`.claude/skills/${skillDir}/SKILL.md`);
    if (!content) continue;

    const skillConfig = parseSkillMd(content, skillDir);
    const skillNode = createNode('skill', skillConfig, xOffset, yOffset);
    nodes.push(skillNode);

    xOffset += 300;
    if (xOffset > 900) { xOffset = 100; yOffset += 200; }
  }

  // 4. Parse commands
  const cmdFiles = Object.keys(zip.files)
    .filter((p) => p.includes('.claude/commands/') && p.endsWith('.md'))
    .map((p) => p.split('/').pop()!);

  for (const cmdFile of cmdFiles) {
    const content = await readFile(`.claude/commands/${cmdFile}`);
    if (!content) continue;

    const cmdConfig: CommandData = {
      ...createDefaultCommand(cmdFile.replace('.md', '')),
      name: cmdFile.replace('.md', ''),
      content,
    };
    const cmdNode = createNode('command', cmdConfig, xOffset, yOffset);
    nodes.push(cmdNode);

    xOffset += 300;
    if (xOffset > 900) { xOffset = 100; yOffset += 200; }
  }

  // 5. Parse .mcp.json
  const mcpRaw = await readFile('.mcp.json');
  if (mcpRaw) {
    try {
      const mcpConfig = JSON.parse(mcpRaw);
      if (mcpConfig.mcpServers) {
        yOffset += 200;
        xOffset = 100;
        for (const [serverName, serverConfig] of Object.entries(mcpConfig.mcpServers)) {
          const cfg = serverConfig as Record<string, unknown>;
          const mcpData: McpData = {
            ...createDefaultMcp(serverName),
            serverName,
            type: (cfg.type as McpData['type']) || 'stdio',
            command: cfg.command as string,
            args: cfg.args as string[],
            url: cfg.url as string,
            env: cfg.env as Record<string, string>,
          };
          const mcpNode = createNode('mcp', mcpData, xOffset, yOffset);
          nodes.push(mcpNode);

          // Connect to chef
          edges.push({
            id: `edge_${mcpNode.id}_${chefNode.id}`,
            source: mcpNode.id,
            target: chefNode.id,
          });

          xOffset += 300;
        }
      }
    } catch {}
  }

  // 6. Parse rules
  const ruleFiles = Object.keys(zip.files)
    .filter((p) => p.includes('.claude/rules/') && p.endsWith('.md'))
    .map((p) => p.split('/').pop()!);

  if (ruleFiles.length > 0) {
    yOffset += 200;
    xOffset = 100;
    for (const ruleFile of ruleFiles) {
      const content = await readFile(`.claude/rules/${ruleFile}`);
      if (!content) continue;

      const ruleConfig = parseRuleMd(content, ruleFile.replace('.md', ''));
      const ruleNode = createNode('rule', ruleConfig, xOffset, yOffset);
      nodes.push(ruleNode);

      edges.push({
        id: `edge_${ruleNode.id}_${chefNode.id}`,
        source: ruleNode.id,
        target: chefNode.id,
      });

      xOffset += 300;
    }
  }

  return { nodes, edges, projectName };
}

// --- Parsers ---

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split('\n');
  let currentKey = '';

  for (const line of lines) {
    const kvMatch = line.match(/^(\S+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value.startsWith('[') || value.startsWith('{')) {
        try { frontmatter[currentKey] = JSON.parse(value); } catch { frontmatter[currentKey] = value; }
      } else if (value === 'true') frontmatter[currentKey] = true;
      else if (value === 'false') frontmatter[currentKey] = false;
      else if (value && !isNaN(Number(value))) frontmatter[currentKey] = Number(value);
      else if (value) frontmatter[currentKey] = value;
      else frontmatter[currentKey] = [];
    } else if (line.match(/^\s+-\s+(.*)$/)) {
      const item = line.match(/^\s+-\s+(.*)$/)![1];
      if (Array.isArray(frontmatter[currentKey])) {
        (frontmatter[currentKey] as string[]).push(item);
      }
    }
  }

  return { frontmatter, body: match[2].trim() };
}

function parseAgentMd(content: string, name: string): AgentData {
  const { frontmatter, body } = parseFrontmatter(content);
  const agent = createDefaultAgent(name);

  agent.name = (frontmatter.name as string) || name;
  agent.description = (frontmatter.description as string) || agent.description;
  agent.persona = body || agent.persona;
  if (frontmatter.tools) agent.tools = String(frontmatter.tools).split(',').map((s) => s.trim());
  if (frontmatter.disallowedTools) agent.disallowedTools = String(frontmatter.disallowedTools).split(',').map((s) => s.trim());
  if (frontmatter.model) agent.model = frontmatter.model as string;
  if (frontmatter.permissionMode) agent.permissionMode = frontmatter.permissionMode as AgentData['permissionMode'];
  if (frontmatter.maxTurns) agent.maxTurns = frontmatter.maxTurns as number;
  if (frontmatter.background) agent.background = frontmatter.background as boolean;
  if (frontmatter.effort) agent.effort = frontmatter.effort as AgentData['effort'];
  if (frontmatter.isolation) agent.isolation = frontmatter.isolation as 'worktree';
  if (frontmatter.memory) agent.memory = frontmatter.memory as AgentData['memory'];
  if (frontmatter.skills) agent.skillNames = frontmatter.skills as string[];
  if (frontmatter.mcpServers) agent.mcpServerNames = (frontmatter.mcpServers as string[]).filter((s) => typeof s === 'string');

  return agent;
}

function parseSkillMd(content: string, name: string): SkillData {
  const { frontmatter, body } = parseFrontmatter(content);
  const skill = createDefaultSkill(name);

  skill.name = (frontmatter.name as string) || name;
  skill.description = (frontmatter.description as string) || skill.description;
  skill.content = body || skill.content;
  if (frontmatter['argument-hint']) skill.argumentHint = frontmatter['argument-hint'] as string;
  if (frontmatter['allowed-tools']) skill.allowedTools = String(frontmatter['allowed-tools']).split(',').map((s) => s.trim());
  if (frontmatter.model) skill.model = frontmatter.model as string;
  if (frontmatter.effort) skill.effort = frontmatter.effort as SkillData['effort'];
  if (frontmatter.context) skill.context = frontmatter.context as 'fork';
  if (frontmatter.agent) skill.agent = frontmatter.agent as string;
  if (frontmatter['disable-model-invocation']) skill.disableModelInvocation = true;
  if (frontmatter['user-invocable'] === false) skill.userInvocable = false;

  return skill;
}

function parseRuleMd(content: string, name: string): RuleData {
  const { frontmatter, body } = parseFrontmatter(content);
  const rule = createDefaultRule(name);

  rule.name = name;
  rule.content = body || content;
  if (frontmatter.paths) {
    rule.paths = frontmatter.paths as string[];
    rule.isPathSpecific = true;
  }

  return rule;
}

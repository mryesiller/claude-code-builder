import { useProjectStore, AppNode, AppEdge } from './useProjectStore';
import {
  TreeEntry, ClaudeNodeType, AgentData, SkillData, CommandData,
  McpData, HookData, MemoryData, RuleData, PluginData, EnvData,
  ChefData, ToolData, LogData, TeamData,
} from '@/lib/types';

// Get all nodes connected to a target node (incoming edges)
function getConnectedSources(nodeId: string, edges: AppEdge[], nodes: AppNode[]): AppNode[] {
  return edges
    .filter((e) => e.target === nodeId)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter(Boolean) as AppNode[];
}

// Get all nodes a source connects to (outgoing edges)
function getConnectedTargets(nodeId: string, edges: AppEdge[], nodes: AppNode[]): AppNode[] {
  return edges
    .filter((e) => e.source === nodeId)
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter(Boolean) as AppNode[];
}

function getNodesByType(nodes: AppNode[], type: ClaudeNodeType): AppNode[] {
  return nodes.filter((n) => n.data.nodeType === type);
}

// --- Build CLAUDE.md with agent orchestration relationships ---
function buildClaudeMd(chefData: ChefData, chefNode: AppNode, nodes: AppNode[], edges: AppEdge[]): string {
  const sections: string[] = [];

  // User-written persona (the core CLAUDE.md content)
  if (chefData.persona.trim()) {
    sections.push(chefData.persona.trim());
  }

  // Find all agents connected to chef
  const connectedAgents = getConnectedSources(chefNode.id, edges, nodes)
    .filter((n) => n.data.nodeType === 'agent');

  if (connectedAgents.length === 0) return sections.join('\n\n');

  // --- Agent Orchestration Section ---
  const orchestrationLines: string[] = [
    '## Agent Orchestration',
    '',
    `This project uses ${connectedAgents.length} specialized agent${connectedAgents.length > 1 ? 's' : ''} that work together under the main orchestrator.`,
    '',
    '### Available Agents',
    '',
  ];

  connectedAgents.forEach((agentNode) => {
    const agent = agentNode.data.config as AgentData;
    orchestrationLines.push(`#### \`${agent.name}\``);
    if (agent.description) orchestrationLines.push(`- **Purpose**: ${agent.description}`);
    if (agent.model && agent.model !== 'inherit') orchestrationLines.push(`- **Model**: ${agent.model}`);
    if (agent.tools.length > 0) orchestrationLines.push(`- **Tools**: ${agent.tools.join(', ')}`);

    // Find skills connected to this agent
    const agentSkills = getConnectedSources(agentNode.id, edges, nodes)
      .filter((n) => n.data.nodeType === 'skill');
    if (agentSkills.length > 0) {
      orchestrationLines.push(`- **Skills**: ${agentSkills.map((s) => (s.data.config as SkillData).name).join(', ')}`);
    }

    // Find MCP servers connected to this agent
    const agentMcps = getConnectedSources(agentNode.id, edges, nodes)
      .filter((n) => n.data.nodeType === 'mcp');
    if (agentMcps.length > 0) {
      orchestrationLines.push(`- **MCP Servers**: ${agentMcps.map((m) => (m.data.config as McpData).serverName).join(', ')}`);
    }

    // Find hooks connected to this agent
    const agentHooks = getConnectedSources(agentNode.id, edges, nodes)
      .filter((n) => n.data.nodeType === 'hook');
    if (agentHooks.length > 0) {
      orchestrationLines.push(`- **Hooks**: ${agentHooks.map((h) => `${(h.data.config as HookData).event}`).join(', ')}`);
    }

    // Find memory connected to this agent
    const agentMemory = getConnectedSources(agentNode.id, edges, nodes)
      .filter((n) => n.data.nodeType === 'memory');
    if (agentMemory.length > 0) {
      orchestrationLines.push(`- **Memory**: ${agentMemory.map((m) => (m.data.config as MemoryData).scope).join(', ')}`);
    }

    orchestrationLines.push('');
  });

  // --- Agent Delegation Guide ---
  orchestrationLines.push('### Delegation Guide', '');
  orchestrationLines.push('Use the following agents for these tasks:', '');

  connectedAgents.forEach((agentNode) => {
    const agent = agentNode.data.config as AgentData;
    orchestrationLines.push(`- **${agent.name}**: ${agent.description || agent.persona.split('\n')[0] || 'Specialized agent'}`);
  });

  orchestrationLines.push('');

  // --- MCP Servers connected directly to chef ---
  const chefMcps = getConnectedSources(chefNode.id, edges, nodes)
    .filter((n) => n.data.nodeType === 'mcp');
  if (chefMcps.length > 0) {
    orchestrationLines.push('### Project-Level MCP Servers', '');
    chefMcps.forEach((m) => {
      const mcp = m.data.config as McpData;
      orchestrationLines.push(`- **${mcp.serverName}** (\`${mcp.type}\`): ${mcp.type === 'stdio' ? mcp.command : mcp.url}`);
    });
    orchestrationLines.push('');
  }

  // --- Rules ---
  const ruleNodes = getNodesByType(nodes, 'rule');
  if (ruleNodes.length > 0) {
    orchestrationLines.push('### Project Rules', '');
    ruleNodes.forEach((r) => {
      const rule = r.data.config as RuleData;
      const pathInfo = rule.paths && rule.paths.length > 0 ? ` (applies to: \`${rule.paths.join('`, `')}\`)` : ' (global)';
      orchestrationLines.push(`- **${rule.name}**${pathInfo}`);
    });
    orchestrationLines.push('');
  }

  sections.push(orchestrationLines.join('\n'));

  return sections.join('\n\n');
}

export function buildFileTree(nodes: AppNode[], edges: AppEdge[], projectName: string): TreeEntry {
  const chefNodes = getNodesByType(nodes, 'chef');
  const chef = chefNodes[0];
  const rootName = chef ? (chef.data.config as ChefData).projectName : projectName;

  const root: TreeEntry = {
    name: rootName,
    type: 'directory',
    children: [],
  };

  // --- CLAUDE.md ---
  if (chef) {
    const chefData = chef.data.config as ChefData;
    const claudeMdContent = buildClaudeMd(chefData, chef, nodes, edges);
    root.children!.push({
      name: 'CLAUDE.md',
      type: 'file',
      content: claudeMdContent,
    });
  }

  // --- .claude/ directory ---
  const claudeDir: TreeEntry = {
    name: '.claude',
    type: 'directory',
    children: [],
  };

  // --- settings.json ---
  const settingsContent = buildSettingsJson(nodes, edges, chef);
  claudeDir.children!.push({
    name: 'settings.json',
    type: 'file',
    content: JSON.stringify(settingsContent, null, 2),
  });

  // --- agents/ ---
  const agentNodes = getNodesByType(nodes, 'agent');
  if (agentNodes.length > 0) {
    const agentsDir: TreeEntry = {
      name: 'agents',
      type: 'directory',
      children: agentNodes.map((n) => {
        const agent = n.data.config as AgentData;
        return {
          name: `${agent.name}.md`,
          type: 'file' as const,
          content: buildAgentMd(agent),
        };
      }),
    };
    claudeDir.children!.push(agentsDir);
  }

  // --- skills/ ---
  const skillNodes = getNodesByType(nodes, 'skill');
  if (skillNodes.length > 0) {
    const skillsDir: TreeEntry = {
      name: 'skills',
      type: 'directory',
      children: skillNodes.map((n) => {
        const skill = n.data.config as SkillData;
        const skillDir: TreeEntry = {
          name: skill.name,
          type: 'directory',
          children: [
            {
              name: 'SKILL.md',
              type: 'file',
              content: buildSkillMd(skill),
            },
          ],
        };
        // Supporting files
        skill.supportingFiles.forEach((f) => {
          skillDir.children!.push({
            name: f.path,
            type: 'file',
            content: f.content,
          });
        });
        return skillDir;
      }),
    };
    claudeDir.children!.push(skillsDir);
  }

  // --- commands/ ---
  const cmdNodes = getNodesByType(nodes, 'command');
  if (cmdNodes.length > 0) {
    const cmdsDir: TreeEntry = {
      name: 'commands',
      type: 'directory',
      children: cmdNodes.map((n) => {
        const cmd = n.data.config as CommandData;
        return {
          name: `${cmd.name}.md`,
          type: 'file' as const,
          content: cmd.content,
        };
      }),
    };
    claudeDir.children!.push(cmdsDir);
  }

  // --- rules/ ---
  const ruleNodes = getNodesByType(nodes, 'rule');
  if (ruleNodes.length > 0) {
    const rulesDir: TreeEntry = {
      name: 'rules',
      type: 'directory',
      children: ruleNodes.map((n) => {
        const rule = n.data.config as RuleData;
        let content = '';
        if (rule.isPathSpecific && rule.paths && rule.paths.length > 0) {
          content = `---\npaths:\n${rule.paths.map((p) => `  - "${p}"`).join('\n')}\n---\n\n`;
        }
        content += rule.content;
        return {
          name: `${rule.name}.md`,
          type: 'file' as const,
          content,
        };
      }),
    };
    claudeDir.children!.push(rulesDir);
  }

  // --- agent-memory/ ---
  const memoryNodes = getNodesByType(nodes, 'memory');
  const agentMemoryConnections = memoryNodes.filter((m) => {
    return edges.some((e) => e.source === m.id && nodes.find((n) => n.id === e.target)?.data.nodeType === 'agent');
  });
  if (agentMemoryConnections.length > 0) {
    const memDir: TreeEntry = {
      name: 'agent-memory',
      type: 'directory',
      children: [],
    };
    agentMemoryConnections.forEach((memNode) => {
      const mem = memNode.data.config as MemoryData;
      const connectedAgents = getConnectedTargets(memNode.id, edges, nodes).filter(
        (n) => n.data.nodeType === 'agent'
      );
      connectedAgents.forEach((agentNode) => {
        const agent = agentNode.data.config as AgentData;
        memDir.children!.push({
          name: agent.name,
          type: 'directory',
          children: [
            {
              name: 'MEMORY.md',
              type: 'file',
              content: mem.initialContent,
            },
          ],
        });
      });
    });
    claudeDir.children!.push(memDir);
  }

  root.children!.push(claudeDir);

  // --- .mcp.json ---
  const mcpNodes = getNodesByType(nodes, 'mcp');
  if (mcpNodes.length > 0) {
    const mcpConfig: Record<string, object> = {};
    mcpNodes.forEach((n) => {
      const mcp = n.data.config as McpData;
      if (mcp.type === 'stdio') {
        mcpConfig[mcp.serverName] = {
          type: 'stdio',
          command: mcp.command,
          args: mcp.args,
          ...(mcp.env && Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
        };
      } else {
        mcpConfig[mcp.serverName] = {
          type: mcp.type,
          url: mcp.url,
          ...(mcp.env && Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
        };
      }
    });
    root.children!.push({
      name: '.mcp.json',
      type: 'file',
      content: JSON.stringify({ mcpServers: mcpConfig }, null, 2),
    });
  }

  // --- .claude-plugin/ ---
  const pluginNodes = getNodesByType(nodes, 'plugin');
  if (pluginNodes.length > 0) {
    pluginNodes.forEach((n) => {
      const plugin = n.data.config as PluginData;
      const connectedToPlugin = getConnectedSources(n.id, edges, nodes);
      const pluginDir: TreeEntry = {
        name: '.claude-plugin',
        type: 'directory',
        children: [
          {
            name: 'plugin.json',
            type: 'file',
            content: JSON.stringify({
              name: plugin.name,
              description: plugin.description,
              version: plugin.version,
            }, null, 2),
          },
        ],
      };
      if (plugin.includeSkills) {
        const pluginSkills = connectedToPlugin.filter((c) => c.data.nodeType === 'skill');
        pluginDir.children!.push({
          name: 'skills',
          type: 'directory',
          children: pluginSkills.map((s) => {
            const skill = s.data.config as SkillData;
            return {
              name: skill.name,
              type: 'directory' as const,
              children: [{ name: 'SKILL.md', type: 'file' as const, content: buildSkillMd(skill) }],
            };
          }),
        });
      }
      if (plugin.includeAgents) {
        const pluginAgents = connectedToPlugin.filter((c) => c.data.nodeType === 'agent');
        pluginDir.children!.push({
          name: 'agents',
          type: 'directory' as const,
          children: pluginAgents.map((a) => {
            const agent = a.data.config as AgentData;
            return { name: `${agent.name}.md`, type: 'file' as const, content: buildAgentMd(agent) };
          }),
        });
      }
      if (plugin.includeHooks) {
        const pluginHooks = connectedToPlugin.filter((c) => c.data.nodeType === 'hook');
        const hooksConfig: Record<string, object[]> = {};
        pluginHooks.forEach((h) => {
          const hook = h.data.config as HookData;
          if (!hooksConfig[hook.event]) hooksConfig[hook.event] = [];
          hooksConfig[hook.event].push({
            ...(hook.matcher ? { matcher: hook.matcher } : {}),
            hooks: [{ type: hook.hookType, ...(hook.command ? { command: hook.command } : {}), ...(hook.url ? { url: hook.url } : {}) }],
          });
        });
        pluginDir.children!.push({
          name: 'hooks',
          type: 'directory',
          children: [{ name: 'hooks.json', type: 'file', content: JSON.stringify(hooksConfig, null, 2) }],
        });
      }
      if (plugin.includeMcp) {
        const pluginMcps = connectedToPlugin.filter((c) => c.data.nodeType === 'mcp');
        const mcpConfig: Record<string, object> = {};
        pluginMcps.forEach((m) => {
          const mcp = m.data.config as McpData;
          mcpConfig[mcp.serverName] = mcp.type === 'stdio'
            ? { type: 'stdio', command: mcp.command, args: mcp.args }
            : { type: mcp.type, url: mcp.url };
        });
        pluginDir.children!.push({ name: '.mcp.json', type: 'file', content: JSON.stringify({ mcpServers: mcpConfig }, null, 2) });
      }
      root.children!.push(pluginDir);
    });
  }

  // --- Log directories ---
  const logNodes = getNodesByType(nodes, 'log');
  logNodes.forEach((n) => {
    const log = n.data.config as LogData;
    root.children!.push({
      name: log.directory,
      type: 'directory',
      children: [
        { name: '.gitkeep', type: 'file', content: '' },
      ],
    });
  });

  // --- Teams (experimental — generates CLAUDE.md section) ---
  const teamNodes = getNodesByType(nodes, 'team');
  if (teamNodes.length > 0) {
    const teamsDir: TreeEntry = {
      name: 'teams',
      type: 'directory',
      children: teamNodes.map((n) => {
        const team = n.data.config as TeamData;
        const content = [
          `# Team: ${team.name}`,
          '',
          team.description,
          '',
          `## Agents`,
          ...team.agentNames.map((a) => `- ${a}`),
          '',
          `## Mode`,
          `Display: ${team.displayMode}`,
        ].join('\n');
        return { name: `${team.name}.md`, type: 'file' as const, content };
      }),
    };
    claudeDir.children!.push(teamsDir);
  }

  // --- Placeholder directories ---
  root.children!.push({ name: 'src', type: 'directory', children: [] });
  root.children!.push({ name: 'tests', type: 'directory', children: [] });
  root.children!.push({ name: 'docs', type: 'directory', children: [] });
  root.children!.push({ name: 'scripts', type: 'directory', children: [] });

  return root;
}

// --- Build settings.json ---
function buildSettingsJson(nodes: AppNode[], edges: AppEdge[], chef?: AppNode): object {
  const settings: Record<string, unknown> = {};

  // Permissions from chef
  if (chef) {
    const chefData = chef.data.config as ChefData;
    if (chefData.permissions.allow.length > 0 || chefData.permissions.deny.length > 0) {
      settings.permissions = {
        mode: chefData.permissions.mode,
        allow: chefData.permissions.allow,
        deny: chefData.permissions.deny,
      };
    }
    if (Object.keys(chefData.env).length > 0) {
      settings.env = chefData.env;
    }
    if (chefData.sandbox.enabled) {
      settings.sandbox = chefData.sandbox;
    }
    settings.autoMemoryEnabled = chefData.autoMemoryEnabled;
  }

  // Tool permissions connected to chef
  const toolNodes = nodes.filter((n) => n.data.nodeType === 'tool');
  const chefToolNodes = chef
    ? toolNodes.filter((t) => edges.some((e) => e.source === t.id && e.target === chef.id))
    : toolNodes;
  if (chefToolNodes.length > 0) {
    if (!settings.permissions) {
      settings.permissions = { mode: 'default', allow: [] as string[], deny: [] as string[] };
    }
    const perms = settings.permissions as { allow: string[]; deny: string[] };
    chefToolNodes.forEach((t) => {
      const tool = t.data.config as ToolData;
      if (tool.scope === 'allow') perms.allow.push(tool.pattern);
      else perms.deny.push(tool.pattern);
    });
  }

  // Hooks connected to chef (or unconnected hooks go to settings.json too)
  const hookNodes = nodes.filter((n) => n.data.nodeType === 'hook');
  const chefHookNodes = chef
    ? hookNodes.filter((h) => {
        const isConnectedToAgent = edges.some((e) => e.source === h.id && nodes.find((n) => n.id === e.target)?.data.nodeType === 'agent');
        const isConnectedToChef = edges.some((e) => e.source === h.id && e.target === chef.id);
        return isConnectedToChef || !isConnectedToAgent;
      })
    : hookNodes;
  if (chefHookNodes.length > 0) {
    const hooks: Record<string, object[]> = {};
    chefHookNodes.forEach((h) => {
      const hook = h.data.config as HookData;
      if (!hooks[hook.event]) hooks[hook.event] = [];
      hooks[hook.event].push({
        ...(hook.matcher ? { matcher: hook.matcher } : {}),
        hooks: [{
          type: hook.hookType,
          ...(hook.command ? { command: hook.command } : {}),
          ...(hook.url ? { url: hook.url } : {}),
          ...(hook.prompt ? { prompt: hook.prompt } : {}),
          ...(hook.timeout ? { timeout: hook.timeout } : {}),
        }],
      });
    });
    settings.hooks = hooks;
  }

  // Env nodes connected to chef
  const envNodes = nodes.filter((n) => n.data.nodeType === 'env');
  const chefEnvNodes = chef
    ? envNodes.filter((e) => edges.some((ed) => ed.source === e.id && ed.target === chef.id))
    : envNodes;
  if (chefEnvNodes.length > 0) {
    const env = (settings.env as Record<string, string>) || {};
    chefEnvNodes.forEach((e) => {
      const envData = e.data.config as EnvData;
      Object.assign(env, envData.variables);
    });
    settings.env = env;
  }

  return settings;
}

// --- Build Agent .md ---
function buildAgentMd(agent: AgentData): string {
  const frontmatter: Record<string, unknown> = {
    name: agent.name,
    description: agent.description,
  };

  if (agent.tools.length > 0) frontmatter.tools = agent.tools.join(', ');
  if (agent.disallowedTools.length > 0) frontmatter.disallowedTools = agent.disallowedTools.join(', ');
  if (agent.model && agent.model !== 'inherit') frontmatter.model = agent.model;
  if (agent.permissionMode !== 'default') frontmatter.permissionMode = agent.permissionMode;
  if (agent.maxTurns) frontmatter.maxTurns = agent.maxTurns;
  if (agent.background) frontmatter.background = true;
  if (agent.effort !== 'medium') frontmatter.effort = agent.effort;
  if (agent.isolation) frontmatter.isolation = agent.isolation;
  if (agent.memory) frontmatter.memory = agent.memory;
  if (agent.skillNames.length > 0) frontmatter.skills = agent.skillNames;
  if (agent.mcpServerNames.length > 0) frontmatter.mcpServers = agent.mcpServerNames;
  if (Object.keys(agent.hooks).length > 0) frontmatter.hooks = agent.hooks;

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map((v) => `  - ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n')}`;
      }
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  return `---\n${yaml}\n---\n\n${agent.persona}`;
}

// --- Build Skill SKILL.md ---
function buildSkillMd(skill: SkillData): string {
  const frontmatter: Record<string, unknown> = {};

  if (skill.name) frontmatter.name = skill.name;
  if (skill.description) frontmatter.description = skill.description;
  if (skill.argumentHint) frontmatter['argument-hint'] = skill.argumentHint;
  if (skill.allowedTools.length > 0) frontmatter['allowed-tools'] = skill.allowedTools.join(', ');
  if (skill.model) frontmatter.model = skill.model;
  if (skill.effort) frontmatter.effort = skill.effort;
  if (skill.context) frontmatter.context = skill.context;
  if (skill.agent) frontmatter.agent = skill.agent;
  if (skill.disableModelInvocation) frontmatter['disable-model-invocation'] = true;
  if (!skill.userInvocable) frontmatter['user-invocable'] = false;
  if (Object.keys(skill.hooks).length > 0) frontmatter.hooks = skill.hooks;

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'object') return `${key}: ${JSON.stringify(value)}`;
      return `${key}: ${value}`;
    })
    .join('\n');

  return `---\n${yaml}\n---\n\n${skill.content}`;
}

// --- Custom hook to get file tree ---
export function useFileTree(): TreeEntry {
  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const projectName = useProjectStore((s) => s.projectName);
  return buildFileTree(nodes, edges, projectName);
}

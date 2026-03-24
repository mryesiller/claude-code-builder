'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type CommandData, type ToolData, type MemoryData,
  type LogData, type RuleData, type PluginData, type EnvData, type TeamData,
} from '@/lib/types';

export function GenericEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const { nodeType, config } = node.data;

  const update = (partial: Record<string, unknown>) => {
    updateNodeConfig(nodeId, partial);
  };

  switch (nodeType) {
    case 'command': {
      const c = config as CommandData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Command Name (kebab-case)</Label>
            <Input value={c.name} onChange={(e) => update({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={c.description} onChange={(e) => update({ description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Content (markdown)</Label>
            <Textarea value={c.content} onChange={(e) => update({ content: e.target.value })} rows={12} className="font-mono text-sm" />
          </div>
        </div>
      );
    }

    case 'tool': {
      const c = config as ToolData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tool Pattern</Label>
            <Input value={c.pattern} onChange={(e) => update({ pattern: e.target.value })} placeholder="Bash(npm run *)" />
          </div>
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={c.scope} onValueChange={(v) => v && update({ scope: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="deny">Deny</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    case 'memory': {
      const c = config as MemoryData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={c.scope} onValueChange={(v) => v && update({ scope: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="local">Local</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={c.isShared} onCheckedChange={(v) => update({ isShared: v })} />
            <Label>Shared (version controlled)</Label>
          </div>
          <div className="space-y-2">
            <Label>Initial Content</Label>
            <Textarea value={c.initialContent} onChange={(e) => update({ initialContent: e.target.value })} rows={10} className="font-mono text-sm" />
          </div>
        </div>
      );
    }

    case 'log': {
      const c = config as LogData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Log Name</Label>
            <Input value={c.name} onChange={(e) => update({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Directory</Label>
            <Input value={c.directory} onChange={(e) => update({ directory: e.target.value })} placeholder="logs" />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={c.format} onValueChange={(v) => v && update({ format: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jsonl">JSONL</SelectItem>
                <SelectItem value="txt">Plain text</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    case 'rule': {
      const c = config as RuleData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rule Name</Label>
            <Input value={c.name} onChange={(e) => update({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={c.isPathSpecific} onCheckedChange={(v) => update({ isPathSpecific: v })} />
            <Label>Path-Specific Rule</Label>
          </div>
          {c.isPathSpecific && (
            <div className="space-y-2">
              <Label>Paths (glob patterns, one per line)</Label>
              <Textarea
                value={(c.paths || []).join('\n')}
                onChange={(e) => update({ paths: e.target.value.split('\n').filter(Boolean) })}
                rows={3}
                className="font-mono text-sm"
                placeholder={'src/api/**/*.ts\nsrc/**/*.{ts,tsx}'}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Rule Content (markdown)</Label>
            <Textarea value={c.content} onChange={(e) => update({ content: e.target.value })} rows={10} className="font-mono text-sm" />
          </div>
        </div>
      );
    }

    case 'plugin': {
      const c = config as PluginData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plugin Name</Label>
            <Input value={c.name} onChange={(e) => update({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={c.description} onChange={(e) => update({ description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input value={c.version} onChange={(e) => update({ version: e.target.value })} placeholder="1.0.0" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Include:</p>
            <div className="flex items-center gap-2"><Switch checked={c.includeSkills} onCheckedChange={(v) => update({ includeSkills: v })} /><Label>Skills</Label></div>
            <div className="flex items-center gap-2"><Switch checked={c.includeAgents} onCheckedChange={(v) => update({ includeAgents: v })} /><Label>Agents</Label></div>
            <div className="flex items-center gap-2"><Switch checked={c.includeHooks} onCheckedChange={(v) => update({ includeHooks: v })} /><Label>Hooks</Label></div>
            <div className="flex items-center gap-2"><Switch checked={c.includeMcp} onCheckedChange={(v) => update({ includeMcp: v })} /><Label>MCP</Label></div>
          </div>
        </div>
      );
    }

    case 'env': {
      const c = config as EnvData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input value={c.label} onChange={(e) => update({ label: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Variables (KEY=VALUE, one per line)</Label>
            <Textarea
              value={Object.entries(c.variables).map(([k, v]) => `${k}=${v}`).join('\n')}
              onChange={(e) => {
                const variables: Record<string, string> = {};
                e.target.value.split('\n').filter(Boolean).forEach((line) => {
                  const idx = line.indexOf('=');
                  if (idx > 0) variables[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
                });
                update({ variables });
              }}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
    }

    case 'team': {
      const c = config as TeamData;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input value={c.name} onChange={(e) => update({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={c.description} onChange={(e) => update({ description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Display Mode</Label>
            <Select value={c.displayMode} onValueChange={(v) => v && update({ displayMode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in-process">In-Process</SelectItem>
                <SelectItem value="tmux">tmux</SelectItem>
                <SelectItem value="split-panes">Split Panes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Connected Agents</Label>
            <div className="text-sm text-gray-500">
              {c.agentNames.length === 0
                ? 'Connect Agent nodes to this Team node'
                : c.agentNames.join(', ')}
            </div>
          </div>
        </div>
      );
    }

    default:
      return <p className="text-sm text-gray-500">No editor available for this node type.</p>;
  }
}

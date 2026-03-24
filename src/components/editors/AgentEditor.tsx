'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { type AgentData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_MODELS, PERMISSION_MODES, EFFORT_LEVELS, AVAILABLE_TOOLS, NODE_TYPES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function AgentEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const removeEdge = useProjectStore((s) => s.removeEdge);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as AgentData;

  // Get actual connected nodes from edges
  const connectedNodes = edges
    .filter((e) => e.target === nodeId || e.source === nodeId)
    .map((e) => {
      const otherId = e.target === nodeId ? e.source : e.target;
      const otherNode = nodes.find((n) => n.id === otherId);
      return otherNode ? { edge: e, node: otherNode } : null;
    })
    .filter(Boolean) as { edge: { id: string; source: string; target: string }; node: (typeof nodes)[0] }[];

  const update = (partial: Partial<AgentData>) => {
    updateNodeConfig(nodeId, partial);
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="persona">Persona</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="connections">Connections</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div className="space-y-2">
          <Label>Agent Name (kebab-case)</Label>
          <Input
            value={config.name}
            onChange={(e) => update({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description (when to delegate)</Label>
          <Textarea
            value={config.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={config.model} onValueChange={(v) => v && update({ model: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Permission Mode</Label>
          <Select value={config.permissionMode} onValueChange={(v) => v && update({ permissionMode: v as AgentData['permissionMode'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERMISSION_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="persona" className="space-y-4">
        <div className="space-y-2">
          <Label>Agent Persona (markdown)</Label>
          <Textarea
            value={config.persona}
            onChange={(e) => update({ persona: e.target.value })}
            rows={16}
            className="font-mono text-sm"
          />
        </div>
      </TabsContent>

      <TabsContent value="tools" className="space-y-4">
        <div className="space-y-2">
          <Label>Allowed Tools</Label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TOOLS.map((tool) => (
              <Badge
                key={tool}
                variant={config.tools.includes(tool) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  if (config.tools.includes(tool)) {
                    update({ tools: config.tools.filter((t) => t !== tool) });
                  } else {
                    update({ tools: [...config.tools, tool] });
                  }
                }}
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Disallowed Tools (comma-separated)</Label>
          <Input
            value={config.disallowedTools.join(', ')}
            onChange={(e) => update({ disallowedTools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Write, Edit"
          />
        </div>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <div className="space-y-2">
          <Label>Effort Level</Label>
          <Select value={config.effort} onValueChange={(v) => v && update({ effort: v as AgentData['effort'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EFFORT_LEVELS.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Max Turns</Label>
          <Input
            type="number"
            value={config.maxTurns ?? ''}
            onChange={(e) => update({ maxTurns: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="No limit"
          />
        </div>
        <div className="space-y-2">
          <Label>Memory Scope</Label>
          <Select value={config.memory || 'none'} onValueChange={(v) => v && update({ memory: v === 'none' ? undefined : v as AgentData['memory'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No memory</SelectItem>
              <SelectItem value="user">User scope</SelectItem>
              <SelectItem value="project">Project scope</SelectItem>
              <SelectItem value="local">Local scope</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={config.background} onCheckedChange={(v) => update({ background: v })} />
          <Label>Run in Background</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.isolation === 'worktree'}
            onCheckedChange={(v) => update({ isolation: v ? 'worktree' : undefined })}
          />
          <Label>Worktree Isolation</Label>
        </div>
      </TabsContent>

      <TabsContent value="connections" className="space-y-4">
        {connectedNodes.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No connections yet — drag edges from other nodes to this agent on the canvas.
          </p>
        ) : (
          <div className="space-y-2">
            {connectedNodes.map(({ edge, node: cn }) => (
              <div
                key={edge.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{NODE_TYPES[cn.data.nodeType].icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cn.data.label}</p>
                    <p className="text-xs text-gray-500">{NODE_TYPES[cn.data.nodeType].label} &middot; {edge.source === nodeId ? 'outgoing' : 'incoming'}</p>
                  </div>
                </div>
                <button
                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                  onClick={() => {
                    removeEdge(edge.id);
                    // Also clean up config arrays
                    const srcType = cn.data.nodeType;
                    const srcConfig = cn.data.config;
                    if (srcType === 'skill' && 'name' in srcConfig) {
                      update({ skillNames: config.skillNames.filter((s) => s !== (srcConfig as { name: string }).name) });
                    }
                    if (srcType === 'mcp' && 'serverName' in srcConfig) {
                      update({ mcpServerNames: config.mcpServerNames.filter((s) => s !== (srcConfig as { serverName: string }).serverName) });
                    }
                  }}
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Summary badges */}
        {config.skillNames.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Skills in config</Label>
            <div className="flex flex-wrap gap-1">
              {config.skillNames.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </div>
        )}
        {config.mcpServerNames.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">MCP Servers in config</Label>
            <div className="flex flex-wrap gap-1">
              {config.mcpServerNames.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

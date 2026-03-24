'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { type McpData, type McpServerType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function McpEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as McpData;

  const update = (partial: Partial<McpData>) => {
    updateNodeConfig(nodeId, partial);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Server Name</Label>
        <Input
          value={config.serverName}
          onChange={(e) => update({ serverName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
        />
      </div>

      <div className="space-y-2">
        <Label>Server Type</Label>
        <Select value={config.type} onValueChange={(v) => v && update({ type: v as McpServerType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stdio">stdio (local command)</SelectItem>
            <SelectItem value="http">HTTP (remote endpoint)</SelectItem>
            <SelectItem value="sse">SSE (server-sent events)</SelectItem>
            <SelectItem value="ws">WebSocket</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.type === 'stdio' && (
        <>
          <div className="space-y-2">
            <Label>Command</Label>
            <Input
              value={config.command || ''}
              onChange={(e) => update({ command: e.target.value })}
              placeholder="npx"
            />
          </div>
          <div className="space-y-2">
            <Label>Args (one per line)</Label>
            <Textarea
              value={(config.args || []).join('\n')}
              onChange={(e) => update({ args: e.target.value.split('\n').filter(Boolean) })}
              rows={3}
              className="font-mono text-sm"
              placeholder="-y&#10;@anthropic/mcp-github"
            />
          </div>
        </>
      )}

      {(config.type === 'http' || config.type === 'sse' || config.type === 'ws') && (
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={config.url || ''}
            onChange={(e) => update({ url: e.target.value })}
            placeholder={config.type === 'ws' ? 'ws://localhost:9000' : 'http://localhost:8080'}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Environment Variables (KEY=VALUE, one per line)</Label>
        <Textarea
          value={Object.entries(config.env || {}).map(([k, v]) => `${k}=${v}`).join('\n')}
          onChange={(e) => {
            const env: Record<string, string> = {};
            e.target.value.split('\n').filter(Boolean).forEach((line) => {
              const idx = line.indexOf('=');
              if (idx > 0) {
                env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
              }
            });
            update({ env });
          }}
          rows={4}
          className="font-mono text-sm"
          placeholder="GITHUB_TOKEN=${GITHUB_TOKEN}"
        />
      </div>
    </div>
  );
}

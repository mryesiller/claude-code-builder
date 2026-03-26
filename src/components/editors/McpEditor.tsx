'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { type McpData, type McpServerType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MCP_TEMPLATES, MCP_CATEGORIES } from '@/lib/constants';

export function McpEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as McpData;

  const isNewMcp = config.serverName === 'my-server' && config.args?.includes('@example/mcp-server');
  const [activeTab, setActiveTab] = useState(isNewMcp ? 'template' : 'manual');
  const [mcpFilter, setMcpFilter] = useState<string>('all');

  const update = (partial: Partial<McpData>) => {
    updateNodeConfig(nodeId, partial);
  };

  const filteredTemplates = MCP_TEMPLATES.filter((t) => {
    if (mcpFilter !== 'all' && t.category !== mcpFilter) return false;
    return true;
  });

  const applyTemplate = (template: typeof MCP_TEMPLATES[number]) => {
    // Full reset: apply template prefill cleanly
    const fullConfig: McpData = {
      serverName: template.prefill.serverName,
      type: template.prefill.type,
      command: template.prefill.command,
      args: template.prefill.args,
      url: template.prefill.url,
      env: template.prefill.env || {},
    };
    update(fullConfig);
    setActiveTab('manual');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="template">Templates</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>

      <TabsContent value="template" className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {MCP_CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              variant={mcpFilter === cat.value ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setMcpFilter(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => applyTemplate(template)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{template.icon}</span>
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {template.name}
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{template.description}</p>
              <Badge variant="outline" className="text-[10px]">{template.prefill.type}</Badge>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <p className="text-sm text-gray-400 col-span-2 text-center py-8">No templates found</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="manual" className="space-y-4">
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
      </TabsContent>
    </Tabs>
  );
}

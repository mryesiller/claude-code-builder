'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { type ChefData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_MODELS, PERMISSION_MODES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ChefEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as ChefData;

  const update = (partial: Partial<ChefData>) => {
    updateNodeConfig(nodeId, partial);
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="persona">CLAUDE.md</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="env">Environment</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div className="space-y-2">
          <Label>Project Name</Label>
          <Input
            value={config.projectName}
            onChange={(e) => update({ projectName: e.target.value })}
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
        <div className="flex items-center gap-2">
          <Switch
            checked={config.autoMemoryEnabled}
            onCheckedChange={(v) => update({ autoMemoryEnabled: v })}
          />
          <Label>Auto Memory Enabled</Label>
        </div>
      </TabsContent>

      <TabsContent value="persona" className="space-y-4">
        <div className="space-y-2">
          <Label>CLAUDE.md Content</Label>
          <Textarea
            value={config.persona}
            onChange={(e) => update({ persona: e.target.value })}
            rows={16}
            className="font-mono text-sm"
          />
        </div>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-4">
        <div className="space-y-2">
          <Label>Permission Mode</Label>
          <Select
            value={config.permissions.mode}
            onValueChange={(v) => v && update({ permissions: { ...config.permissions, mode: v as ChefData['permissions']['mode'] } })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERMISSION_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Allow Rules (one per line)</Label>
          <Textarea
            value={config.permissions.allow.join('\n')}
            onChange={(e) => update({
              permissions: { ...config.permissions, allow: e.target.value.split('\n').filter(Boolean) }
            })}
            rows={4}
            className="font-mono text-sm"
            placeholder="Bash(git *)&#10;Bash(npm *)"
          />
        </div>
        <div className="space-y-2">
          <Label>Deny Rules (one per line)</Label>
          <Textarea
            value={config.permissions.deny.join('\n')}
            onChange={(e) => update({
              permissions: { ...config.permissions, deny: e.target.value.split('\n').filter(Boolean) }
            })}
            rows={4}
            className="font-mono text-sm"
            placeholder="Bash(rm -rf /)"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.sandbox.enabled}
            onCheckedChange={(v) => update({ sandbox: { ...config.sandbox, enabled: v } })}
          />
          <Label>Sandbox Enabled</Label>
        </div>
      </TabsContent>

      <TabsContent value="env" className="space-y-4">
        <div className="space-y-2">
          <Label>Environment Variables (KEY=VALUE, one per line)</Label>
          <Textarea
            value={Object.entries(config.env).map(([k, v]) => `${k}=${v}`).join('\n')}
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
            rows={6}
            className="font-mono text-sm"
            placeholder="NODE_ENV=development&#10;DEBUG=true"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

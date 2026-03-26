'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { type HookData, type HookHandlerType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HOOK_EVENTS, AVAILABLE_MODELS } from '@/lib/constants';

export function HookEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as HookData;

  const update = (partial: Partial<HookData>) => {
    updateNodeConfig(nodeId, partial);
  };

  const selectedEvent = HOOK_EVENTS.find((e) => e.value === config.event);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Hook Event</Label>
        <Select value={config.event} onValueChange={(v) => v && update({ event: v as HookData['event'] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {HOOK_EVENTS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label} {e.canBlock ? '(blocking)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEvent?.matcherHint && (
          <p className="text-xs text-gray-500">Matcher examples: {selectedEvent.matcherHint}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Matcher Pattern (regex, optional)</Label>
        <Input
          value={config.matcher || ''}
          onChange={(e) => update({ matcher: e.target.value || undefined })}
          placeholder={selectedEvent?.matcherHint || 'e.g. Bash, Edit|Write'}
        />
      </div>

      <div className="space-y-2">
        <Label>Hook Type</Label>
        <Select value={config.hookType} onValueChange={(v) => v && update({ hookType: v as HookHandlerType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="command">Command (shell script)</SelectItem>
            <SelectItem value="http">HTTP (webhook)</SelectItem>
            <SelectItem value="prompt">Prompt (Claude evaluation)</SelectItem>
            <SelectItem value="agent">Agent (Claude agent)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.hookType === 'command' && (
        <div className="space-y-2">
          <Label>Command</Label>
          <Input
            value={config.command || ''}
            onChange={(e) => update({ command: e.target.value })}
            placeholder="./scripts/validate.sh"
          />
        </div>
      )}

      {config.hookType === 'http' && (
        <>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={config.url || ''}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="http://localhost:8080/hooks"
            />
          </div>
          <div className="space-y-2">
            <Label>Headers (KEY: VALUE, one per line)</Label>
            <Textarea
              value={Object.entries(config.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
              onChange={(e) => {
                const headers: Record<string, string> = {};
                e.target.value.split('\n').filter(Boolean).forEach((line) => {
                  const idx = line.indexOf(':');
                  if (idx > 0) {
                    headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
                  }
                });
                update({ headers: Object.keys(headers).length > 0 ? headers : undefined });
              }}
              rows={3}
              className="font-mono text-sm"
              placeholder="Authorization: Bearer $TOKEN&#10;Content-Type: application/json"
            />
          </div>
        </>
      )}

      {(config.hookType === 'prompt' || config.hookType === 'agent') && (
        <div className="space-y-2">
          <Label>Prompt</Label>
          <Textarea
            value={config.prompt || ''}
            onChange={(e) => update({ prompt: e.target.value })}
            rows={4}
            placeholder="Should Claude proceed? Context: $ARGUMENTS"
          />
        </div>
      )}

      {config.hookType === 'agent' && (
        <div className="space-y-2">
          <Label>Model Override</Label>
          <Select value={config.model || 'none'} onValueChange={(v) => v && update({ model: v === 'none' ? undefined : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Inherit</SelectItem>
              {AVAILABLE_MODELS.filter((m) => m.value !== 'inherit').map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Timeout (seconds)</Label>
        <Input
          type="number"
          value={config.timeout || 600}
          onChange={(e) => update({ timeout: parseInt(e.target.value) || 600 })}
        />
      </div>

      <div className="space-y-2">
        <Label>Status Message</Label>
        <Input
          value={config.statusMessage || ''}
          onChange={(e) => update({ statusMessage: e.target.value || undefined })}
          placeholder="Running validation..."
        />
      </div>

      {config.hookType === 'command' && (
        <div className="flex items-center gap-2">
          <Switch checked={config.async || false} onCheckedChange={(v) => update({ async: v })} />
          <Label>Async (non-blocking)</Label>
        </div>
      )}
    </div>
  );
}

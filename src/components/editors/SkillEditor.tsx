'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { type SkillData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_MODELS, EFFORT_LEVELS, AVAILABLE_TOOLS } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function SkillEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as SkillData;

  const update = (partial: Partial<SkillData>) => {
    updateNodeConfig(nodeId, partial);
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div className="space-y-2">
          <Label>Skill Name (kebab-case)</Label>
          <Input
            value={config.name}
            onChange={(e) => update({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={config.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Argument Hint</Label>
          <Input
            value={config.argumentHint || ''}
            onChange={(e) => update({ argumentHint: e.target.value || undefined })}
            placeholder="[filepath] [format]"
          />
        </div>
        <div className="space-y-2">
          <Label>Allowed Tools</Label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TOOLS.map((tool) => (
              <Badge
                key={tool}
                variant={config.allowedTools.includes(tool) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  if (config.allowedTools.includes(tool)) {
                    update({ allowedTools: config.allowedTools.filter((t) => t !== tool) });
                  } else {
                    update({ allowedTools: [...config.allowedTools, tool] });
                  }
                }}
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <div className="space-y-2">
          <Label>Skill Instructions (markdown)</Label>
          <p className="text-xs text-gray-500">
            Use $ARGUMENTS, $0, $1 for args. ${'{CLAUDE_SKILL_DIR}'} for skill directory.
          </p>
          <Textarea
            value={config.content}
            onChange={(e) => update({ content: e.target.value })}
            rows={16}
            className="font-mono text-sm"
          />
        </div>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch checked={config.userInvocable} onCheckedChange={(v) => update({ userInvocable: v })} />
          <Label>User Invocable (show in / menu)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={config.disableModelInvocation} onCheckedChange={(v) => update({ disableModelInvocation: v })} />
          <Label>Disable Model Auto-Invocation</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.context === 'fork'}
            onCheckedChange={(v) => update({ context: v ? 'fork' : undefined })}
          />
          <Label>Fork Context (run in subagent)</Label>
        </div>
        {config.context === 'fork' && (
          <div className="space-y-2">
            <Label>Agent Type for Fork</Label>
            <Input
              value={config.agent || ''}
              onChange={(e) => update({ agent: e.target.value || undefined })}
              placeholder="Explore, Plan, general-purpose"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Model Override</Label>
          <Select value={config.model || 'none'} onValueChange={(v) => v && update({ model: v === 'none' ? undefined : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Inherit</SelectItem>
              {AVAILABLE_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Effort Override</Label>
          <Select value={config.effort || 'none'} onValueChange={(v) => v && update({ effort: v === 'none' ? undefined : v as SkillData['effort'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Inherit</SelectItem>
              {EFFORT_LEVELS.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TabsContent>
    </Tabs>
  );
}

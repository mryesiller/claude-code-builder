'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { type SkillData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_MODELS, EFFORT_LEVELS, AVAILABLE_TOOLS, POPULAR_SKILLS, SKILL_CATEGORIES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Check if the skill has default/auto-generated config (not yet customized)
function isDefaultSkill(config: SkillData): boolean {
  return /^skill-[a-z0-9]{4}$/.test(config.name) || config.content.includes('Describe what this skill does');
}

export function SkillEditor({ nodeId }: { nodeId: string }) {
  const nodes = useProjectStore((s) => s.nodes);
  const updateNodeConfig = useProjectStore((s) => s.updateNodeConfig);
  const node = nodes.find((n) => n.id === nodeId)!;
  const config = node.data.config as SkillData;
  const matchedSkill = POPULAR_SKILLS.find((s) => s.prefill.name === config.name);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState(isDefaultSkill(config) ? 'browse' : 'general');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [skillSearch, setSkillSearch] = useState('');

  const update = (partial: Partial<SkillData>) => {
    updateNodeConfig(nodeId, partial);
  };

  const filteredSkills = POPULAR_SKILLS.filter((skill) => {
    if (skillFilter !== 'all' && skill.category !== skillFilter) return false;
    if (skillSearch) {
      const q = skillSearch.toLowerCase();
      return skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q);
    }
    return true;
  });

  const applySkill = (skill: typeof POPULAR_SKILLS[number]) => {
    // Full reset: clear old config and apply prefill cleanly
    const fullConfig: SkillData = {
      name: skill.prefill.name || config.name,
      description: skill.prefill.description || '',
      content: skill.prefill.content || '',
      allowedTools: skill.prefill.allowedTools || ['Read', 'Grep', 'Glob'],
      argumentHint: undefined,
      disableModelInvocation: false,
      userInvocable: true,
      model: undefined,
      effort: undefined,
      context: undefined,
      agent: undefined,
      hooks: {},
      supportingFiles: [],
    };
    update(fullConfig);
    setActiveTab('general');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="browse">Browse</TabsTrigger>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="browse" className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <span className="font-semibold">Skill Templates</span> — Selecting a skill pre-fills your node with representative instructions. For the full community skill, install it in your project after export.
        </div>
        <div className="space-y-3">
          <Input
            placeholder="Search skills..."
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            className="h-8"
          />
          <div className="flex flex-wrap gap-1.5">
            {SKILL_CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={skillFilter === cat.value ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSkillFilter(cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredSkills.map((skill) => (
            <div
              key={`${skill.owner}/${skill.repo}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => applySkill(skill)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {skill.name}
                </h4>
                <Badge variant="outline" className="text-[10px] shrink-0">{skill.category}</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 line-clamp-2">{skill.description}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{skill.owner}/{skill.repo}</p>
              <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to use as template</p>
            </div>
          ))}
          {filteredSkills.length === 0 && (
            <p className="text-sm text-gray-400 col-span-2 text-center py-8">No skills found</p>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Full install: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npx skills add owner/repo</code> after exporting your project.
        </p>
      </TabsContent>

      <TabsContent value="general" className="space-y-4">
        {matchedSkill && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2.5 space-y-2">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Community Skill Template</p>
            <p className="text-xs text-blue-600 dark:text-blue-400/80">
              This is pre-filled with representative content. To install the actual skill after export:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-mono">
                npx skills add {matchedSkill.owner}/{matchedSkill.repo}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0 h-7"
                onClick={() => {
                  navigator.clipboard.writeText(`npx skills add ${matchedSkill.owner}/${matchedSkill.repo}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-[10px] text-blue-500 dark:text-blue-500/70">
              Installing the real skill will replace the SKILL.md content with the community version.
            </p>
          </div>
        )}
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
          {matchedSkill && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5">
              This content is a curated template. The actual <code className="font-mono">{matchedSkill.owner}/{matchedSkill.repo}</code> skill may have different instructions. Customize freely or install the real skill to replace.
            </p>
          )}
          <Textarea
            value={config.content}
            onChange={(e) => update({ content: e.target.value })}
            rows={16}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Supporting Files</Label>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                update({
                  supportingFiles: [
                    ...config.supportingFiles,
                    { path: `file-${config.supportingFiles.length + 1}.md`, content: '' },
                  ],
                });
              }}
            >
              + Add File
            </Button>
          </div>
          {config.supportingFiles.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No supporting files. Add files that will be placed alongside SKILL.md.
            </p>
          )}
          {config.supportingFiles.map((file, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={file.path}
                  onChange={(e) => {
                    const files = [...config.supportingFiles];
                    files[idx] = { ...files[idx], path: e.target.value };
                    update({ supportingFiles: files });
                  }}
                  placeholder="filename.py"
                  className="flex-1 h-7 text-sm font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-red-500 hover:text-red-700"
                  onClick={() => {
                    update({
                      supportingFiles: config.supportingFiles.filter((_, i) => i !== idx),
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
              <Textarea
                value={file.content}
                onChange={(e) => {
                  const files = [...config.supportingFiles];
                  files[idx] = { ...files[idx], content: e.target.value };
                  update({ supportingFiles: files });
                }}
                rows={4}
                className="font-mono text-sm"
                placeholder="File content..."
              />
            </div>
          ))}
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

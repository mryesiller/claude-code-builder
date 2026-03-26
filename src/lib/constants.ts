import { ClaudeNodeType, HookEventType, SkillData, McpData, McpServerType } from './types';

// --- Node Type Definitions ---
export interface NodeTypeConfig {
  type: ClaudeNodeType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  category: 'core' | 'config' | 'advanced';
}

export const NODE_TYPES: Record<ClaudeNodeType, NodeTypeConfig> = {
  chef: {
    type: 'chef',
    label: 'Chef (Orchestrator)',
    description: 'Project root — CLAUDE.md & settings',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    icon: '👨‍🍳',
    category: 'core',
  },
  agent: {
    type: 'agent',
    label: 'Agent',
    description: 'Subagent — .claude/agents/*.md',
    color: '#2563eb',
    bgColor: '#eff6ff',
    icon: '🤖',
    category: 'core',
  },
  skill: {
    type: 'skill',
    label: 'Skill',
    description: 'Skill — .claude/skills/*/SKILL.md',
    color: '#059669',
    bgColor: '#ecfdf5',
    icon: '⚡',
    category: 'core',
  },
  command: {
    type: 'command',
    label: 'Command',
    description: 'Slash command — .claude/commands/*.md',
    color: '#0891b2',
    bgColor: '#ecfeff',
    icon: '💻',
    category: 'core',
  },
  tool: {
    type: 'tool',
    label: 'Tool Permission',
    description: 'Tool permission — settings.json permissions',
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: '🔧',
    category: 'config',
  },
  mcp: {
    type: 'mcp',
    label: 'MCP Server',
    description: 'MCP server — .mcp.json',
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '🔌',
    category: 'config',
  },
  hook: {
    type: 'hook',
    label: 'Hook',
    description: 'Lifecycle hook — settings.json hooks',
    color: '#9333ea',
    bgColor: '#faf5ff',
    icon: '🪝',
    category: 'config',
  },
  memory: {
    type: 'memory',
    label: 'Memory',
    description: 'Memory — MEMORY.md',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    icon: '🧠',
    category: 'config',
  },
  log: {
    type: 'log',
    label: 'Log',
    description: 'Log directory',
    color: '#6b7280',
    bgColor: '#f9fafb',
    icon: '📋',
    category: 'config',
  },
  rule: {
    type: 'rule',
    label: 'Rule',
    description: 'Rule — .claude/rules/*.md',
    color: '#ea580c',
    bgColor: '#fff7ed',
    icon: '📏',
    category: 'config',
  },
  plugin: {
    type: 'plugin',
    label: 'Plugin',
    description: 'Plugin — .claude-plugin/',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    icon: '🧩',
    category: 'advanced',
  },
  env: {
    type: 'env',
    label: 'Env Variables',
    description: 'Environment variables — settings.json env',
    color: '#65a30d',
    bgColor: '#f7fee7',
    icon: '🔐',
    category: 'config',
  },
  team: {
    type: 'team',
    label: 'Team',
    description: 'Agent Teams — multi-agent sessions',
    color: '#0d9488',
    bgColor: '#f0fdfa',
    icon: '👥',
    category: 'advanced',
  },
};

// --- Node Categories ---
export const NODE_CATEGORIES = [
  { key: 'core', label: 'Core', types: ['chef', 'agent', 'skill', 'command'] as ClaudeNodeType[] },
  { key: 'config', label: 'Configuration', types: ['tool', 'mcp', 'hook', 'memory', 'log', 'rule', 'env'] as ClaudeNodeType[] },
  { key: 'advanced', label: 'Advanced', types: ['plugin', 'team'] as ClaudeNodeType[] },
];

// --- Hook Events ---
export const HOOK_EVENTS: { value: HookEventType; label: string; canBlock: boolean; matcherHint: string }[] = [
  { value: 'SessionStart', label: 'Session Start', canBlock: false, matcherHint: 'startup, resume, clear, compact' },
  { value: 'InstructionsLoaded', label: 'Instructions Loaded', canBlock: false, matcherHint: 'load_reason' },
  { value: 'UserPromptSubmit', label: 'User Prompt Submit', canBlock: true, matcherHint: '' },
  { value: 'PreToolUse', label: 'Pre Tool Use', canBlock: true, matcherHint: 'Bash, Edit|Write, mcp__*' },
  { value: 'PermissionRequest', label: 'Permission Request', canBlock: true, matcherHint: 'tool name' },
  { value: 'PostToolUse', label: 'Post Tool Use', canBlock: false, matcherHint: 'tool name' },
  { value: 'PostToolUseFailure', label: 'Post Tool Use Failure', canBlock: false, matcherHint: 'tool name' },
  { value: 'Notification', label: 'Notification', canBlock: false, matcherHint: 'notification type' },
  { value: 'SubagentStart', label: 'Subagent Start', canBlock: false, matcherHint: 'agent type' },
  { value: 'SubagentStop', label: 'Subagent Stop', canBlock: true, matcherHint: 'agent type' },
  { value: 'Stop', label: 'Stop', canBlock: true, matcherHint: '' },
  { value: 'StopFailure', label: 'Stop Failure', canBlock: false, matcherHint: 'error type' },
  { value: 'TeammateIdle', label: 'Teammate Idle', canBlock: true, matcherHint: '' },
  { value: 'TaskCompleted', label: 'Task Completed', canBlock: true, matcherHint: '' },
  { value: 'ConfigChange', label: 'Config Change', canBlock: true, matcherHint: 'config source' },
  { value: 'WorktreeCreate', label: 'Worktree Create', canBlock: true, matcherHint: '' },
  { value: 'WorktreeRemove', label: 'Worktree Remove', canBlock: false, matcherHint: '' },
  { value: 'PreCompact', label: 'Pre Compact', canBlock: false, matcherHint: 'manual, auto' },
  { value: 'PostCompact', label: 'Post Compact', canBlock: false, matcherHint: 'manual, auto' },
  { value: 'Elicitation', label: 'Elicitation', canBlock: true, matcherHint: 'MCP server name' },
  { value: 'ElicitationResult', label: 'Elicitation Result', canBlock: true, matcherHint: 'MCP server name' },
  { value: 'SessionEnd', label: 'Session End', canBlock: false, matcherHint: 'exit reason' },
];

// --- Available Tools ---
export const AVAILABLE_TOOLS = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash',
  'WebFetch', 'WebSearch', 'Agent', 'TodoWrite',
  'NotebookEdit', 'AskUserQuestion',
];

// --- Models ---
export const AVAILABLE_MODELS = [
  { value: 'sonnet', label: 'Sonnet (claude-sonnet-4-6)' },
  { value: 'opus', label: 'Opus (claude-opus-4-6)' },
  { value: 'haiku', label: 'Haiku (claude-haiku-4-5)' },
  { value: 'inherit', label: 'Inherit (parent model)' },
];

// --- Permission Modes ---
export const PERMISSION_MODES = [
  { value: 'default', label: 'Default — Standard permission prompts' },
  { value: 'acceptEdits', label: 'Accept Edits — Auto-accept file edits' },
  { value: 'dontAsk', label: "Don't Ask — Auto-deny prompts" },
  { value: 'bypassPermissions', label: 'Bypass — Skip all prompts' },
  { value: 'plan', label: 'Plan — Read-only mode' },
];

// --- Effort Levels ---
export const EFFORT_LEVELS = [
  { value: 'low', label: 'Low — Fast, cheaper' },
  { value: 'medium', label: 'Medium — Balanced' },
  { value: 'high', label: 'High — More thorough' },
  { value: 'max', label: 'Max — Maximum (Opus 4.6 only)' },
];

// --- Popular Skills from skills.sh (curated, last updated: 2026-03-24) ---
export type SkillCategory = 'development' | 'documentation' | 'testing' | 'devops' | 'design' | 'code-quality';

export interface PopularSkill {
  name: string;
  owner: string;
  repo: string;
  description: string;
  category: SkillCategory;
  prefill: Partial<SkillData>;
}

export const SKILL_CATEGORIES: { value: SkillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'devops', label: 'DevOps' },
  { value: 'design', label: 'Design' },
  { value: 'code-quality', label: 'Code Quality' },
];

export const POPULAR_SKILLS: PopularSkill[] = [
  {
    name: 'React Best Practices',
    owner: 'vercel-labs',
    repo: 'vercel-react-best-practices',
    description: 'Modern React patterns, hooks, and performance optimization guidelines',
    category: 'development',
    prefill: {
      name: 'react-best-practices',
      description: 'Enforces modern React patterns, hooks usage, and performance best practices',
      content: '# React Best Practices\n\nFollow these guidelines when writing React code:\n\n## Component Design\n- Use functional components with hooks\n- Keep components small and focused\n- Extract custom hooks for reusable logic\n\n## Performance\n- Use React.memo for expensive renders\n- Use useMemo/useCallback appropriately\n- Avoid unnecessary re-renders\n\n## State Management\n- Keep state as local as possible\n- Use context for truly global state\n- Consider server state libraries (TanStack Query)',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Frontend Design',
    owner: 'anthropics',
    repo: 'frontend-design',
    description: 'UI/UX design patterns for frontend applications',
    category: 'design',
    prefill: {
      name: 'frontend-design',
      description: 'Applies UI/UX design patterns and accessibility best practices',
      content: '# Frontend Design Guidelines\n\n## Layout\n- Use CSS Grid for 2D layouts, Flexbox for 1D\n- Mobile-first responsive design\n- Consistent spacing scale\n\n## Accessibility\n- Semantic HTML elements\n- ARIA labels where needed\n- Keyboard navigation support\n- Color contrast compliance\n\n## Component Patterns\n- Consistent visual hierarchy\n- Clear interactive states (hover, focus, active)\n- Loading and error states for all async operations',
      allowedTools: ['Read', 'Grep', 'Glob', 'Edit', 'Write'],
      userInvocable: true,
    },
  },
  {
    name: 'Web Design Guidelines',
    owner: 'anthropics',
    repo: 'web-design-guidelines',
    description: 'Comprehensive web design standards and patterns',
    category: 'design',
    prefill: {
      name: 'web-design-guidelines',
      description: 'Comprehensive web design standards including layout, typography, and color',
      content: '# Web Design Guidelines\n\n## Typography\n- Use a modular type scale\n- Maximum 2-3 font families\n- Appropriate line height (1.5 for body)\n\n## Color\n- Define semantic color tokens\n- Support dark and light modes\n- Ensure WCAG AA contrast ratios\n\n## Responsive Design\n- Breakpoints: 640px, 768px, 1024px, 1280px\n- Fluid typography and spacing\n- Touch-friendly tap targets (44px minimum)',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'TypeScript Patterns',
    owner: 'anthropics',
    repo: 'typescript-patterns',
    description: 'Advanced TypeScript type patterns and best practices',
    category: 'development',
    prefill: {
      name: 'typescript-patterns',
      description: 'Enforces advanced TypeScript patterns including generics, discriminated unions, and type safety',
      content: '# TypeScript Patterns\n\n## Type Safety\n- Prefer `unknown` over `any`\n- Use discriminated unions for state\n- Leverage template literal types\n\n## Generics\n- Constrain generics with `extends`\n- Use default type parameters\n- Infer types from function arguments\n\n## Utility Types\n- Use built-in utility types (Pick, Omit, Partial, Required)\n- Create custom utility types for domain logic\n- Document complex types with JSDoc',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Next.js Patterns',
    owner: 'vercel-labs',
    repo: 'nextjs-patterns',
    description: 'Next.js App Router patterns, server components, and data fetching',
    category: 'development',
    prefill: {
      name: 'nextjs-patterns',
      description: 'Next.js App Router best practices including server components, routing, and data fetching',
      content: '# Next.js Patterns\n\n## App Router\n- Use Server Components by default\n- Add "use client" only when needed\n- Leverage route groups and layouts\n\n## Data Fetching\n- Fetch data in Server Components\n- Use Suspense for streaming\n- Implement error boundaries\n\n## Performance\n- Use next/image for images\n- Implement dynamic imports for heavy components\n- Configure proper caching strategies',
      allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'Code Review',
    owner: 'anthropics',
    repo: 'code-review',
    description: 'Automated code review with quality, security, and performance checks',
    category: 'code-quality',
    prefill: {
      name: 'code-review',
      description: 'Reviews code for quality, security vulnerabilities, and performance issues',
      content: '# Code Review Skill\n\nReview the provided code for:\n\n1. **Code Quality**: Readability, naming, DRY principles\n2. **Security**: OWASP Top 10, injection risks, auth issues\n3. **Performance**: N+1 queries, unnecessary renders, memory leaks\n4. **Testing**: Test coverage gaps, edge cases\n5. **Conventions**: Project-specific patterns and standards\n\nProvide specific, actionable feedback with file:line references.\nUse $ARGUMENTS for the file or directory to review.',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Test Writer',
    owner: 'anthropics',
    repo: 'test-writer',
    description: 'Generate comprehensive test suites for existing code',
    category: 'testing',
    prefill: {
      name: 'test-writer',
      description: 'Generates comprehensive test suites including unit, integration, and edge case tests',
      content: '# Test Writer\n\nGenerate tests for the provided code:\n\n## Test Structure\n- Use describe/it blocks with clear names\n- Arrange-Act-Assert pattern\n- One assertion per test when practical\n\n## Coverage\n- Happy path scenarios\n- Edge cases and boundary values\n- Error handling paths\n- Null/undefined inputs\n\n## Best Practices\n- Mock external dependencies\n- Use factories for test data\n- Keep tests independent and idempotent\n\nTarget: $ARGUMENTS',
      allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'E2E Testing',
    owner: 'anthropics',
    repo: 'e2e-testing',
    description: 'End-to-end test generation with Playwright or Cypress',
    category: 'testing',
    prefill: {
      name: 'e2e-testing',
      description: 'Generates end-to-end tests using Playwright for browser automation',
      content: '# E2E Testing\n\nCreate end-to-end tests for user flows:\n\n## Patterns\n- Page Object Model for selectors\n- Test user journeys, not implementation\n- Use data-testid attributes\n\n## Reliability\n- Wait for network idle, not arbitrary timeouts\n- Use locators over selectors\n- Retry flaky assertions\n\n## Coverage\n- Critical user paths (auth, checkout, etc.)\n- Cross-browser testing\n- Mobile viewport testing',
      allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'API Documentation',
    owner: 'anthropics',
    repo: 'api-docs',
    description: 'Generate OpenAPI specs and API documentation from code',
    category: 'documentation',
    prefill: {
      name: 'api-docs',
      description: 'Generates OpenAPI specifications and documentation from API route handlers',
      content: '# API Documentation Generator\n\nAnalyze API routes and generate documentation:\n\n## Output Format\n- OpenAPI 3.0 specification\n- Endpoint descriptions with examples\n- Request/response schemas\n- Authentication requirements\n\n## Analysis\n- Parse route handlers for methods and paths\n- Extract request body and query parameters\n- Document error responses\n- Include usage examples with curl\n\nTarget directory: $ARGUMENTS',
      allowedTools: ['Read', 'Write', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'README Generator',
    owner: 'anthropics',
    repo: 'readme-generator',
    description: 'Generate comprehensive README.md from project structure',
    category: 'documentation',
    prefill: {
      name: 'readme-generator',
      description: 'Generates a comprehensive README.md by analyzing project structure and code',
      content: '# README Generator\n\nAnalyze the project and generate a README.md:\n\n## Sections\n- Project title and description\n- Installation instructions\n- Usage examples\n- API reference (if applicable)\n- Configuration options\n- Contributing guidelines\n- License\n\n## Analysis Steps\n1. Read package.json for project metadata\n2. Scan src/ for main features\n3. Check for existing docs\n4. Identify tech stack from dependencies',
      allowedTools: ['Read', 'Write', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Docker Setup',
    owner: 'anthropics',
    repo: 'docker-setup',
    description: 'Generate Dockerfile and docker-compose configurations',
    category: 'devops',
    prefill: {
      name: 'docker-setup',
      description: 'Generates Dockerfile and docker-compose.yml for the project',
      content: '# Docker Setup\n\nCreate Docker configuration:\n\n## Dockerfile\n- Multi-stage builds for smaller images\n- Non-root user for security\n- Proper layer caching (.dockerignore)\n- Health checks\n\n## Docker Compose\n- Service dependencies\n- Volume mounts for development\n- Environment variable configuration\n- Network setup\n\nAnalyze the project to determine the appropriate base image and build steps.',
      allowedTools: ['Read', 'Write', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'CI/CD Pipeline',
    owner: 'anthropics',
    repo: 'ci-cd-pipeline',
    description: 'Generate GitHub Actions or GitLab CI pipeline configurations',
    category: 'devops',
    prefill: {
      name: 'ci-cd-pipeline',
      description: 'Generates CI/CD pipeline configuration for GitHub Actions',
      content: '# CI/CD Pipeline Generator\n\nCreate pipeline configuration:\n\n## Stages\n1. **Lint**: ESLint, Prettier check\n2. **Type Check**: TypeScript compilation\n3. **Test**: Unit and integration tests\n4. **Build**: Production build\n5. **Deploy**: Deployment to target environment\n\n## Best Practices\n- Cache dependencies between runs\n- Run checks in parallel where possible\n- Use matrix builds for multiple Node versions\n- Secrets management for credentials',
      allowedTools: ['Read', 'Write', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Security Audit',
    owner: 'anthropics',
    repo: 'security-audit',
    description: 'Scan code for security vulnerabilities and misconfigurations',
    category: 'code-quality',
    prefill: {
      name: 'security-audit',
      description: 'Scans code for OWASP Top 10 vulnerabilities and security misconfigurations',
      content: '# Security Audit\n\nScan the codebase for security issues:\n\n## Checks\n- SQL injection / NoSQL injection\n- Cross-site scripting (XSS)\n- Authentication and authorization flaws\n- Sensitive data exposure\n- Insecure dependencies (npm audit)\n- Hardcoded secrets and API keys\n- CSRF protection\n- Rate limiting\n\n## Output\n- Severity rating (Critical/High/Medium/Low)\n- Affected file and line number\n- Remediation steps\n\nTarget: $ARGUMENTS',
      allowedTools: ['Read', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'Refactoring',
    owner: 'anthropics',
    repo: 'refactoring',
    description: 'Identify and apply code refactoring opportunities',
    category: 'code-quality',
    prefill: {
      name: 'refactoring',
      description: 'Identifies code smells and applies refactoring patterns to improve code quality',
      content: '# Refactoring Skill\n\nAnalyze and refactor code:\n\n## Code Smells\n- Long methods (>30 lines)\n- Deep nesting (>3 levels)\n- Duplicate code\n- Large classes/modules\n- Feature envy\n\n## Refactoring Patterns\n- Extract method/function\n- Replace conditional with polymorphism\n- Introduce parameter object\n- Compose method\n\n## Constraints\n- Preserve existing behavior\n- Maintain test coverage\n- One refactoring at a time\n\nTarget: $ARGUMENTS',
      allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Tailwind Patterns',
    owner: 'anthropics',
    repo: 'tailwind-patterns',
    description: 'Tailwind CSS best practices and utility patterns',
    category: 'design',
    prefill: {
      name: 'tailwind-patterns',
      description: 'Enforces Tailwind CSS best practices and consistent utility usage',
      content: '# Tailwind CSS Patterns\n\n## Organization\n- Group utilities: layout > sizing > spacing > typography > visual\n- Use @apply for frequently repeated combinations\n- Leverage design tokens via tailwind.config\n\n## Responsive\n- Mobile-first breakpoints (sm, md, lg, xl, 2xl)\n- Use container queries where appropriate\n\n## Dark Mode\n- Use dark: variant consistently\n- Define semantic color tokens\n- Test both modes for contrast',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Python Patterns',
    owner: 'anthropics',
    repo: 'python-patterns',
    description: 'Python best practices, type hints, and idiomatic patterns',
    category: 'development',
    prefill: {
      name: 'python-patterns',
      description: 'Enforces Pythonic patterns, type hints, and PEP 8 compliance',
      content: '# Python Patterns\n\n## Type Hints\n- Use type hints for all function signatures\n- Use TypedDict for structured data\n- Leverage Protocol for structural typing\n\n## Patterns\n- Context managers for resource management\n- Dataclasses/Pydantic for data models\n- Generators for large datasets\n- List/dict comprehensions over loops\n\n## Style\n- PEP 8 compliance\n- Docstrings for public APIs\n- f-strings for formatting',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Rust Patterns',
    owner: 'anthropics',
    repo: 'rust-patterns',
    description: 'Rust idioms, ownership patterns, and error handling',
    category: 'development',
    prefill: {
      name: 'rust-patterns',
      description: 'Enforces Rust idioms, ownership best practices, and proper error handling',
      content: '# Rust Patterns\n\n## Ownership & Borrowing\n- Prefer borrowing over cloning\n- Use lifetimes explicitly when needed\n- Leverage the type system for safety\n\n## Error Handling\n- Use Result<T, E> for recoverable errors\n- Custom error types with thiserror\n- ? operator for error propagation\n\n## Performance\n- Zero-cost abstractions\n- Avoid unnecessary allocations\n- Use iterators over index loops',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
  {
    name: 'Performance Optimization',
    owner: 'anthropics',
    repo: 'performance-optimization',
    description: 'Identify and fix performance bottlenecks',
    category: 'code-quality',
    prefill: {
      name: 'performance-optimization',
      description: 'Identifies performance bottlenecks and suggests optimizations',
      content: '# Performance Optimization\n\n## Analysis Areas\n- Database query optimization (N+1, missing indexes)\n- Frontend bundle size analysis\n- Memory leak detection\n- Unnecessary re-renders (React)\n- Network waterfall optimization\n\n## Techniques\n- Lazy loading and code splitting\n- Caching strategies (memoization, HTTP cache)\n- Virtual scrolling for large lists\n- Image optimization\n- Connection pooling\n\nTarget: $ARGUMENTS',
      allowedTools: ['Read', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'Deploy',
    owner: 'anthropics',
    repo: 'deploy',
    description: 'Deployment automation scripts and configurations',
    category: 'devops',
    prefill: {
      name: 'deploy',
      description: 'Generates deployment configurations and automation scripts',
      content: '# Deployment Skill\n\nSet up deployment pipeline:\n\n## Platforms\n- Vercel / Netlify for frontend\n- Railway / Fly.io for backend\n- AWS ECS / GCP Cloud Run for containers\n\n## Configuration\n- Environment variable management\n- Health check endpoints\n- Rollback strategies\n- Blue-green or canary deployment\n\n## Post-deploy\n- Smoke tests\n- Monitoring alerts\n- Database migrations',
      allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
      userInvocable: true,
    },
  },
  {
    name: 'Accessibility',
    owner: 'anthropics',
    repo: 'accessibility',
    description: 'Audit and fix web accessibility (WCAG) issues',
    category: 'design',
    prefill: {
      name: 'accessibility',
      description: 'Audits web pages for WCAG 2.1 AA compliance and suggests fixes',
      content: '# Accessibility Audit\n\n## WCAG 2.1 AA Checks\n- Perceivable: alt text, color contrast, text resize\n- Operable: keyboard navigation, focus management\n- Understandable: clear labels, error messages\n- Robust: semantic HTML, ARIA attributes\n\n## Common Issues\n- Missing alt attributes on images\n- Low color contrast\n- Missing form labels\n- No skip navigation links\n- Focus traps in modals\n\nTarget: $ARGUMENTS',
      allowedTools: ['Read', 'Grep', 'Glob'],
      userInvocable: true,
    },
  },
];

// --- MCP Server Templates ---
export type McpCategory = 'development' | 'communication' | 'database' | 'cloud' | 'productivity';

export interface McpTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: McpCategory;
  prefill: {
    serverName: string;
    type: McpServerType;
    command?: string;
    args?: string[];
    url?: string;
    env?: Record<string, string>;
  };
}

export const MCP_CATEGORIES: { value: McpCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'development', label: 'Development' },
  { value: 'database', label: 'Database' },
  { value: 'communication', label: 'Communication' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'productivity', label: 'Productivity' },
];

export const MCP_TEMPLATES: McpTemplate[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Access GitHub repos, issues, PRs, and code search',
    icon: '🐙',
    category: 'development',
    prefill: {
      serverName: 'github',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-github'],
      env: { GITHUB_TOKEN: '${GITHUB_TOKEN}' },
    },
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Interact with GitLab repositories and CI/CD pipelines',
    icon: '🦊',
    category: 'development',
    prefill: {
      serverName: 'gitlab',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-gitlab'],
      env: { GITLAB_TOKEN: '${GITLAB_TOKEN}' },
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, read channels, and manage Slack workspaces',
    icon: '💬',
    category: 'communication',
    prefill: {
      serverName: 'slack',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-slack'],
      env: { SLACK_BOT_TOKEN: '${SLACK_BOT_TOKEN}' },
    },
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Secure file system access with configurable allowed directories',
    icon: '📁',
    category: 'productivity',
    prefill: {
      serverName: 'filesystem',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-filesystem', '/path/to/allowed/dir'],
    },
  },
  {
    id: 'fetch',
    name: 'Fetch',
    description: 'Make HTTP requests and fetch web content',
    icon: '🌐',
    category: 'productivity',
    prefill: {
      serverName: 'fetch',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-fetch'],
    },
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query PostgreSQL databases with read/write access',
    icon: '🐘',
    category: 'database',
    prefill: {
      serverName: 'postgres',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-postgres'],
      env: { DATABASE_URL: 'postgresql://user:pass@localhost:5432/dbname' },
    },
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    description: 'Query SQLite databases for local development',
    icon: '📦',
    category: 'database',
    prefill: {
      serverName: 'sqlite',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-sqlite', './database.db'],
    },
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'Interact with Redis key-value store',
    icon: '🔴',
    category: 'database',
    prefill: {
      serverName: 'redis',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-redis'],
      env: { REDIS_URL: 'redis://localhost:6379' },
    },
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Manage Linear issues, projects, and workflows',
    icon: '📐',
    category: 'development',
    prefill: {
      serverName: 'linear',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-linear'],
      env: { LINEAR_API_KEY: '${LINEAR_API_KEY}' },
    },
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Access error tracking and performance monitoring data',
    icon: '🐛',
    category: 'development',
    prefill: {
      serverName: 'sentry',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-sentry'],
      env: { SENTRY_AUTH_TOKEN: '${SENTRY_AUTH_TOKEN}' },
    },
  },
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation and web scraping with Playwright',
    icon: '🎭',
    category: 'development',
    prefill: {
      serverName: 'playwright',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-playwright'],
    },
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and manage Google Drive files and folders',
    icon: '📄',
    category: 'productivity',
    prefill: {
      serverName: 'google-drive',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-google-drive'],
      env: { GOOGLE_CREDENTIALS: '${GOOGLE_CREDENTIALS}' },
    },
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Read and write Notion pages, databases, and blocks',
    icon: '📓',
    category: 'productivity',
    prefill: {
      serverName: 'notion',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-notion'],
      env: { NOTION_API_KEY: '${NOTION_API_KEY}' },
    },
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Manage Vercel deployments, projects, and domains',
    icon: '▲',
    category: 'cloud',
    prefill: {
      serverName: 'vercel',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-vercel'],
      env: { VERCEL_TOKEN: '${VERCEL_TOKEN}' },
    },
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'Manage Cloudflare Workers, KV, and DNS',
    icon: '☁️',
    category: 'cloud',
    prefill: {
      serverName: 'cloudflare',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-cloudflare'],
      env: { CLOUDFLARE_API_TOKEN: '${CLOUDFLARE_API_TOKEN}' },
    },
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send messages and manage Discord servers',
    icon: '🎮',
    category: 'communication',
    prefill: {
      serverName: 'discord',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-discord'],
      env: { DISCORD_BOT_TOKEN: '${DISCORD_BOT_TOKEN}' },
    },
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Query and manage MongoDB databases and collections',
    icon: '🍃',
    category: 'database',
    prefill: {
      serverName: 'mongodb',
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@anthropic/mcp-mongodb'],
      env: { MONGODB_URI: 'mongodb://localhost:27017/mydb' },
    },
  },
];


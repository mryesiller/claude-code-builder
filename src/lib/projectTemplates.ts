import { type ClaudeNodeType, type NodeDataMap } from './types';
import {
  createDefaultChef, createDefaultAgent, createDefaultSkill,
  createDefaultMcp, createDefaultHook, createDefaultRule,
  createDefaultMemory, createDefaultTool, createDefaultEnv,
  createDefaultCommand,
} from './templates';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: Array<{
    type: ClaudeNodeType;
    config: Partial<NodeDataMap[ClaudeNodeType]>;
    x: number;
    y: number;
  }>;
  edges: Array<{ sourceIdx: number; targetIdx: number }>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'web-app',
    name: 'Web App',
    description: 'Next.js / React web application with code review, testing, and deployment agents',
    icon: '🌐',
    nodes: [
      {
        type: 'chef',
        config: {
          ...createDefaultChef(),
          projectName: 'my-web-app',
          persona: `# Project: My Web App

## Tech Stack
- Next.js 15, TypeScript, Tailwind CSS
- Prisma ORM, PostgreSQL
- TRPC API layer

## Conventions
- Always write tests before code
- Use conventional commits
- Run lint + typecheck before PR

## Architecture
- src/components — React components
- src/server — TRPC routers & services
- src/lib — Shared utilities
- prisma/ — Database schema

## Security
- No secrets in code or logs
- Validate all user inputs
- Use parameterized queries only`,
        },
        x: 500, y: 20,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('code-reviewer'),
          name: 'code-reviewer',
          description: 'Reviews code for quality, security, and best practices',
          persona: `You are a senior code reviewer. Analyze code changes for:
1. Code quality and readability
2. Security vulnerabilities (OWASP Top 10)
3. Performance issues
4. Test coverage gaps
5. Adherence to project conventions

Provide specific, actionable feedback with file:line references.`,
          tools: ['Read', 'Grep', 'Glob'],
          model: 'sonnet',
          effort: 'high',
        },
        x: 80, y: 280,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('test-writer'),
          name: 'test-writer',
          description: 'Writes and maintains test suites',
          persona: `You are a testing specialist. Write comprehensive tests:
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for React components
- Use vitest and testing-library
- Aim for >80% coverage on critical paths`,
          tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
          model: 'sonnet',
        },
        x: 500, y: 280,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('deployer'),
          name: 'deployer',
          description: 'Handles deployment and CI/CD tasks',
          persona: `You handle deployment tasks:
- Run build and verify it succeeds
- Check for environment variable issues
- Validate database migrations
- Create deployment checklists`,
          tools: ['Read', 'Bash', 'Grep', 'Glob'],
          model: 'haiku',
          background: true,
        },
        x: 920, y: 280,
      },
      {
        type: 'skill',
        config: {
          ...createDefaultSkill('code-review'),
          name: 'code-review',
          description: 'Review code changes for quality and security issues',
          content: `# Code Review

Review the following code for quality, security, and best practices.

$ARGUMENTS

## Checklist
- [ ] No security vulnerabilities
- [ ] Tests included
- [ ] No performance regressions
- [ ] Follows project conventions`,
          argumentHint: '[file-or-pr-url]',
          allowedTools: ['Read', 'Grep', 'Glob'],
          context: 'fork',
          agent: 'Explore',
        },
        x: 30, y: 560,
      },
      {
        type: 'skill',
        config: {
          ...createDefaultSkill('deploy'),
          name: 'deploy',
          description: 'Deploy the application to production',
          content: `# Deploy

Run the deployment pipeline:

1. Run \`npm run build\` and verify success
2. Run \`npm run test\` and verify all pass
3. Run \`npm run lint\` and verify clean
4. If all checks pass, confirm deployment

$ARGUMENTS`,
          argumentHint: '[environment]',
          allowedTools: ['Read', 'Bash', 'Grep'],
        },
        x: 870, y: 560,
      },
      {
        type: 'mcp',
        config: {
          ...createDefaultMcp('github'),
          serverName: 'github',
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@anthropic/mcp-github'],
          env: { GITHUB_TOKEN: '${GITHUB_TOKEN}' },
        },
        x: 280, y: 560,
      },
      {
        type: 'hook',
        config: {
          ...createDefaultHook(),
          event: 'PostToolUse',
          matcher: 'Write|Edit',
          hookType: 'command',
          command: 'npx prettier --write',
          statusMessage: 'Formatting...',
        },
        x: 630, y: 560,
      },
      {
        type: 'rule',
        config: {
          ...createDefaultRule('testing'),
          name: 'testing',
          content: `# Testing Rules

- Every new feature must have tests
- Use describe/it blocks with clear names
- Mock external dependencies only
- Integration tests hit real database`,
        },
        x: 500, y: 830,
      },
      {
        type: 'command',
        config: {
          ...createDefaultCommand('review-pr'),
          name: 'review-pr',
          description: 'Review a pull request for quality, security, and conventions',
          content: `# Review Pull Request

Review the given PR or set of changes for:

1. **Code Quality**: Readability, naming, DRY principles, error handling
2. **Security**: Injection risks, auth issues, data exposure
3. **Tests**: Coverage gaps, edge cases, missing assertions
4. **Conventions**: Project patterns, commit messages, documentation

If a PR URL is given, use the GitHub MCP to fetch PR details.
Otherwise review the current branch diff against main.

$ARGUMENTS`,
        },
        x: 150, y: 830,
      },
    ],
    edges: [
      { sourceIdx: 1, targetIdx: 0 }, // code-reviewer → chef
      { sourceIdx: 2, targetIdx: 0 }, // test-writer → chef
      { sourceIdx: 3, targetIdx: 0 }, // deployer → chef
      { sourceIdx: 4, targetIdx: 1 }, // code-review skill → code-reviewer
      { sourceIdx: 5, targetIdx: 3 }, // deploy skill → deployer
      { sourceIdx: 6, targetIdx: 1 }, // github mcp → code-reviewer
      { sourceIdx: 7, targetIdx: 0 }, // prettier hook → chef
      { sourceIdx: 8, targetIdx: 0 }, // testing rule → chef
      { sourceIdx: 9, targetIdx: 0 }, // review-pr command → chef
    ],
  },
  {
    id: 'api-service',
    name: 'API Service',
    description: 'Backend API with database, security auditing, and monitoring agents',
    icon: '⚡',
    nodes: [
      {
        type: 'chef',
        config: {
          ...createDefaultChef(),
          projectName: 'my-api',
          persona: `# Project: My API Service

## Tech Stack
- Node.js with Express/Fastify
- PostgreSQL + Redis
- Docker for deployment

## Conventions
- RESTful API design
- Input validation on all endpoints
- Structured JSON logging
- Database migrations for schema changes

## Architecture
- src/routes — API endpoints
- src/services — Business logic
- src/models — Database models
- src/middleware — Auth, validation, logging`,
        },
        x: 500, y: 20,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('security-auditor'),
          name: 'security-auditor',
          description: 'Audits code for security vulnerabilities and compliance',
          persona: `You are a security specialist. Audit code for:
- SQL injection, XSS, CSRF
- Authentication/authorization flaws
- Secrets in code or logs
- Dependency vulnerabilities
- OWASP Top 10 compliance`,
          tools: ['Read', 'Grep', 'Glob', 'Bash'],
          model: 'opus',
          effort: 'high',
        },
        x: 80, y: 300,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('db-manager'),
          name: 'db-manager',
          description: 'Manages database schemas, migrations, and queries',
          persona: `You manage database operations:
- Write and review migrations
- Optimize slow queries
- Design efficient schemas
- Ensure data integrity constraints`,
          tools: ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'],
          model: 'sonnet',
        },
        x: 500, y: 300,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('api-designer'),
          name: 'api-designer',
          description: 'Designs and documents API endpoints',
          persona: `You design RESTful APIs:
- Follow REST conventions
- Write OpenAPI specs
- Design consistent error responses
- Implement pagination and filtering`,
          tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
          model: 'sonnet',
        },
        x: 920, y: 300,
      },
      {
        type: 'mcp',
        config: {
          ...createDefaultMcp('postgres'),
          serverName: 'postgres',
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@anthropic/mcp-postgres'],
          env: { DATABASE_URL: '${DATABASE_URL}' },
        },
        x: 500, y: 580,
      },
      {
        type: 'hook',
        config: {
          ...createDefaultHook(),
          event: 'PreToolUse',
          matcher: 'Bash',
          hookType: 'command',
          command: './scripts/validate-command.sh',
          statusMessage: 'Validating command...',
        },
        x: 130, y: 580,
      },
    ],
    edges: [
      { sourceIdx: 1, targetIdx: 0 },
      { sourceIdx: 2, targetIdx: 0 },
      { sourceIdx: 3, targetIdx: 0 },
      { sourceIdx: 4, targetIdx: 2 }, // postgres → db-manager
      { sourceIdx: 5, targetIdx: 0 }, // bash hook → chef
    ],
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'Data processing pipeline with ETL agents, monitoring, and logging',
    icon: '📊',
    nodes: [
      {
        type: 'chef',
        config: {
          ...createDefaultChef(),
          projectName: 'data-pipeline',
          persona: `# Project: Data Pipeline

## Tech Stack
- Python 3.12
- pandas, polars for data processing
- Apache Airflow for orchestration
- PostgreSQL, S3 for storage

## Conventions
- Type hints on all functions
- Docstrings on public APIs
- Tests for all transformations
- Data validation at boundaries`,
        },
        x: 450, y: 20,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('data-engineer'),
          name: 'data-engineer',
          description: 'Builds and maintains data pipelines and ETL processes',
          persona: `You are a data engineering specialist:
- Design efficient ETL pipelines
- Write data transformation code
- Optimize query performance
- Handle schema evolution`,
          tools: ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'],
          model: 'sonnet',
        },
        x: 150, y: 300,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('data-validator'),
          name: 'data-validator',
          description: 'Validates data quality and integrity',
          persona: `You validate data quality:
- Check for missing values and outliers
- Verify schema compliance
- Monitor data freshness
- Generate quality reports`,
          tools: ['Read', 'Bash', 'Grep', 'Glob'],
          model: 'haiku',
          background: true,
        },
        x: 750, y: 300,
      },
      {
        type: 'memory',
        config: {
          ...createDefaultMemory(),
          scope: 'project',
          initialContent: `---
name: pipeline-state
description: Current state of data pipeline runs and known issues
type: project
---

# Pipeline State

Track active issues and run status here.`,
        },
        x: 150, y: 580,
      },
      {
        type: 'log',
        config: { name: 'pipeline-logs', directory: 'logs', format: 'jsonl' as const },
        x: 750, y: 580,
      },
    ],
    edges: [
      { sourceIdx: 1, targetIdx: 0 },
      { sourceIdx: 2, targetIdx: 0 },
      { sourceIdx: 3, targetIdx: 1 }, // memory → data-engineer
      { sourceIdx: 4, targetIdx: 1 }, // log → data-engineer
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal Starter',
    description: 'Simple starting point with a Chef and one Agent',
    icon: '🚀',
    nodes: [
      {
        type: 'chef',
        config: {
          ...createDefaultChef(),
          projectName: 'my-project',
        },
        x: 400, y: 20,
      },
      {
        type: 'agent',
        config: {
          ...createDefaultAgent('assistant'),
          name: 'assistant',
          description: 'General purpose development assistant',
          persona: `You are a helpful development assistant.
Follow the project conventions and provide clear, actionable help.`,
          tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash'],
        },
        x: 400, y: 300,
      },
    ],
    edges: [
      { sourceIdx: 1, targetIdx: 0 },
    ],
  },
];

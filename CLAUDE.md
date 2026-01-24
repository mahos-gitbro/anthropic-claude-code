# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants (particularly Claude Code) working with this repository. It outlines the codebase structure, development workflows, and key conventions to follow.

## Repository Overview

**Project Name:** anthropic-claude-code
**Purpose:** [To be defined - appears to be a new repository]
**Primary Language:** [To be determined based on future commits]
**Git Repository:** mahos-gitbro/anthropic-claude-code

## Current State

This repository is currently in its initial state with no existing codebase. This CLAUDE.md file serves as a foundational guide for future development and AI assistant interactions.

## Development Workflow

### Branch Strategy

**Feature Development:**
- All feature work should be done on feature branches
- Branch naming convention: `claude/<feature-description>-<session-id>`
- Example: `claude/claude-md-mkrk3pze7x4799q8-Utgge`

**Main Branch:**
- The main/master branch contains production-ready code
- Direct commits to main are not allowed
- All changes must go through pull requests

### Git Workflow Best Practices

**Commits:**
- Write clear, descriptive commit messages
- Use conventional commit format when possible:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for adding or updating tests
  - `chore:` for maintenance tasks

**Push Strategy:**
- Always use: `git push -u origin <branch-name>`
- Branch names must start with `claude/` and include session ID
- Retry on network errors with exponential backoff (2s, 4s, 8s, 16s)

**Fetch/Pull Strategy:**
- Prefer fetching specific branches: `git fetch origin <branch-name>`
- Use retry logic for network failures

**Pull Requests:**
- Create descriptive PR titles and descriptions
- Include a Summary section with bullet points
- Include a Test Plan section with verification steps
- Use `gh pr create` for PR creation via CLI

## Code Organization

### Recommended Directory Structure

```
.
├── src/                 # Source code
│   ├── components/      # Reusable components
│   ├── services/        # Business logic and services
│   ├── utils/           # Utility functions
│   └── types/           # Type definitions
├── tests/               # Test files
├── docs/                # Documentation
├── scripts/             # Build and automation scripts
├── .github/             # GitHub workflows and templates
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

### File Naming Conventions

- Use kebab-case for files: `user-service.ts`
- Use PascalCase for component files: `UserProfile.tsx`
- Test files should use `.test.ts` or `.spec.ts` suffix
- Configuration files should be at root level

## AI Assistant Guidelines

### Task Planning with TodoWrite

**When to Use:**
- Multi-step tasks (3+ steps)
- Complex, non-trivial tasks
- Multiple related tasks from user
- User explicitly requests todo list

**Task States:**
- `pending`: Not yet started
- `in_progress`: Currently working (limit to ONE at a time)
- `completed`: Finished successfully

**Task Management:**
- Mark tasks complete IMMEDIATELY after finishing
- Keep exactly ONE task in_progress at a time
- Remove irrelevant tasks from the list
- Only mark completed when FULLY accomplished

### Code Modification Principles

**Read Before Write:**
- NEVER propose changes to code you haven't read
- Always read files before suggesting modifications
- Understand existing patterns before adding new code

**Avoid Over-Engineering:**
- Only make changes that are directly requested
- Keep solutions simple and focused
- Don't add features beyond what was asked
- Don't add comments/docstrings to unchanged code
- Don't add error handling for impossible scenarios

**Security First:**
- Avoid command injection, XSS, SQL injection
- Validate at system boundaries (user input, external APIs)
- Trust internal code and framework guarantees
- Fix security issues immediately upon discovery

**No Backwards-Compatibility Hacks:**
- Don't rename unused variables with `_prefix`
- Don't re-export removed types
- Don't add `// removed` comments
- If something is unused, delete it completely

### Tool Usage Best Practices

**Prefer Specialized Tools:**
- Use `Read` instead of `cat/head/tail`
- Use `Edit` instead of `sed/awk`
- Use `Write` instead of `echo >` or `cat <<EOF`
- Use `Grep` instead of `grep/rg` bash commands
- Use `Glob` instead of `find` or `ls`

**Parallel Execution:**
- Run independent tool calls in parallel
- Use single message with multiple tool calls
- Don't use placeholders or guess parameters

**Task Agent Usage:**
- Use `Task` tool with `Explore` agent for codebase exploration
- Use `Task` tool when searching for patterns across multiple files
- Prefer specialized agents for specific tasks

### Communication Style

**Concise and Clear:**
- Avoid emojis unless explicitly requested
- Keep responses short and concise
- Use GitHub-flavored markdown for formatting
- Output text directly, not through bash echo

**Code References:**
- Include file paths with line numbers: `file_path:line_number`
- Example: "Error handling in `src/services/process.ts:712`"

**Professional Objectivity:**
- Prioritize technical accuracy over validation
- Provide direct, objective information
- Avoid excessive praise or superlatives
- Disagree when necessary with respectful correction

### Testing and Quality

**Before Committing:**
- Run relevant tests
- Check for type errors
- Verify build succeeds
- Review changes with `git diff`

**Test Strategy:**
- Write tests for new features
- Update tests when modifying code
- Ensure all tests pass before creating PR
- Don't commit if tests are failing

### Documentation

**Code Documentation:**
- Add comments only where logic isn't self-evident
- Update documentation when changing behavior
- Keep README.md up to date with setup instructions

**Pull Request Documentation:**
- Analyze ALL commits included in the PR
- Write comprehensive summary (1-3 bullet points)
- Include detailed test plan with checklist
- Reference related issues or tickets

## Common Operations

### Creating a Commit

1. Run `git status` (never use `-uall` flag)
2. Run `git diff` to see changes
3. Run `git log` to understand commit message style
4. Analyze changes and draft commit message
5. Add relevant files: `git add <files>`
6. Create commit with descriptive message
7. Run `git status` after commit to verify

**Commit Message Format:**
```bash
git commit -m "$(cat <<'EOF'
feat: add user authentication

Implement JWT-based authentication system with login and registration endpoints.
EOF
)"
```

### Creating a Pull Request

1. Run `git status`, `git diff`, and `git log` in parallel
2. Check if branch is up to date with remote
3. Analyze all commits that will be included
4. Create PR with summary and test plan
5. Push to remote if needed: `git push -u origin <branch-name>`

**PR Creation:**
```bash
gh pr create --title "Feature: User Authentication" --body "$(cat <<'EOF'
## Summary
- Implement JWT-based authentication
- Add login and registration endpoints
- Include token refresh mechanism

## Test Plan
- [ ] Test user registration with valid data
- [ ] Test login with correct credentials
- [ ] Test token refresh flow
- [ ] Verify error handling for invalid inputs
EOF
)"
```

### Working with GitHub

**Using gh CLI:**
- View PR comments: `gh api repos/owner/repo/pulls/123/comments`
- List issues: `gh issue list`
- View PR status: `gh pr status`
- Check CI runs: `gh run list`

## Environment Information

**Current Environment:**
- Platform: Linux
- Git Repository: Yes
- Working Directory: /home/user/anthropic-claude-code

## Future Considerations

As this repository grows, update this document to include:

1. **Technology Stack:**
   - Programming languages used
   - Frameworks and libraries
   - Build tools and package managers
   - Testing frameworks

2. **Architecture Patterns:**
   - Design patterns employed
   - State management approach
   - API design conventions
   - Database schema patterns

3. **Development Setup:**
   - Prerequisites and dependencies
   - Installation instructions
   - Environment configuration
   - Local development workflow

4. **Testing Strategy:**
   - Unit testing approach
   - Integration testing setup
   - E2E testing framework
   - Code coverage requirements

5. **Deployment Process:**
   - CI/CD pipeline details
   - Environment configurations
   - Release process
   - Rollback procedures

6. **API Conventions:**
   - Endpoint naming patterns
   - Request/response formats
   - Error handling standards
   - Authentication/authorization

7. **Code Style:**
   - Linting configuration
   - Formatting standards
   - Naming conventions
   - Import organization

## Resources

- [Claude Code Documentation](https://code.claude.com/docs/en/overview)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Anthropic Claude Code](https://www.anthropic.com/claude-code)

---

**Last Updated:** 2026-01-24
**Document Version:** 1.0.0
**Maintained By:** AI Assistants working with this repository

## Notes for AI Assistants

This document should be consulted at the start of each session to understand:
- Current repository state and structure
- Expected workflows and conventions
- Best practices for code modifications
- Git and PR processes specific to this repo

Always update this document when:
- Major architectural decisions are made
- New conventions are established
- Development workflows change
- New tools or frameworks are adopted

Keep this document as a living guide that evolves with the codebase.

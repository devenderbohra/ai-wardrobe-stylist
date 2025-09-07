# Claude Code Context Guide

## File Reference Index
This is your master reference guide for building the AI Wardrobe Stylist project. Each file serves a specific purpose in providing context for code generation.

## Core Project Files

### 1. **project-overview.md** [85]
**Use for**: Understanding the project goals, competition requirements, team structure
**Reference when**: Starting any new component, understanding business requirements
**Key sections**: Competition details, target users, success metrics

### 2. **technical-specs.md** [86] 
**Use for**: Architecture decisions, tech stack choices, data models
**Reference when**: Setting up project structure, choosing libraries, designing APIs
**Key sections**: Tech stack, data models, performance requirements

### 3. **feature-requirements.md** [87]
**Use for**: Detailed feature specifications and user stories
**Reference when**: Building specific components, understanding user interactions
**Key sections**: MVP features, user stories, acceptance criteria

### 4. **gemini-api-guide.md** [88]
**Use for**: All Gemini API integrations and prompt engineering
**Reference when**: Building outfit generation, API calls, error handling
**Key sections**: API implementation, prompt examples, optimization strategies

### 5. **development-timeline.md** [89]
**Use for**: Project planning, task prioritization, code architecture
**Reference when**: Planning development phases, structuring components
**Key sections**: Hour-by-hour timeline, component structure, testing strategy

### 6. **ui-ux-guidelines.md** [90]
**Use for**: Design system, styling, component specifications
**Reference when**: Building UI components, implementing responsive design
**Key sections**: Color palette, component patterns, responsive design

### 7. **code-documentation-standards.md** [91]
**Use for**: How to document every piece of code
**Reference when**: Writing any code - components, functions, APIs
**Key sections**: JSDoc standards, component documentation, file organization

### 8. **vscode-kaggle-workflow.md** [92]
**Use for**: Project setup, deployment, and submission process
**Reference when**: Setting up development environment, preparing for submission
**Key sections**: Project structure, Git workflow, Kaggle submission requirements

## How to Use This Context

### When Starting a New Component:
1. **Check feature-requirements.md** for specifications
2. **Reference ui-ux-guidelines.md** for design patterns  
3. **Follow code-documentation-standards.md** for documentation
4. **Use technical-specs.md** for architecture guidance

### When Integrating Gemini API:
1. **Primary reference**: gemini-api-guide.md
2. **Check technical-specs.md** for rate limiting
3. **Follow code-documentation-standards.md** for API documentation

### When Building UI Components:
1. **Design system**: ui-ux-guidelines.md
2. **Component specs**: feature-requirements.md
3. **Documentation**: code-documentation-standards.md
4. **Responsive patterns**: ui-ux-guidelines.md

### When Managing Project Timeline:
1. **Task breakdown**: development-timeline.md
2. **Priority decisions**: feature-requirements.md
3. **Submission prep**: vscode-kaggle-workflow.md

## Code Generation Guidelines

### Always Include:
- **JSDoc comments** for all functions (per code-documentation-standards.md)
- **Component documentation** in separate .md files
- **Error handling** with user-friendly messages
- **TypeScript types** for all interfaces
- **Responsive design** patterns from UI guidelines

### For Each Component, Generate:
```
ComponentName.tsx          // The React component
ComponentName.md           // Documentation explaining the component
ComponentName.test.tsx     // Basic tests (if time permits)
```

### For Each API Service, Generate:
```
service-name.ts           // Service implementation
service-name.md          // API documentation with examples  
service-name.types.ts    // TypeScript interfaces
```

### For Each Utility, Generate:
```
utility-name.ts          // Utility functions
utility-name.md         // Usage documentation
utility-name.test.ts    // Unit tests
```

## Common Patterns to Follow

### 1. Component Structure
```typescript
// Always start with comprehensive JSDoc
/**
 * # ComponentName
 * [Description from feature-requirements.md]
 * [Reference ui-ux-guidelines.md for styling]
 */

import React from 'react';
// Import types from technical-specs.md data models

interface ComponentProps {
  // Define props based on feature-requirements.md
}

export const ComponentName: React.FC<ComponentProps> = ({
  // Implement per ui-ux-guidelines.md patterns
}) => {
  // Implementation with inline comments
};
```

### 2. API Integration Pattern
```typescript
// Reference gemini-api-guide.md for all API calls
/**
 * [Function purpose from gemini-api-guide.md]
 * [Error handling strategy from technical-specs.md]
 */
async function apiFunction() {
  // Implementation following gemini-api-guide.md examples
}
```

### 3. Documentation Pattern
Every code file should have:
- File header explaining purpose
- Function-level JSDoc comments
- Complex logic explanations
- Usage examples
- Error handling documentation

## Priority Order for Development

### Phase 1 (Hours 1-8): Foundation
**Focus files**: technical-specs.md, vscode-kaggle-workflow.md, code-documentation-standards.md

### Phase 2 (Hours 9-18): Core Features  
**Focus files**: feature-requirements.md, gemini-api-guide.md, ui-ux-guidelines.md

### Phase 3 (Hours 19-24): Polish & Deploy
**Focus files**: vscode-kaggle-workflow.md, development-timeline.md

## Quick Reference Checklist

Before writing any code:
- [ ] Reviewed relevant context files
- [ ] Understood user requirements from feature-requirements.md
- [ ] Checked design patterns in ui-ux-guidelines.md  
- [ ] Prepared to document per code-documentation-standards.md

After writing any code:
- [ ] Added comprehensive JSDoc comments
- [ ] Created component documentation file
- [ ] Tested functionality works
- [ ] Verified mobile responsiveness
- [ ] Added error handling

This context guide ensures every piece of generated code aligns with project requirements, follows documentation standards, and contributes to a successful hackathon submission.
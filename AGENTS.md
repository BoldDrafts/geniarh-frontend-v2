# AGENTS.md

This file provides guidance for agentic coding assistants working on the GeniaHR Frontend codebase.

## Development Commands

### Essential Commands
```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality checks
```

### Testing
- **Note**: No automated testing framework is currently configured
- Test files in `__tests__/` directories are manual testing utilities only
- Manual testing should be done via the development server

### Pre-commit Workflow
Always run these commands before committing changes:
```bash
npm run lint         # Ensure code quality standards
npm run build        # Verify production build succeeds
```

## Code Style Guidelines

### Import Organization
**Always use relative imports** - no `@/` alias is configured:
```typescript
// Correct
import { httpClient } from '../../shared/api/httpClient';
import { Button } from '../../../shared/components/ui/Button';

// Incorrect
import { httpClient } from '@/shared/api/httpClient';
```

**Import order (top to bottom)**:
1. React imports (`import React, { useState } from 'react'`)
2. Third-party libraries (`import { toast } from 'react-hot-toast'`)
3. Internal shared utilities (`import { httpClient } from '../../shared/api/httpClient'`)
4. Feature-specific imports (`import { RecruitmentService } from '../api/recruitmentService'`)
5. Type imports (`import type { Recruitment } from '../types/recruitment'`)

### TypeScript Guidelines

**Strict typing enforced**:
- All functions must have explicit return types
- All parameters must be typed
- Use `interface` for object shapes, `type` for unions/primitives
- Always use `type` imports for pure types: `import type { User } from './types'`

**Generic patterns**:
```typescript
// Services extend BaseService with proper generics
class RecruitmentService extends BaseService<Recruitment, CreateRecruitmentRequest, UpdateRecruitmentRequest> {
  constructor() {
    super({
      baseUrl: import.meta.env.VITE_RECRUITMENT_API_URL,
      resourceName: 'recruitment',
      requireAuth: true,
      requiredRoles: ['recruiter-supervisor', 'recruiter']
    });
  }
}
```

### Component Architecture

**Functional components only**:
```typescript
const Recruitment: React.FC = () => {
  const [state, setState] = useState<Type>();
  
  return (
    <div className="container mx-auto">
      {/* JSX content */}
    </div>
  );
};

export default Recruitment;
```

**Hook patterns**:
- Extract complex state logic into custom hooks
- Use consistent naming: `useXxx` for hooks
- Return state and actions as objects from hooks

### API Service Patterns

**Always extend BaseService** for API communication:
```typescript
import { BaseService } from '../../shared/api/baseService';

export const recruitmentService = new RecruitmentService();
```

**Role-based access control**:
- Services declare required roles in constructor
- Use `authService.hasRole()` and `authService.hasPermission()` for checks
- UI components use `<ProtectedRoute roles={['role1', 'role2']}>`

### Error Handling

**Consistent error handling with BaseService**:
- Services use `handleError()` method for API errors
- UI shows toast notifications for user feedback
- Use try-catch blocks for async operations

```typescript
try {
  const result = await recruitmentService.create(data);
  toast.success('Recruitment created successfully');
} catch (error) {
  // Error already handled by BaseService
}
```

### Styling Guidelines

**Tailwind CSS only**:
- Use utility classes for styling
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- Consistent spacing with Tailwind's scale

**Component styling patterns**:
```typescript
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    {children}
  </div>
);
```

### File Naming Conventions

**Components**: PascalCase (`RecruitmentTable.tsx`, `DeleteConfirmationModal.tsx`)
**Hooks**: camelCase with `use` prefix (`useRecruitment.ts`, `useAuth.ts`)
**Services**: camelCase (`recruitmentService.ts`, `authService.ts`)
**Types**: camelCase (`recruitment.types.ts`, `shared.ts`)
**Utilities**: camelCase (`recruitmentUtils.ts`, `validators.ts`)

### Directory Structure

**Follow feature module pattern**:
```
features/{feature}/
├── api/              # Service layer (extends BaseService)
├── components/       # Feature-specific components
├── pages/            # Page-level components
├── hooks/            # Feature-specific hooks
├── types/            # TypeScript interfaces
└── config/           # Configuration files
```

### Environment Variables

**Required for development** (see `.env.example`):
- All API URLs must be configured
- TinyMCE API key for rich text editing
- N8N webhook URLs for AI generation and automation

**Access in code**:
```typescript
const apiUrl = import.meta.env.VITE_RECRUITMENT_API_URL;
```

### Authentication Integration

**Keycloak configuration**:
- Realm: `geniahrforhr`
- Server: `https://auth.cmaconsulting.org/`
- Client ID: `geniahr-oauth2-client`

**Route protection**:
```typescript
// Wrap routes requiring authentication
<AuthRoute>
  <ProtectedRoute roles={['recruiter']}>
    <Recruitment />
  </ProtectedRoute>
</AuthRoute>
```

### HTTP Client Usage

**Use singleton httpClient for non-BaseService requests**:
```typescript
import { httpClient } from '../../shared/api/httpClient';

const response = await httpClient.get('/custom-endpoint');
```

### Internationalization

**Application language**: Spanish
- UI text should be in Spanish
- Error messages in Spanish
- User-facing content in Spanish

### Development Best Practices

1. **Always check existing patterns** before creating new components/services
2. **Follow existing code style** in the file being edited
3. **Use proper TypeScript typing** - avoid `any`
4. **Handle loading states** with consistent patterns
5. **Use toast notifications** for user feedback
6. **Follow role-based access control** patterns
7. **Test in development server** before committing

### Commit Guidelines

- Build and lint must pass before committing
- No automated tests, but manual testing is expected
- Keep commits focused on single features/fixes
- Use Spanish for commit messages (following project convention)
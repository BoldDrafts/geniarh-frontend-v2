# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GeniaHR Frontend is a React + TypeScript HR management application built with Vite. The application handles recruitment processes, candidate management, interviews, and onboarding. It uses Keycloak for authentication and integrates with multiple backend microservices.

## Development Commands

### Building and Running
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Deployment
```bash
./scripts/run.sh     # Automated deployment script for containers and k8s
./aws/deploy.sh      # Deploy to AWS S3/CloudFront
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with @tailwindcss/typography
- **Routing**: React Router DOM v6
- **Authentication**: Keycloak (via @react-keycloak/web and keycloak-js)
- **HTTP Client**: Axios with custom interceptors
- **State/Notifications**: react-hot-toast
- **Rich Text Editor**: TinyMCE (@tinymce/tinymce-react)
- **Icons**: lucide-react

### Directory Structure

```
src/
├── features/              # Feature modules (domain-driven)
│   ├── authentication/    # Keycloak integration, auth routes, login
│   ├── candidate/         # Candidate management
│   ├── interviews/        # Interview scheduling and management
│   ├── recruitment/       # Recruitment processes and bulk uploads
│   └── requirement/       # Job requirements
├── shared/               # Shared utilities and components
│   ├── api/             # HTTP client and base services
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   ├── pages/           # Shared pages (Dashboard, Settings, Audit, Onboarding)
│   └── types/           # TypeScript types
└── App.tsx              # Root component with routing
```

### Feature Module Pattern

Each feature follows a consistent structure:
```
features/{feature}/
├── api/              # Service layer (extends BaseService)
├── components/       # Feature-specific components
├── pages/            # Page-level components
├── hooks/            # Feature-specific hooks
├── types/            # TypeScript interfaces
└── config/           # Configuration files
```

### API Service Architecture

The application uses a **BaseService** pattern for API communication:

1. **BaseService** (`src/shared/api/baseService.ts`): Abstract class providing:
   - Standard CRUD operations (list, get, create, update, patch, delete)
   - Pagination support with PaginatedResponse
   - Authentication validation with role-based access control
   - Custom operations (customOperation, bulkOperation)
   - Search, stats, and export functionality
   - Automatic error handling with toast notifications

2. **HttpClient** (`src/shared/api/httpClient.ts`): Axios wrapper with:
   - Automatic Keycloak bearer token injection
   - Token refresh on 401 errors
   - Request/response interceptors
   - Singleton instance exported as `httpClient`

3. **Feature Services**: Extend BaseService and add domain-specific methods
   - Example: `RecruitmentService` extends `BaseService<RecruitmentProcess, CreateRecruitmentRequest, ...>`
   - Services declare required roles: `requiredRoles: ['recruiter-supervisor', 'recruiter']`
   - Constructor specifies API base URL from environment variables

### Authentication Flow

1. **Keycloak Configuration** (`src/features/authentication/Keycloak.tsx`):
   - Realm: `geniahrforhr`
   - Server: `https://auth.cmaconsulting.org/`
   - Client ID: `geniahr-oauth2-client`
   - Strategy: `check-sso` (checks existing SSO session)

2. **Route Protection**:
   - `<AuthRoute>`: Wraps routes requiring authentication
   - `<ProtectedRoute roles={['role1', 'role2']}>`: Enforces role-based access
   - Both components use the `useAuth()` hook

3. **Token Management**:
   - HttpClient automatically adds `Bearer {token}` to all requests
   - Interceptor refreshes tokens on 401 responses
   - AuthService validates authentication before API calls

### Environment Variables

Required environment variables (see `.env.example`):
```bash
VITE_TINYMCE_API_KEY          # TinyMCE editor key
VITE_REQUIREMENTS_API_URL      # Requirements service endpoint
VITE_RECRUITMENT_API_URL       # Recruitment service endpoint
VITE_INTERVIEW_API_URL         # Interview service endpoint
VITE_CANDIDATES_API_URL        # Candidates service endpoint
VITE_N8N_LINKEDINPOST_API_URL  # N8N webhook for LinkedIn posts
VITE_AIGENERATE_DESCRIPTION    # AI description generation endpoint
VITE_AIGENERATE_PROMPT         # AI prompt generation endpoint
VITE_PREREGISTER_CANDIDATE_API_URL  # Pre-registration webhook
```

### Backend Integration

The frontend integrates with multiple microservices:
- **Recruitment API** (`/recruitmentapi/v1`) - Recruitment processes, candidates association
- **Requirements API** (`/requirementapi/v1`) - Job requirements management
- **Interview API** (`/interviewapi/v1`) - Interview scheduling
- **Candidate API** (`/candidateapi/v1`) - Candidate data management
- **N8N Webhooks** - AI generation, LinkedIn posting, RPA automation

## Development Patterns

### Creating a New Feature Service

1. Define TypeScript types in `features/{feature}/types/`
2. Create service class extending BaseService:
   ```typescript
   class MyService extends BaseService<EntityType, CreateType, UpdateType> {
     constructor() {
       super({
         baseUrl: import.meta.env.VITE_MY_API_URL,
         resourceName: 'my-resources',
         requireAuth: true,
         requiredRoles: ['required-role'],
         requireAllRoles: false
       });
     }

     // Add custom methods beyond CRUD
     async customOperation(id: string, data: any) {
       return this.customOperation(id, 'operation-name', data, 'POST');
     }
   }

   export const myService = new MyService();
   ```

3. Use in components:
   ```typescript
   const data = await myService.list({ page: 1, limit: 20 });
   const item = await myService.get(id);
   await myService.create(newItem);
   ```

### Role-Based Access Control

Check roles in components:
```typescript
import { authService } from '@/shared/api/authService';

// Single role check
if (authService.hasRole('admin')) { /* ... */ }

// Multiple roles (any match)
if (authService.hasPermission(['admin', 'supervisor'], false)) { /* ... */ }

// Multiple roles (all required)
if (authService.hasPermission(['role1', 'role2'], true)) { /* ... */ }
```

### HTTP Client Usage

The singleton `httpClient` is available for non-BaseService requests:
```typescript
import { httpClient } from '@/shared/api/httpClient';

// Standard requests
const response = await httpClient.get('/custom-endpoint');
await httpClient.post('/webhook', data);

// Custom configuration
httpClient.setBaseURL('https://new-base-url.com');
httpClient.setHeader('X-Custom-Header', 'value');
```

## Deployment

### Docker Build
The Dockerfile uses multi-stage build:
1. **Builder stage**: Node 18 Alpine, runs `npm ci` and `npm run build`
2. **Runtime stage**: Nginx Alpine, serves from `/usr/share/nginx/html/geniahrv2-dev.synopsis.cloud/`

### Nginx Configuration
- Serves SPA with `try_files $uri $uri/ /index.html`
- Gzip compression enabled for text/css/js/json/xml/svg
- Port 80 listener

### AWS Deployment
Located in `./aws/` directory:
- `deploy.sh` - Main deployment orchestration
- `build.sh` - Builds application
- `upload.sh` - Uploads to S3
- `configure-s3.sh` - S3 bucket configuration
- `configure-cloudfront.sh` - CloudFront distribution setup
- `update-cloudfront.sh` - Updates CloudFront configuration

### Kubernetes
K8s manifests located in `./scripts/k8s/`
Use `./scripts/run.sh` for automated deployment pipeline

## Key Application Routes

| Route | Component | Roles Required | Description |
|-------|-----------|----------------|-------------|
| `/login` | LoginPage | None (public) | Login page |
| `/` | Dashboard | Authenticated | Main dashboard |
| `/requirements` | Requirements | Authenticated | Job requirements |
| `/recruitment` | Recruitment | recruiter-supervisor, recruiter | Recruitment processes |
| `/recruitment/:id/candidates` | RecruitmentCandidates | recruiter-supervisor, recruiter | Candidates for process |
| `/recruitment/:id/candidates/bulk-upload` | BulkCandidateUpload | recruiter-supervisor, recruiter | Bulk candidate upload |
| `/candidates` | Candidates | Authenticated | All candidates |
| `/interviews` | Interviews | Authenticated | Interview list |
| `/interviews/:id` | InterviewDetailPage | Authenticated | Interview details |
| `/onboarding` | Onboarding | Authenticated | Onboarding process |
| `/settings` | Settings | Authenticated | User settings |
| `/audit` | Audit | Authenticated | Audit logs |

## Notes

- Main branch: `main`
- Development branch: `develop`
- The application expects Keycloak to be accessible at `https://auth.cmaconsulting.org/`
- All API services use bearer token authentication automatically via HttpClient interceptors
- Toast notifications (react-hot-toast) are used for user feedback throughout the application
- TypeScript strict mode is enabled - all API interactions should be properly typed
# Stage Due Dates Service Layer

## Overview

This directory contains the service layer implementation for Stage Due Dates functionality in the recruitment process. It provides a complete API integration following the OpenAPI specification for managing due dates for each recruitment stage.

## Files

### 📁 `stageDueDateService.ts`
Main service class that provides direct API integration with the backend.

### 📄 `stageDueDate.ts`
TypeScript type definitions for all Stage Due Date related interfaces.

### 🎣 `useStageDueDates.ts`
React hook for consuming the service with state management and convenience methods.

## Features

### 🔧 **Core Operations**
- **CRUD Operations**: Create, Read, Update, Delete stage due dates
- **Filtering**: By stage, completion status, overdue status
- **Sorting**: By date, stage, overdue days
- **Pagination**: Complete pagination support

### 📊 **Advanced Features**
- **Overdue Detection**: Automatic calculation and filtering of overdue dates
- **Alert Management**: Configure and retrieve upcoming alerts
- **Bulk Operations**: Batch creation and updates
- **Statistics**: Completion rates, overdue counts, summaries
- **Stage-based Operations**: Get due dates by specific stage

### 🔐 **Security & Permissions**
- **Role-based Access**: Requires recruiter or recruiter-supervisor roles
- **Authentication**: Automatic token validation
- **Permission Checking**: Local validation before API calls

## Usage Examples

### Basic Service Usage

```typescript
import { stageDueDateService } from '../api/stageDueDateService';

// Create a new due date
const dueDate = await stageDueDateService.createStageDueDate(recruitmentId, {
  stage: 'screening',
  dueDate: '2025-08-15',
  alertDays: 3,
  notes: 'Complete initial screening'
});

// Get all due dates
const allDueDates = await stageDueDateService.getStageDueDates(recruitmentId);

// Get overdue dates
const overdue = await stageDueDateService.getOverdueStageDueDates(recruitmentId, {
  daysOverdue: 1
});
```

### Hook Usage

```typescript
import { useStageDueDates } from '../hooks/useStageDueDates';

const Component = ({ recruitmentId }) => {
  const {
    dueDates,
    loading,
    error,
    stats,
    createDueDate,
    updateDueDate,
    deleteDueDate,
    markAsCompleted,
    getOverdue,
    getUpcomingAlerts,
    calculateDaysOverdue
  } = useStageDueDates({ 
    recruitmentId,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const handleCreate = async () => {
    try {
      await createDueDate({
        stage: 'technical',
        dueDate: '2025-08-25',
        alertDays: 2
      });
    } catch (error) {
      console.error('Failed to create due date:', error);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {stats && (
        <div>
          <p>Completion Rate: {stats.completionRate}%</p>
          <p>Overdue: {stats.overdue}</p>
        </div>
      )}
      <button onClick={handleCreate}>
        Add Due Date
      </button>
    </div>
  );
};
```

### Advanced Operations

```typescript
// Bulk operations
const bulkRequests = [
  { stage: 'screening', dueDate: '2025-08-15' },
  { stage: 'technical', dueDate: '2025-08-25' }
];

const results = await stageDueDateService.bulkCreate(recruitmentId, bulkRequests);

// Statistics and analytics
const stats = await stageDueDateService.getStats(recruitmentId);
const summary = await stageDueDateService.getSummary(recruitmentId);

// Convenience methods
await stageDueDateService.createForStage(recruitmentId, 'screening', '2025-08-15');
await stageDueDateService.markAsCompleted(recruitmentId, stageDueDateId, 'All candidates screened');
await stageDueDateService.updateAlertConfig(recruitmentId, stageDueDateId, 5);
```

## Type Definitions

### Core Types

```typescript
// Main entity
interface StageDueDate {
  id: string;
  stage: StageEnum;
  dueDate: string;
  alertDays?: number;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
interface CreateStageDueDateRequest {
  stage: StageEnum;
  dueDate: string;
  alertDays?: number;
  notes?: string;
}

interface UpdateStageDueDateRequest {
  dueDate?: string;
  alertDays?: number;
  isCompleted?: boolean;
  notes?: string;
}

// Filter and parameter types
interface StageDueDateFilterParams {
  stage?: StageEnum;
  isOverdue?: boolean;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'stage' | 'dueDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Analytics types
interface StageDueDateStats {
  total: number;
  completed: number;
  overdue: number;
  upcomingAlerts: number;
  completionRate: number;
}

interface StageDueDateSummary {
  stage: StageEnum;
  dueDate: string;
  isCompleted: boolean;
  daysOverdue?: number;
  daysUntilDue?: number;
  alertDays?: number;
  status: 'completed' | 'on-time' | 'overdue' | 'alert-due';
}
```

### Enums

```typescript
type StageEnum = 
  | 'applied'
  | 'screening'
  | 'technical'
  | 'cultural'
  | 'offer'
  | 'hired';
```

## Error Handling

The service provides comprehensive error handling:

### HTTP Errors
- **401 Unauthorized**: Permission validation errors
- **404 Not Found**: Recruitment process or due date not found
- **400 Validation**: Invalid due dates, stage conflicts
- **500 Server Error**: General server issues

### Specific Errors
- **STAGE_DUE_DATE_EXISTS**: Due date already exists for stage
- **INVALID_DUE_DATE**: Due date must be in future
- **INVALID_STAGE**: Invalid stage specified

### User Feedback
- **Toast Notifications**: All operations show user feedback
- **Permission Messages**: Clear error messages for permission issues
- **Validation Messages**: Specific validation error descriptions

## Integration with Recruitment Process

Stage due dates are integrated into the main `RecruitmentProcess` interface:

```typescript
interface RecruitmentProcess {
  // ... existing fields
  stageDueDates: StageDueDate[]; // New field
}
```

## Best Practices

### ✅ **Usage Guidelines**
1. **Always validate permissions** before operations
2. **Handle loading states** properly in UI
3. **Use convenience methods** for common operations
4. **Check completion status** before updates
5. **Validate due dates** are in the future
6. **Use bulk operations** for multiple updates

### ⚠️ **Common Pitfalls**
1. **Forgotten permission checks** - Use hook auto-validation
2. **Invalid date formats** - Use YYYY-MM-DD format
3. **Missing error handling** - All methods throw on error
4. **Race conditions** - Avoid concurrent updates without proper state management

### 🔄 **Auto-refresh**
- Enable auto-refresh for real-time updates
- Configure appropriate intervals (30-60 seconds)
- Clean up intervals on component unmount

## API Endpoints Integration

The service integrates with these OpenAPI endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/recruitments/{id}/stage-due-dates` | List all due dates |
| POST | `/recruitments/{id}/stage-due-dates` | Create due date |
| GET | `/recruitments/{id}/stage-due-dates/{dueDateId}` | Get specific due date |
| PUT | `/recruitments/{id}/stage-due-dates/{dueDateId}` | Update due date |
| DELETE | `/recruitments/{id}/stage-due-dates/{dueDateId}` | Delete due date |
| GET | `/recruitments/{id}/stage-due-dates/overdue` | Get overdue dates |
| GET | `/recruitments/{id}/stage-due-dates/alerts` | Get upcoming alerts |

## Development Notes

- **Environment Variables**: Uses `VITE_RECRUITMENT_API_URL`
- **Authentication**: Automatic Bearer token injection
- **Base URL**: Configurable through environment
- **Singleton Pattern**: Service exported as singleton instance
- **Error Propagation**: All async methods throw errors properly
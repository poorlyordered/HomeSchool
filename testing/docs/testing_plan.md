# HomeSchool Testing and Bug Tracking Plan

## Energy/Focus Units Framework

Our project management approach uses a flexible energy/focus unit system rather than rigid timeframes. This approach applies to ALL project tasks, not just testing:

- **Quick Win**: Immediate, low-effort task (30-60 minutes)
- **Sprint**: Focused 4-6 hour block
- **Deep Work**: Full day dedicated effort
- **Project Phase**: Multi-day concentrated work
- **Milestone**: Significant deliverable completion

This framework allows us to plan and execute tasks based on available energy levels rather than rigid timeframes, making it more adaptable to the realities of development work.

## 1. Bug Tracking Structure

**Effort: Quick Win** ✓ COMPLETED

### Folder Structure

```
testing/
├── docs/
│   ├── test_matrix.md
│   ├── bug_report_template.md
│   └── testing_plan.md
├── bugs/
│   ├── active/
│   │   ├── P1-critical/
│   │   ├── P2-high/
│   │   ├── P3-medium/
│   │   └── P4-low/
│   └── resolved/
│       └── P3-medium/
└── reports/
    ├── weekly_status_template.md
    └── testing_progress_tracker.md
```

### Bug File Naming Convention

`BUG-001-component-short-description.md`

Example: `BUG-001-reset-password-token-validation.md`

### Bug File Template

```markdown
# BUG-001: Component - Short Description

## Status: Active

## Priority: P2 (High)

## Discovered: YYYY-MM-DD

## Component: ComponentName

## Description

Concise description of the issue.

## Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

## Expected Result

What should happen.

## Actual Result

What actually happens.

## Notes

- Additional context
- Potential causes

## Resolution

(To be filled when fixed)
```

## 2. Component Testing Implementation

### Authentication Components

**Effort: Sprint (Focused 4-6 hour block)** ✓ COMPLETED

- EmailVerification.tsx ✓
- ResetPassword.tsx ✓
- ForgotPassword.tsx ✓
- SessionExpired.tsx ✓
- AuthForm.tsx ✓

### Dashboard Components

**Effort: Sprint (Focused 4-6 hour block)** ✓ COMPLETED

- GuardianDashboard.tsx ✓
- StudentDashboard.tsx ✓

### Management Components

**Effort: Deep Work (Full day dedicated effort)** ✓ COMPLETED

- StudentManagement.tsx ✓
- GuardianManagement.tsx ✓
- AccountSettings.tsx ✓

### Academic Components

**Effort: Deep Work (Full day dedicated effort)** ⚠️ IN PROGRESS

- CourseManagement.tsx ✓
- TestScoreManagement.tsx ⚠️
- TestScores.tsx ⚠️
- TranscriptPDF.tsx ⚠️

### Testing Approach

1. Test component rendering ✓
2. Test user interactions ✓
3. Test state changes ✓
4. Test error handling ✓
5. Document bugs found ✓

## 3. Manual Testing Process

**Effort: Sprint (Focused 4-6 hour block)** ✓ COMPLETED

### Process

1. Select test area from test matrix ✓
2. Execute test cases ✓
3. Document bugs found ✓
4. Update test matrix with results ✓
5. Prioritize findings ✓

### Test Session Structure

- Focus on one functional area per session ✓
- Complete all test cases in that area ✓
- Document all issues before moving on ✓
- Update test matrix immediately ✓

## 4. Playwright E2E Testing

**Effort: Project Phase (Multi-day concentrated work)** ⚠️ IN PROGRESS

> **Note:** A comprehensive implementation plan for Playwright E2E testing has been created. See [Playwright Implementation Plan](./playwright_implementation_plan.md) for detailed information.

### Implementation Breakdown

1. **Initial Setup: Quick Win** ⚠️

   - Install Playwright
   - Create basic configuration
   - Set up test directory structure

2. **Authentication Flow Test: Sprint** ⚠️

   - Login/logout
   - Registration
   - Password reset

3. **Guardian Flow Test: Sprint** ⚠️

   - Student management
   - Course entry
   - Transcript generation

4. **Student Flow Test: Sprint** ⚠️
   - View courses
   - View test scores
   - Access transcript

### E2E Testing Approach

- Focus on critical user journeys
- Test complete flows, not just individual screens
- Verify data persistence across flows
- Test error recovery scenarios
- Use Page Object Model pattern for maintainable tests
- Implement test fixtures for common setup and authentication

## 5. Bug Management Process

**Effort: Variable (depends on bug complexity)** ✓ IMPLEMENTED

### Bug Categorization

- **Quick Win Bugs**: UI tweaks, text changes, simple validation fixes
- **Sprint Bugs**: Component logic issues, form handling problems, state management fixes
- **Deep Work Bugs**: Cross-component issues, data flow problems, complex logic bugs

### Bug Review Process

1. Review active bugs weekly ✓
2. Prioritize based on impact and effort ✓
3. Select bugs that match available energy level ✓
4. Fix, verify, and move to resolved folder ✓
5. Update test matrix and progress tracker ✓

### Current Bug Status

- **Active Bugs**: 2
  - BUG-001: ResetPassword - Insufficient Token Validation (P3-Medium)
  - BUG-003: CourseManagement - Test Timeouts (P3-Medium)
- **Resolved Bugs**: 1
  - BUG-002: StudentDashboard - Test Failure in Error Handling During Logout (P3-Medium)

## 6. Error Handling Extension

**Effort: Milestone (Significant deliverable completion)** ✓ COMPLETED

### Implementation Approach

1. **Component Audit: Sprint** ✓

   - Review error handling in all components ✓
   - Identify patterns and gaps ✓
   - Create prioritized list of improvements ✓

2. **Error Pattern Creation: Sprint** ✓

   - Standardize error handling approaches ✓
   - Create reusable error handling snippets ✓
   - Document best practices ✓

3. **High-Priority Implementation: Deep Work** ✓

   - Focus on critical components first ✓
   - Implement consistent error handling ✓
   - Test error scenarios ✓

4. **Medium-Priority Implementation: Deep Work** ✓
   - Extend to remaining components ✓
   - Ensure consistent approach ✓
   - Add tests for error conditions ✓

### Error Handling Coverage

- Centralized error handling utility implemented ✓
- Error handling implemented in all authentication components ✓
- Error handling implemented in all dashboard components ✓
- Error handling implemented in all management components ✓
- Error handling partially implemented in academic components ⚠️

## 7. Documentation

**Effort: Sprint (Focused 4-6 hour block)** ✓ COMPLETED

### Documentation Areas

- Component testing guide ✓
- Manual testing process ✓
- E2E testing setup and execution ⚠️
- Bug management workflow ✓
- Error handling patterns ✓

### Documentation Format

- Markdown files in project repository ✓
- Practical examples ✓
- Concise instructions ✓
- Focus on maintainability ✓

## 8. Progress Tracking

### Progress Tracker Template

```markdown
# Testing Progress Tracker

## Components Tested

- [x] AuthForm
- [x] EmailVerification
- [x] ResetPassword
- [x] ForgotPassword
- [x] SessionExpired
- [x] GuardianDashboard
- [x] StudentDashboard
- [x] StudentManagement
- [x] GuardianManagement
- [x] AccountSettings
- [x] CourseManagement
- [ ] TestScoreManagement
- [ ] TestScores
- [ ] TranscriptPDF

## Bugs By Status

- Active: 2
- Resolved: 1

## Bugs By Priority

- P1 (Critical): 0
- P2 (High): 0
- P3 (Medium): 3
- P4 (Low): 0

## Next Focus Areas

1. Implement tests for TestScoreManagement component
2. Implement tests for TestScores component
3. Implement tests for TranscriptPDF component
4. Fix identified bugs (based on priority)
```

## 9. Implementation Sequence

### Completed Sessions

1. ✓ Create the bug tracking folder structure
2. ✓ Set up the bug template
3. ✓ Create a simple bug tracking README
4. ✓ Implement tests for EmailVerification component
5. ✓ Implement tests for ResetPassword component
6. ✓ Implement tests for ForgotPassword component
7. ✓ Implement tests for SessionExpired component
8. ✓ Implement tests for AuthForm component
9. ✓ Implement tests for StudentDashboard component
10. ✓ Implement tests for GuardianDashboard component
11. ✓ Implement tests for StudentManagement component
12. ✓ Implement tests for GuardianManagement component
13. ✓ Implement tests for AccountSettings component
14. ✓ Implement tests for CourseManagement component
15. ✓ Fix StudentDashboard test failure (BUG-002)
16. ✓ Document CourseManagement test timeout issues (BUG-003)

### Current Session

1. ⚠️ Implement tests for TestScoreManagement component
2. ⚠️ Address ResetPassword token validation issue (BUG-001)

### Next Sessions

1. Implement tests for TestScores component
2. Implement tests for TranscriptPDF component
3. Set up initial Playwright E2E testing framework
4. Implement Authentication Flow E2E tests

## 10. Recent Improvements and Additions

### New Features Implemented and Tested

- ✓ Course grouping by category feature in StudentDashboard and GuardianDashboard
- ✓ GroupedCourseList component for displaying courses organized by category
- ✓ Test score management data loading functionality
- ✓ Enhanced error handling across all components
- ✓ Improved accessibility with proper form control associations

### Database Enhancements

- ✓ Added database migration for linking courses to standard courses

### Testing Infrastructure Improvements

- ✓ Enhanced test structure with better timer mocking
- ✓ Improved mocking for Supabase operations and auth functions
- ✓ Comprehensive test suite for AccountSettings component with 19 test cases
- ✓ Fixed StudentDashboard test to use the correct selector for loading spinner

## 11. Known Issues and Limitations

- CourseManagement component tests have timeout issues (BUG-003)
- ResetPassword component needs improved token validation (BUG-001)
- E2E testing framework not yet implemented
- TestScoreManagement, TestScores, and TranscriptPDF components not fully tested

## 12. Next Steps

1. Complete testing for remaining components:
   - TestScoreManagement
   - TestScores
   - TranscriptPDF
2. Address active bugs:
   - BUG-001: ResetPassword token validation
   - BUG-003: CourseManagement test timeouts
3. Set up Playwright E2E testing framework
4. Implement E2E tests for critical user flows
5. Continue to maintain and update testing documentation

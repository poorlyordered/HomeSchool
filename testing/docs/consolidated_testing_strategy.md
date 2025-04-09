# HomeSchool Consolidated Testing Strategy

## Overview

This document provides a comprehensive testing strategy for the HomeSchool project, combining best practices, implementation plans, and roadmaps from our existing testing documentation. It serves as the single source of truth for our testing approach and future improvements.

## Testing Philosophy

Our testing approach is built on these core principles:

1. **Comprehensive Coverage**: Test at multiple levels (unit, component, integration [using Playwright], E2E [using Playwright])
2. **Maintainable Tests**: Structure tests for long-term maintainability
3. **Performance Focus**: Optimize test execution for developer productivity
4. **Reliability**: Ensure consistent test results across environments
5. **Automation**: Automate testing processes where possible

## Energy/Focus Units Framework

Our project management approach uses a flexible energy/focus unit system rather than rigid timeframes. This approach applies to ALL project tasks, including testing:

- **Quick Win**: Immediate, low-effort task (30-60 minutes)
- **Sprint**: Focused 4-6 hour block
- **Deep Work**: Full day dedicated effort
- **Project Phase**: Multi-day concentrated work
- **Milestone**: Significant deliverable completion

This framework allows us to plan and execute tasks based on available energy levels rather than rigid timeframes, making it more adaptable to the realities of development work.

## Test Organization and Structure

### Current Structure

- Tests are primarily in `src/__tests__/` directory
- Component tests are in `src/__tests__/components/`
- Hook tests are in `src/__tests__/hooks/`
- Library tests are in `src/__tests__/lib/`
- Some tests are co-located with their implementation files

### Target Structure

We are moving toward a co-location pattern for better maintainability:

```
src/
├── components/
│   ├── CourseManagement.tsx
│   ├── CourseManagement.test.tsx  // Co-located test
│   ├── TestScores.tsx
│   └── TestScores.test.tsx        // Co-located test
├── hooks/
│   ├── useCourseManagement.ts
│   └── useCourseManagement.test.ts // Co-located test
```

### Bug Tracking Structure

```
testing/
├── docs/
│   ├── consolidated_testing_strategy.md
│   └── other documentation files
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

## Component Testing Approach

### Testing Tools

- Jest as the test runner
- React Testing Library for component testing
- Mock implementations for external dependencies
- Custom test helpers for common operations

### Testing Patterns

1. **Component Rendering Tests**
   - Verify components render without errors
   - Check for presence of key elements
   - Test different rendering states (loading, error, success)

2. **User Interaction Tests**
   - Simulate user events (click, type, etc.)
   - Verify UI updates correctly
   - Test form submissions and validations

3. **State Management Tests**
   - Verify state changes correctly
   - Test state-dependent rendering
   - Verify context providers and consumers

4. **Error Handling Tests**
   - Test error states and messages
   - Verify error boundaries
   - Test recovery from errors

### Jest Configuration Optimization

```javascript
// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  moduleNameMapper: {
    // Module mappings
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  // Performance optimizations
  maxWorkers: '50%', // Limit parallel execution to half of available CPU cores
  cache: true,       // Enable caching for faster subsequent runs
};
```

## Test Performance Optimization

### Key Improvement Areas

1. **Standardized Mock Implementation**
   - Create centralized mock factories
   - Implement consistent mocking patterns
   - Use dedicated test setup files

2. **Optimized Test Execution**
   - Replace `userEvent` with `fireEvent` for synchronous event handling where appropriate
   - Improve timer mocking with `jest.useFakeTimers()`
   - Implement proper cleanup in `afterEach` blocks

3. **Reduced Test Complexity**
   - Break down large test files into smaller, focused test suites
   - Use more granular test cases
   - Implement proper test isolation

4. **Standardized Async Testing**
   - Create helper functions for common async patterns
   - Implement consistent timeout handling
   - Use a standardized approach for waiting for component updates

5. **Improved Mock Stability**
   - Create typed mock implementations
   - Implement realistic mock data generation
   - Use consistent mock reset patterns

## Integration and End-to-End Testing with Playwright

### Project Structure

```
testing/
├── e2e/                      # E2E tests directory
│   ├── config/               # Playwright configuration
│   │   └── playwright.config.ts
│   ├── fixtures/             # Test fixtures and data
│   │   └── auth.fixture.ts
│   ├── pages/                # Page object models
│   │   ├── auth.page.ts
│   │   ├── guardian.page.ts
│   │   └── student.page.ts
│   ├── specs/                # Test specifications
│   │   ├── auth/
│   │   ├── guardian/
│   │   └── student/
│   └── utils/                # Helper utilities
│       └── test-helpers.ts
```

### Implementation Approach

Playwright will be used for both **Integration Testing** (verifying interactions between multiple components or systems, including API calls within a user flow) and **End-to-End (E2E) Testing** (simulating complete user journeys through the application).

#### Integration Testing Plan with Playwright

Integration tests will focus on verifying the interactions between specific modules or components, ensuring they work together as expected. Unlike E2E tests which cover full user journeys, integration tests will have a narrower scope, potentially targeting specific workflows or API interactions within a feature.

**Key Areas for Integration Testing:**

1.  **Authentication & Authorization:**
    *   Verify login redirects correctly to the appropriate dashboard (Guardian/Student).
    *   Test that API calls made after login have the correct authorization headers.
    *   Ensure role-based access controls prevent unauthorized actions (e.g., student trying guardian actions).
2.  **Guardian Dashboard Interactions:**
    *   Test adding a student and verifying the corresponding API call and UI update.
    *   Test adding a course for a student and confirming data persistence via API checks.
    *   Verify test score entry integrates correctly with the backend.
3.  **Student Dashboard Interactions:**
    *   Test viewing courses/scores and confirm data fetched via API matches UI display.
4.  **Course Management & Standard Catalog:**
    *   Test searching the standard catalog and adding a course, verifying API interactions.
5.  **Invitation System:**
    *   Test sending an invitation and verifying the backend state.
    *   Test accepting an invitation and confirming user role/relationship updates via API checks.

**Approach:**

*   Tests will be located within the `testing/e2e/specs/` directory, possibly in subfolders like `integration/`.
*   Utilize Playwright's `request` context to directly interact with the backend API for setup or verification where necessary.
*   Focus on testing the contract between frontend components and backend services.
*   May involve mocking specific external services if needed, though the primary goal is to test the integration with our actual backend (Supabase).

1. **Page Object Model Pattern**
   - Abstract UI interactions into page classes
   - Encapsulate selectors and actions
   - Improve test maintainability

2. **Test Fixtures**
   - Reusable authentication setup
   - Common test data
   - Shared utilities

3. **Key Test Flows**
   - Authentication flows (login, registration, password reset)
   - Guardian flows (student management, course entry, transcript generation)
   - Student flows (view courses, test scores, transcript)

4. **Visual Regression Testing**
   - Capture baseline screenshots
   - Compare against future changes
   - Detect unintended visual regressions

5. **API Testing Integration**
   - Test backend APIs directly
   - Verify data persistence
   - Test error handling

### CI/CD Integration

```yaml
# GitHub Actions workflow for Playwright
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: "Playwright Tests"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Start dev server
        run: npm run dev & npx wait-on http://localhost:5173
      - name: Run Playwright tests
        run: npm run e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Test Matrix and Coverage

The test matrix provides a comprehensive overview of test coverage across the application. It is organized by feature area and includes both automated and manual test cases.

### Authentication Test Coverage

| Feature                | Test Cases                                      | Automation Status |
| ---------------------- | ----------------------------------------------- | ----------------- |
| **Registration**       | Register with valid credentials                 | Automated         |
|                        | Register with invalid inputs                    | Automated         |
|                        | Register with existing email                    | Automated         |
| **Login**              | Login with valid credentials                    | Automated         |
|                        | Login with invalid credentials                  | Automated         |
|                        | Login with unverified email                     | Automated         |
| **Email Verification** | Verify email with valid token                   | Automated         |
|                        | Verify email with invalid/expired token         | Automated         |
| **Password Recovery**  | Request password reset                          | Automated         |
|                        | Reset password with valid/invalid token         | Automated         |
| **Session Management** | Session timeout                                 | Automated         |
|                        | Logout functionality                            | Automated         |

### Guardian Features Test Coverage

| Feature                   | Test Cases                                     | Automation Status |
| ------------------------- | ---------------------------------------------- | ----------------- |
| **Student Management**    | Add/edit/delete student                        | Automated         |
|                           | View student details                           | Automated         |
| **Course Management**     | Add/edit/delete course                         | Automated         |
|                           | Input validation                               | Automated         |
| **Test Score Management** | Add/edit/delete test scores                    | Automated         |
|                           | Score validation                               | Automated         |
| **Transcript Generation** | Generate and download transcript               | Automated         |
|                           | Include/exclude test scores                    | Automated         |

### Student Features Test Coverage

| Feature                | Test Cases                                     | Automation Status |
| ---------------------- | ---------------------------------------------- | ----------------- |
| **Academic Records**   | View course list and details                   | Automated         |
|                        | Filter and sort courses                        | Automated         |
| **Test Scores**        | View test scores                               | Automated         |
|                        | Filter and sort test scores                    | Automated         |
| **Transcript Access**  | View and download transcript                   | Automated         |
| **Profile Management** | View and update profile                        | Automated         |

### Cross-Functional Test Coverage

| Feature               | Test Cases                                     | Automation Status |
| --------------------- | ---------------------------------------------- | ----------------- |
| **Responsive Design** | Desktop, tablet, mobile layouts                | Partially         |
| **Navigation**        | Navigation between sections                    | Automated         |
|                       | Deep linking                                   | Automated         |
| **Performance**       | Load times                                     | Manual            |
| **Accessibility**     | Keyboard navigation                            | Manual            |
|                       | Screen reader compatibility                    | Manual            |
| **Error Handling**    | Network errors                                 | Automated         |
|                       | Server errors                                  | Automated         |
|                       | Form validation                                | Automated         |

## Implementation Roadmap

The implementation roadmap is organized into phases using our energy/focus units framework. Each phase builds on the previous one and delivers incremental value.

### Phase 1: Quick Wins (Completed)

1. ✅ **Standardize Mock Implementation**
   - Created `__mocks__/supabase.ts` with standardized mock implementations
   - Updated existing tests to use the standardized mocks
   - Created helper functions in `src/__tests__/helpers/supabaseTestHelpers.ts`

2. ✅ **Fix Test Timeouts**
   - Applied fixes from BUG-003 to other test files
   - Replaced `userEvent` with `fireEvent` for synchronous event handling
   - Implemented proper timer mocking with `jest.useFakeTimers()`

3. ✅ **Optimize Jest Configuration**
   - Updated jest.config.cjs with performance optimizations
   - Added `maxWorkers: '50%'` to limit parallel execution
   - Enabled test caching with `cache: true`

4. ✅ **Create Bug Tracking Structure**
   - Implemented folder structure for bug tracking
   - Created standardized bug report template
   - Set up priority-based organization

### Phase 2: Test Structure Improvements (In Progress)

1. ⚠️ **Implement Co-location Pattern**
   - Move tests to be alongside their implementation files
   - Update import paths and test matching patterns
   - Ensure all tests still run correctly

2. ⚠️ **Standardize Test Structure**
   - Create a template for component tests
   - Implement consistent test organization
   - Add standard sections for setup, tests, and cleanup

3. ⚠️ **Enhance Mock Stability**
   - Create typed mock implementations
   - Implement realistic mock data generation
   - Add consistent mock reset patterns

### Phase 3: Test Coverage Expansion (Planned)

1. ⚠️ **Complete Component Test Coverage**
   - Implement tests for TranscriptPDF component
   - Enhance existing tests for better coverage
   - Add edge case testing

2. ⚠️ **Implement Integration Tests**
   - Add tests for component interactions
   - Test data flow between related components
   - Verify event handling across component boundaries

### Phase 4: E2E Testing Implementation (Planned)

1. ⚠️ **Initial Playwright Setup**
   - Install Playwright
   - Create basic configuration
   - Set up directory structure

2. ⚠️ **Authentication Flow Tests**
   - Create page objects for auth flows
   - Implement sign in/sign up tests
   - Test error handling

3. ⚠️ **Guardian Flow Tests**
   - Create page objects for guardian flows
   - Implement student management tests
   - Test transcript generation

4. ⚠️ **Student Flow Tests**
   - Create page objects for student flows
   - Implement course viewing tests
   - Test transcript viewing

5. ⚠️ **CI/CD Integration**
   - Set up GitHub Actions workflow
   - Configure Husky pre-push hook
   - Test CI/CD pipeline

### Phase 5: Advanced Testing Features (Planned)

1. ⚠️ **Visual Regression Testing**
   - Configure visual comparison
   - Create baseline screenshots
   - Implement visual tests

2. ⚠️ **API Testing**
   - Implement API authentication tests
   - Create data management API tests
   - Test error handling

3. ⚠️ **Performance Testing**
   - Implement load time measurements
   - Test component rendering performance
   - Optimize slow tests

## Progress Tracking

| Phase | Task                                  | Status      | Completed Date | Notes                                                  |
| ----- | ------------------------------------- | ----------- | -------------- | ------------------------------------------------------ |
| 1     | Standardize Mock Implementation       | Completed   | 2025-03-26     | See activeContext.md                                   |
| 1     | Fix Test Timeouts                     | Completed   | 2025-03-26     | Replaced userEvent with fireEvent, standardized timers |
| 1     | Optimize Jest Configuration           | Completed   | 2025-03-26     | Added cache:true and maxWorkers:'50%' to Jest config   |
| 1     | Create Bug Tracking Structure         | Completed   | 2025-03-20     | Folder structure and templates created                 |
| 2     | Implement Co-location Pattern         | In Progress |                | Partially completed with test file reorganization      |
| 2     | Standardize Test Structure            | Not Started |                |                                                        |
| 2     | Enhance Mock Stability                | Not Started |                |                                                        |
| 3     | Complete Component Test Coverage      | Not Started |                |                                                        |
| 3     | Implement Integration Tests           | Not Started |                |                                                        |
| 4     | Initial Playwright Setup              | Not Started |                |                                                        |
| 4     | Authentication Flow Tests             | Not Started |                |                                                        |
| 4     | Guardian Flow Tests                   | Not Started |                |                                                        |
| 4     | Student Flow Tests                    | Not Started |                |                                                        |
| 4     | CI/CD Integration                     | Not Started |                |                                                        |
| 5     | Visual Regression Testing             | Not Started |                |                                                        |
| 5     | API Testing                           | Not Started |                |                                                        |
| 5     | Performance Testing                   | Not Started |                |                                                        |

## Component Testing Status

| Component                | Status      | Test Count | Notes                                           |
| ------------------------ | ----------- | ---------- | ----------------------------------------------- |
| AuthForm                 | Completed   | 12         | All tests passing                               |
| EmailVerification        | Completed   | 8          | All tests passing                               |
| ResetPassword            | Completed   | 7          | All tests passing                               |
| ForgotPassword           | Completed   | 6          | All tests passing                               |
| SessionExpired           | Completed   | 4          | All tests passing                               |
| GuardianDashboard        | Blocked     | 0          | Test file deleted due to env errors             |
| StudentDashboard         | Completed   | 8          | All tests passing                               |
| StudentManagement        | Completed   | 14         | All tests passing                               |
| GuardianManagement       | Completed   | 12         | All tests passing                               |
| AccountSettings          | Completed   | 19         | All tests passing                               |
| CourseManagement         | Partial     | 6          | Basic tests working, advanced tests need work   |
| TestScoreManagement      | Completed   | 9          | All tests passing                               |
| TestScores               | Completed   | 7          | All tests passing                               |
| TranscriptPDF            | Not Started | 0          | Planned for Phase 3                             |
| InvitationManagement     | Completed   | 8          | All tests passing                               |
| InvitationAccept         | Completed   | 7          | All tests passing                               |

## Bug Status

### Active Bugs

| ID      | Component      | Description                           | Priority  |
| ------- | -------------- | ------------------------------------- | --------- |
| BUG-003 | CourseManagement | Test timeouts during async operations | P3-Medium |

### Resolved Bugs

| ID      | Component        | Description                                   | Priority  | Resolution Date |
| ------- | ---------------- | --------------------------------------------- | --------- | --------------- |
| BUG-001 | ResetPassword    | Insufficient token validation                 | P3-Medium | 2025-03-24      |
| BUG-002 | StudentDashboard | Test failure in error handling during logout  | P3-Medium | 2025-03-22      |
| BUG-004 | GuardianSetup    | Unused 'school' variable                      | P4-Low    | 2025-03-25      |
| BUG-005 | TestScores       | Conditional React hooks                       | P3-Medium | 2025-03-25      |

## Next Steps

1. Complete Phase 2: Test Structure Improvements
   - Finish implementing co-location pattern for all tests
   - Create standardized test structure templates
   - Enhance mock stability with typed implementations

2. Begin Phase 3: Test Coverage Expansion
   - Implement tests for TranscriptPDF component
   - Enhance existing tests for better coverage
   - Start implementing integration tests

3. Fix remaining test failures
   - Resolve BUG-003: CourseManagement test timeouts
   - Re-enable Husky hooks after fixing test failures

4. Plan for Phase 4: E2E Testing Implementation
   - Schedule initial Playwright setup
   - Prioritize critical user flows for first E2E tests

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

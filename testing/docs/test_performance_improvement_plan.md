# Test Performance Improvement Plan

## Overview

This document outlines a comprehensive plan to improve the performance, organization, and reliability of tests in the HomeSchool project. The plan is structured using our established energy/focus units framework to allow for incremental implementation over time.

## Current Testing Status

- Using Jest and React Testing Library for component testing
- Tests are organized in `src/__tests__/` directory, mirroring the component structure
- Several test files have been fixed (CourseManagement, TestScores, TestScoreManagement)
- Planning to implement Playwright for E2E testing
- Some tests have experienced timeout issues and other reliability problems

## Key Improvement Areas

### 1. Test Organization and Structure

**Current Approach:**

- Tests are in `src/__tests__/` directory
- Component tests are in `src/__tests__/components/`
- Hook tests are in `src/__tests__/hooks/`
- Library tests are in `src/__tests__/lib/`

**Recommended Improvements:**

- Move tests closer to their implementation files for better discoverability
- Adopt a co-location pattern where tests live alongside the code they test
- Create a standardized test file naming convention

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

### 2. Test Performance Optimization

**Current Issues:**

- Test timeouts in CourseManagement tests (BUG-003)
- Conditional hooks in TestScores (BUG-005)
- Slow test execution due to complex component rendering

**Recommended Improvements:**

1. **Standardize Mock Implementation:**

   - Create a centralized mock factory for Supabase
   - Implement consistent mocking patterns across all tests
   - Use a dedicated test setup file for common mocks

2. **Optimize Test Execution:**

   - Replace `userEvent` with `fireEvent` for synchronous event handling where appropriate
   - Improve timer mocking with `jest.useFakeTimers({ advanceTimers: true })`
   - Implement proper cleanup in `afterEach` blocks

3. **Reduce Test Complexity:**
   - Break down large test files into smaller, focused test suites
   - Use more granular test cases instead of large, complex scenarios
   - Implement proper test isolation to prevent test interdependence

### 3. Test Reliability Enhancements

**Current Issues:**

- Inconsistent async handling across test files
- Varying approaches to mocking Supabase
- Inconsistent use of waitFor and async/await

**Recommended Improvements:**

1. **Standardize Async Testing:**

   - Create helper functions for common async testing patterns
   - Implement consistent timeout handling
   - Use a standardized approach for waiting for component updates

2. **Improve Mock Stability:**

   - Create typed mock implementations for better type safety
   - Implement more realistic mock data generation
   - Use consistent mock reset patterns

3. **Enhance Error Handling in Tests:**
   - Add better error reporting in test failures
   - Implement custom matchers for common assertions
   - Add debugging helpers for complex test scenarios

### 4. Test Coverage Expansion

**Current Status:**

- Most components have tests, but coverage varies
- TranscriptPDF component still needs tests
- E2E testing with Playwright is planned but not implemented

**Recommended Improvements:**

1. **Complete Component Test Coverage:**

   - Implement tests for TranscriptPDF component
   - Enhance existing tests for better coverage
   - Add edge case testing for critical components

2. **Implement Integration Tests:**

   - Add tests for component interactions
   - Test data flow between related components
   - Verify event handling across component boundaries

3. **Prioritize E2E Testing Implementation:**
   - Follow the comprehensive Playwright implementation plan
   - Focus on critical user flows first
   - Integrate with CI/CD pipeline

### 5. Jest Configuration Optimization

**Current Configuration:**

- Using ts-jest with a separate tsconfig.jest.json
- Test matching patterns for **tests** directory
- Verbose output enabled

**Recommended Improvements:**

1. **Performance Optimizations:**

   - Implement test sharding for parallel execution
   - Add maxWorkers configuration based on available CPU cores
   - Configure test caching for faster re-runs

2. **Reporting Enhancements:**

   - Add custom reporters for better test result visualization
   - Implement test summary generation
   - Add performance metrics tracking

3. **Configuration Updates:**
   - Update test matching patterns for co-located tests
   - Optimize transform configuration for faster execution
   - Add support for test tagging and filtering

## Implementation Plan

The improvements will be implemented in the following phases, using our energy/focus units framework:

### Phase 1: Quick Wins (30-60 minutes each)

1. **Standardize Mock Implementation:**

   - Create a `__mocks__/supabase.ts` file with standardized mock implementations
   - Update existing tests to use the standardized mocks
   - Create helper functions in `src/__tests__/helpers/supabaseTestHelpers.ts`
   - Configure Jest to automatically mock Supabase

2. **Fix Test Timeouts:**

   - Apply the successful fixes from BUG-003 to other test files
   - Replace `userEvent` with `fireEvent` for synchronous event handling
   - Implement proper timer mocking with `jest.useFakeTimers()`
   - Remove unnecessary explicit timeouts
   - Apply fixes to all component test files

3. **Optimize Jest Configuration:**
   - Update jest.config.cjs with performance optimizations
   - Add `maxWorkers: '50%'` to limit parallel execution to half of available CPU cores
   - Enable test caching with `cache: true` for faster subsequent test runs
   - Verify configuration with `--showConfig` flag

### Phase 2: Test Structure Improvements (Sprint)

1. **Implement Co-location Pattern:**

   - Move tests to be alongside their implementation files
   - Update import paths and test matching patterns
   - Ensure all tests still run correctly

2. **Standardize Test Structure:**

   - Create a template for component tests
   - Implement consistent test organization
   - Add standard sections for setup, tests, and cleanup

3. **Enhance Mock Stability:**
   - Create typed mock implementations
   - Implement realistic mock data generation
   - Add consistent mock reset patterns

### Phase 3: Test Coverage Expansion (Deep Work)

1. **Complete Component Test Coverage:**

   - Implement tests for TranscriptPDF component
   - Enhance existing tests for better coverage
   - Add edge case testing

2. **Implement Integration Tests:**
   - Add tests for component interactions
   - Test data flow between related components
   - Verify event handling across component boundaries

### Phase 4: E2E Testing Implementation (Project Phase)

1. **Follow Playwright Implementation Plan:**
   - Set up initial configuration
   - Implement authentication flow tests
   - Add guardian and student flow tests

## Expected Benefits

By implementing these improvements, we expect to achieve:

1. **Faster Test Execution:** Reduced test run times through optimized configuration and better mocking
2. **Improved Reliability:** More consistent test results with standardized async handling
3. **Better Organization:** Enhanced discoverability with co-located tests
4. **Comprehensive Coverage:** Complete test coverage across all components
5. **Robust E2E Testing:** End-to-end validation of critical user flows

## Progress Tracking

| Phase | Task                                  | Status      | Completed Date | Notes                                                  |
| ----- | ------------------------------------- | ----------- | -------------- | ------------------------------------------------------ |
| 1     | Standardize Mock Implementation       | Completed   | 2025-03-26     | See activeContext.md                                   |
| 1     | Fix Test Timeouts                     | Completed   | 2025-03-26     | Replaced userEvent with fireEvent, standardized timers |
| 1     | Optimize Jest Configuration           | Completed   | 2025-03-26     | Added cache:true and maxWorkers:'50%' to Jest config   |
| 2     | Implement Co-location Pattern         | Not Started |                |                                                        |
| 2     | Standardize Test Structure            | Not Started |                |                                                        |
| 2     | Enhance Mock Stability                | Not Started |                |                                                        |
| 3     | Complete Component Test Coverage      | Not Started |                |                                                        |
| 3     | Implement Integration Tests           | Not Started |                |                                                        |
| 4     | Follow Playwright Implementation Plan | Not Started |                |                                                        |

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Implementation Plan](./playwright_implementation_plan.md)
- [BUG-003: CourseManagement Test Timeouts](../bugs/resolved/P3-medium/BUG-003-coursemanagement-test-timeouts.md)
- [BUG-005: TestScores Conditional Hooks](../bugs/resolved/P3-medium/BUG-005-testscores-conditional-hooks.md)

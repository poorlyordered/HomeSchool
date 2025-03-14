# BUG-005: TestScores - React Hooks called conditionally

## Status: Resolved

## Priority: P3 (Medium)

## Discovered: 2025-03-13

## Component: TestScores

## Description

The TestScores component has React hooks (useCallback) that are being called conditionally inside the JSX return, which violates the Rules of Hooks. React Hooks must be called in the exact same order in every component render.

## Steps to Reproduce

1. Run ESLint on the codebase with `npm run lint`
2. Observe the warnings for src/components/TestScores.tsx:
   - `70:20 error React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render react-hooks/rules-of-hooks`
   - `71:25 error React Hook "useCallback" is called conditionally. React Hooks must be called in the exact same order in every component render react-hooks/rules-of-hooks`

## Expected Result

React Hooks should be called at the top level of the component, not conditionally inside the JSX return statement.

## Actual Result

The useCallback hooks are being called conditionally inside the JSX return, within the TestScoreManagement component rendering:

```jsx
{
  showTestScoreManagement && (
    <TestScoreManagement
      studentId={studentId}
      onClose={useCallback(() => setShowTestScoreManagement(false), [])}
      onScoreAdded={useCallback(() => {
        setShowTestScoreManagement(false);
        // Let parent know to refresh scores
        window.dispatchEvent(new CustomEvent("refreshTestScores"));
      }, [])}
    />
  );
}
```

## Notes

- This is a violation of React's Rules of Hooks, which can lead to unpredictable behavior
- The issue could cause bugs that are difficult to track down
- The fix requires moving the useCallback hooks to the top level of the component and storing their results in variables

## Resolution

Fixed on 2025-03-14 by moving the useCallback hooks to the top level of the component.

The issue was resolved by:

1. Moving the useCallback hooks out of the conditional JSX rendering block
2. Defining them at the top level of the component with appropriate names (handleClose and handleScoreAdded)
3. Using these predefined callback functions in the conditional rendering block
4. Removing the unused React import (React is declared but its value is never read)

This change ensures that the hooks are called in the same order on every render, which is what React requires according to the Rules of Hooks. Additionally, removing the unused React import aligns with React 17+ JSX transform that no longer requires React import for JSX.

```jsx
// Before:
{
  showTestScoreManagement && (
    <TestScoreManagement
      studentId={studentId}
      onClose={useCallback(() => setShowTestScoreManagement(false), [])}
      onScoreAdded={useCallback(() => {
        setShowTestScoreManagement(false);
        // Let parent know to refresh scores
        window.dispatchEvent(new CustomEvent("refreshTestScores"));
      }, [])}
    />
  );
}

// After:
// At the top level of the component:
const handleClose = useCallback(() => setShowTestScoreManagement(false), []);
const handleScoreAdded = useCallback(() => {
  setShowTestScoreManagement(false);
  // Let parent know to refresh scores
  window.dispatchEvent(new CustomEvent("refreshTestScores"));
}, []);

// In the JSX:
{
  showTestScoreManagement && (
    <TestScoreManagement
      studentId={studentId}
      onClose={handleClose}
      onScoreAdded={handleScoreAdded}
    />
  );
}
```

Verified the fix by running ESLint on the file, which no longer reports any Rules of Hooks violations.

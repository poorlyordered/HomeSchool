# BUG-005: TestScores - React Hooks called conditionally

## Status: Active

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

(To be filled when fixed)

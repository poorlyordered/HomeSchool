# BUG-002: StudentDashboard - Test Failure in Error Handling During Logout

## Status: Resolved

## Priority: P3 (Medium)

## Discovered: 2025-03-06

## Component: StudentDashboard

## Description

The test "handles error during logout" in StudentDashboard.test.tsx is failing. The test is unable to find the "Log Out" button element after waiting for the loading state to complete.

## Steps to Reproduce

1. Run the test suite with `npm run test`
2. Observe the failure in the StudentDashboard test for the "handles error during logout" test case

## Expected Result

The test should be able to find the "Log Out" button after the loading state is complete, click it, and verify that the error handling works correctly.

## Actual Result

The test fails with the following error:

```
TestingLibraryElementError: Unable to find an element with the text: /Log Out/i. This could be because the text is broken up by multiple elements. In this case you can provide a function for your text matcher to make your matcher more flexible.
```

## Notes

- The issue appears to be in the way the test is waiting for the loading state to complete. It's using `screen.queryByRole("status")` which might not be the correct selector for the loading spinner.
- The loading spinner is actually using a class `.animate-spin` and not a role attribute.
- The recent changes to the StudentDashboard component to implement course grouping by category might have affected the rendering or timing of the component.

## Resolution

Fixed on March 10, 2025. The issue was in the way the test was waiting for the loading state to complete. The test was using `screen.queryByRole("status")` to check for the loading spinner, but the actual implementation uses a div with the class `.animate-spin`.

The fix was to update the test to use the correct selector:

```javascript
// Wait for loading to complete - using the correct selector for the loading spinner
await waitFor(() => {
  const spinnerElement = document.querySelector(".animate-spin");
  expect(spinnerElement).toBeNull();
});
```

Additionally, fixed TypeScript errors in the window.location mock by using Object.defineProperty instead of direct assignment.

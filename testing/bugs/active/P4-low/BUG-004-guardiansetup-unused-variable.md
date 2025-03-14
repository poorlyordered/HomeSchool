# BUG-004: GuardianSetup - Unused 'school' variable

## Status: Active

## Priority: P4 (Low)

## Discovered: 2025-03-13

## Component: GuardianSetup

## Description

The GuardianSetup component has an unused variable 'school' that is assigned a value but never used, causing a TypeScript/ESLint warning.

## Steps to Reproduce

1. Run ESLint on the codebase with `npm run lint`
2. Observe the warning for src/components/GuardianSetup.tsx:
   `30:21 error 'school' is assigned a value but never used @typescript-eslint/no-unused-vars`

## Expected Result

The 'school' variable should either be used in the component or removed from the destructuring assignment.

## Actual Result

The 'school' variable is destructured from the Supabase response but is never used in the component:

```typescript
const { data: school, error: schoolError } = await supabase
  .from("schools")
  .insert([
    {
      guardian_id: user.id,
      name: formData.schoolName,
      address: formData.schoolAddress,
      phone: formData.schoolPhone,
    },
  ])
  .select()
  .single();
```

## Notes

- This is a minor code quality issue that doesn't affect functionality
- The variable might have been intended for future use or was left over from previous development
- The fix is simple: either use the variable or remove it from the destructuring assignment

## Resolution

(To be filled when fixed)

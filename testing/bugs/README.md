# Bug Tracking System

This directory contains the bug tracking system for the HomeSchool project. The system uses a simple markdown-based approach to track and manage bugs.

## Directory Structure

```
bugs/
├── active/
│   ├── P1-critical/  - Critical bugs that block core functionality
│   ├── P2-high/      - High priority bugs with significant impact
│   ├── P3-medium/    - Medium priority bugs with moderate impact
│   └── P4-low/       - Low priority bugs with minimal impact
└── resolved/         - Bugs that have been fixed, organized by month
```

## Bug File Naming Convention

Bug files should follow this naming convention:

`BUG-[number]-[component]-[short-description].md`

Examples:

- `BUG-001-auth-form-validation-error.md`
- `BUG-002-guardian-dashboard-student-loading.md`

## Bug Priority Levels

1. **P1 (Critical)**

   - Blocks core functionality
   - Affects all users
   - Data loss or security issues
   - No workaround available

2. **P2 (High)**

   - Impacts major functionality
   - Affects many users
   - Difficult workaround available
   - Significant user experience degradation

3. **P3 (Medium)**

   - Limited functionality impact
   - Affects some users
   - Reasonable workaround exists
   - Moderate user experience impact

4. **P4 (Low)**
   - Minor issues
   - Affects few users
   - Easy workaround available
   - Minimal user experience impact

## Bug Management Process

1. When a bug is discovered, create a new bug file in the appropriate priority folder
2. Use the next sequential bug number
3. Fill in all required information
4. When a bug is fixed, update the bug file with resolution details
5. Move the bug file to the `resolved/YYYY-MM/` folder (create the month folder if it doesn't exist)

## Bug File Template

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

## Bug Review Process

1. Review active bugs weekly
2. Prioritize based on impact and effort
3. Select bugs that match available energy level
4. Fix, verify, and move to resolved folder
5. Update test matrix and progress tracker

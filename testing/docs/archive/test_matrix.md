# HomeSchool Application Test Matrix

## Authentication Tests

| Feature                | Test Case                                       | Expected Result                                     | Actual Result | Status | Notes |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------- | ------------- | ------ | ----- |
| **Registration**       | Register with valid email and password          | Account created, verification email sent            |               |        |       |
|                        | Register with invalid email format              | Error message displayed                             |               |        |       |
|                        | Register with password too short                | Error message displayed                             |               |        |       |
|                        | Register with existing email                    | Error message about account already exists          |               |        |       |
| **Login**              | Login with valid credentials                    | Successfully logged in, redirected to dashboard     |               |        |       |
|                        | Login with invalid email                        | Error message displayed                             |               |        |       |
|                        | Login with invalid password                     | Error message displayed                             |               |        |       |
|                        | Login with unverified email                     | Message to verify email displayed                   |               |        |       |
| **Email Verification** | Click valid verification link                   | Email verified, success message displayed           |               |        |       |
|                        | Click expired verification link                 | Error message, option to resend                     |               |        |       |
|                        | Click already used verification link            | Message that email is already verified              |               |        |       |
|                        | Request new verification email                  | New email sent, confirmation message                |               |        |       |
| **Password Recovery**  | Request password reset with valid email         | Reset email sent, confirmation message              |               |        |       |
|                        | Request password reset with invalid email       | Error message displayed                             |               |        |       |
|                        | Reset password with valid token                 | Password updated, success message                   |               |        |       |
|                        | Reset password with expired token               | Error message, option to request new reset          |               |        |       |
|                        | Reset password with invalid token               | Error message displayed                             |               |        |       |
| **Session Management** | Session timeout after inactivity                | Redirect to login page with session expired message |               |        |       |
|                        | Remember me functionality                       | Stay logged in after browser restart                |               |        |       |
|                        | Logout functionality                            | Successfully logged out, redirected to login page   |               |        |       |
| **Account Settings**   | Change password with correct current password   | Password updated, success message                   |               |        |       |
|                        | Change password with incorrect current password | Error message displayed                             |               |        |       |
|                        | Update email with password confirmation         | Email update initiated, verification email sent     |               |        |       |
|                        | Delete account with confirmation                | Account deleted, redirected to registration         |               |        |       |

## Guardian Features Tests

| Feature                   | Test Case                                     | Expected Result                         | Actual Result | Status | Notes |
| ------------------------- | --------------------------------------------- | --------------------------------------- | ------------- | ------ | ----- |
| **Student Management**    | Add new student with valid information        | Student created, appears in list        |               |        |       |
|                           | Edit existing student information             | Student information updated             |               |        |       |
|                           | Delete student                                | Student removed from list               |               |        |       |
|                           | View student details                          | Student details displayed correctly     |               |        |       |
| **Course Management**     | Add new course with valid information         | Course created, appears in list         |               |        |       |
|                           | Edit existing course information              | Course information updated              |               |        |       |
|                           | Delete course                                 | Course removed from list                |               |        |       |
|                           | Add course with invalid grade format          | Error message displayed                 |               |        |       |
|                           | Add course with missing required fields       | Error message displayed                 |               |        |       |
| **Test Score Management** | Add new test score with valid information     | Test score added, appears in list       |               |        |       |
|                           | Edit existing test score                      | Test score updated                      |               |        |       |
|                           | Delete test score                             | Test score removed from list            |               |        |       |
|                           | Add test score with invalid score format      | Error message displayed                 |               |        |       |
|                           | Add test score with out-of-range value        | Error message displayed                 |               |        |       |
| **Transcript Generation** | Generate transcript with courses              | PDF generated with correct information  |               |        |       |
|                           | Generate transcript with no courses           | Appropriate message or empty transcript |               |        |       |
|                           | Download generated transcript                 | PDF downloaded successfully             |               |        |       |
|                           | Generate transcript with test scores included | Test scores appear in transcript        |               |        |       |
|                           | Generate transcript with test scores excluded | Test scores do not appear in transcript |               |        |       |

## Student Features Tests

| Feature                | Test Case                              | Expected Result                          | Actual Result | Status | Notes |
| ---------------------- | -------------------------------------- | ---------------------------------------- | ------------- | ------ | ----- |
| **Academic Records**   | View course list                       | Courses displayed correctly              |               |        |       |
|                        | View course details                    | Course details displayed correctly       |               |        |       |
|                        | Filter courses by year/term            | Filtered courses displayed correctly     |               |        |       |
|                        | Sort courses by different criteria     | Courses sorted correctly                 |               |        |       |
| **Test Scores**        | View test score list                   | Test scores displayed correctly          |               |        |       |
|                        | View test score details                | Test score details displayed correctly   |               |        |       |
|                        | Filter test scores by type             | Filtered test scores displayed correctly |               |        |       |
|                        | Sort test scores by different criteria | Test scores sorted correctly             |               |        |       |
| **Transcript Access**  | View transcript                        | Transcript displayed correctly           |               |        |       |
|                        | Download transcript                    | PDF downloaded successfully              |               |        |       |
| **Profile Management** | View profile information               | Profile information displayed correctly  |               |        |       |
|                        | Update allowed profile fields          | Profile information updated              |               |        |       |

## Cross-Functional Tests

| Feature               | Test Case                              | Expected Result                              | Actual Result | Status | Notes |
| --------------------- | -------------------------------------- | -------------------------------------------- | ------------- | ------ | ----- |
| **Responsive Design** | View on desktop (1920x1080)            | UI displays correctly                        |               |        |       |
|                       | View on tablet (768x1024)              | UI adapts correctly                          |               |        |       |
|                       | View on mobile (375x667)               | UI adapts correctly                          |               |        |       |
| **Navigation**        | Navigate between all main sections     | Navigation works correctly                   |               |        |       |
|                       | Use browser back/forward buttons       | Application state maintained correctly       |               |        |       |
|                       | Deep linking to specific pages         | Correct page loaded, authentication enforced |               |        |       |
| **Performance**       | Load time for dashboard                | Loads within acceptable time                 |               |        |       |
|                       | Load time for transcript generation    | Generates within acceptable time             |               |        |       |
| **Accessibility**     | Keyboard navigation                    | All features accessible via keyboard         |               |        |       |
|                       | Screen reader compatibility            | Content readable by screen readers           |               |        |       |
|                       | Color contrast compliance              | Meets WCAG AA standards                      |               |        |       |
| **Error Handling**    | Network disconnection during operation | Appropriate error message, data not lost     |               |        |       |
|                       | Server error responses                 | User-friendly error message displayed        |               |        |       |
|                       | Form validation errors                 | Clear error messages near relevant fields    |               |        |       |

## Test Status Legend

- ✅ PASS: Test passed successfully
- ❌ FAIL: Test failed
- ⚠️ PARTIAL: Test passed with minor issues
- 🔄 RETEST: Needs retesting after fixes
- ⏳ PENDING: Not yet tested

## Instructions for Testers

1. Execute each test case and record the actual result
2. Update the status column with the appropriate symbol
3. Add detailed notes for any failures or partial passes
4. For failed tests, create a detailed bug report in the issues tracker
5. Retest failed items after fixes are implemented

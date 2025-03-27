# Playwright Implementation Plan for HomeSchool E2E Testing

## Overview

This document outlines the comprehensive plan for implementing Playwright for end-to-end testing in the HomeSchool project. The plan follows our established energy/focus units framework and integrates with our existing testing infrastructure.

## 1. Initial Setup and Configuration

**Effort: Quick Win (30-60 minutes)**

### Installation and Basic Configuration

```bash
npm install -D @playwright/test
npx playwright install
```

### Project Structure

```
testing/
├── e2e/                      # New directory for E2E tests
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

### Configuration File (playwright.config.ts)

```typescript
import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "../specs",
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "Chrome",
      use: { browserName: "chromium" },
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "WebKit",
      use: { browserName: "webkit" },
    },
  ],
};

export default config;
```

### Package.json Script Updates

```json
"scripts": {
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "e2e:debug": "playwright test --debug",
  "e2e:report": "playwright show-report"
}
```

## 2. Authentication Flow Tests

**Effort: Sprint (4-6 hours)**

### Page Object Model for Authentication

```typescript
// auth.page.ts
import { Page, Locator } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly nameInput: Locator;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly guardianRadio: Locator;
  readonly studentRadio: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.nameInput = page.getByLabel(/name/i);
    this.signInButton = page.getByRole("button", { name: /sign in/i });
    this.signUpButton = page.getByRole("button", { name: /sign up/i });
    this.guardianRadio = page.getByLabel(/guardian/i);
    this.studentRadio = page.getByLabel(/student/i);
    this.errorMessage = page.getByText(/error/i);
  }

  async goto() {
    await this.page.goto("/");
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async signUp(
    email: string,
    password: string,
    name: string,
    role: "guardian" | "student",
  ) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.nameInput.fill(name);

    if (role === "guardian") {
      await this.guardianRadio.check();
    } else {
      await this.studentRadio.check();
    }

    await this.signUpButton.click();
  }
}
```

### Authentication Test Specs

```typescript
// auth.spec.ts
import { test, expect } from "@playwright/test";
import { AuthPage } from "../../pages/auth.page";

test.describe("Authentication", () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.goto();
  });

  test("should sign in with valid credentials", async ({ page }) => {
    await authPage.signIn("test@example.com", "password123");
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should show error with invalid credentials", async () => {
    await authPage.signIn("wrong@example.com", "wrongpassword");
    await expect(authPage.errorMessage).toBeVisible();
  });

  test("should navigate to sign up form", async ({ page }) => {
    await page.getByText(/don't have an account/i).click();
    await expect(authPage.signUpButton).toBeVisible();
  });

  test("should navigate to forgot password", async ({ page }) => {
    await page.getByText(/forgot your password/i).click();
    await expect(page).toHaveURL(/forgot-password/);
  });
});
```

## 3. Guardian User Flow Tests

**Effort: Sprint (4-6 hours)**

### Page Object Models for Guardian Flows

```typescript
// guardian.page.ts
import { Page, Locator } from "@playwright/test";

export class GuardianPage {
  readonly page: Page;
  readonly header: Locator;
  readonly addStudentButton: Locator;
  readonly addCourseButton: Locator;
  readonly generateTranscriptButton: Locator;
  readonly studentList: Locator;
  readonly courseList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: /guardian dashboard/i });
    this.addStudentButton = page.getByRole("button", { name: /add student/i });
    this.addCourseButton = page.getByRole("button", { name: /add course/i });
    this.generateTranscriptButton = page.getByRole("button", {
      name: /generate transcript/i,
    });
    this.studentList = page.locator('[data-testid="student-list"]');
    this.courseList = page.locator('[data-testid="course-list"]');
  }

  async goto() {
    await this.page.goto("/guardian/dashboard");
  }

  async addStudent(name: string, grade: string) {
    await this.addStudentButton.click();
    await this.page.getByLabel(/student name/i).fill(name);
    await this.page.getByLabel(/grade/i).fill(grade);
    await this.page.getByRole("button", { name: /save/i }).click();
  }

  async addCourse(studentName: string, courseName: string, grade: string) {
    // Select student first
    await this.studentList.getByText(studentName).click();
    await this.addCourseButton.click();
    await this.page.getByLabel(/course name/i).fill(courseName);
    await this.page.getByLabel(/grade/i).fill(grade);
    await this.page.getByRole("button", { name: /save/i }).click();
  }

  async generateTranscript(studentName: string) {
    await this.studentList.getByText(studentName).click();
    await this.generateTranscriptButton.click();
    // Wait for PDF preview
    await this.page.waitForSelector('[data-testid="pdf-preview"]');
  }
}
```

### Guardian Flow Test Specs

```typescript
// guardian.spec.ts
import { test, expect } from "@playwright/test";
import { AuthPage } from "../../pages/auth.page";
import { GuardianPage } from "../../pages/guardian.page";

test.describe("Guardian Flows", () => {
  let authPage: AuthPage;
  let guardianPage: GuardianPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    guardianPage = new GuardianPage(page);

    // Sign in as guardian
    await authPage.goto();
    await authPage.signIn("guardian@example.com", "password123");
    // Verify redirect to guardian dashboard
    await expect(page).toHaveURL(/guardian\/dashboard/);
  });

  test("should add a new student", async () => {
    const studentName = `Test Student ${Date.now()}`;
    await guardianPage.addStudent(studentName, "10");
    await expect(guardianPage.studentList.getByText(studentName)).toBeVisible();
  });

  test("should add a course to a student", async ({ page }) => {
    const studentName = `Test Student ${Date.now()}`;
    const courseName = "Algebra I";

    // First add a student
    await guardianPage.addStudent(studentName, "10");

    // Then add a course to that student
    await guardianPage.addCourse(studentName, courseName, "A");

    // Verify course was added
    await expect(guardianPage.courseList.getByText(courseName)).toBeVisible();
  });

  test("should generate a transcript", async ({ page }) => {
    const studentName = `Test Student ${Date.now()}`;

    // Add student and course
    await guardianPage.addStudent(studentName, "10");
    await guardianPage.addCourse(studentName, "Biology", "A");

    // Generate transcript
    await guardianPage.generateTranscript(studentName);

    // Verify PDF preview is shown
    await expect(page.locator('[data-testid="pdf-preview"]')).toBeVisible();
  });
});
```

## 4. Student User Flow Tests

**Effort: Sprint (4-6 hours)**

### Page Object Model for Student Flows

```typescript
// student.page.ts
import { Page, Locator } from "@playwright/test";

export class StudentPage {
  readonly page: Page;
  readonly header: Locator;
  readonly courseList: Locator;
  readonly testScoresList: Locator;
  readonly viewTranscriptButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: /student dashboard/i });
    this.courseList = page.locator('[data-testid="course-list"]');
    this.testScoresList = page.locator('[data-testid="test-scores-list"]');
    this.viewTranscriptButton = page.getByRole("button", {
      name: /view transcript/i,
    });
  }

  async goto() {
    await this.page.goto("/student/dashboard");
  }

  async viewTranscript() {
    await this.viewTranscriptButton.click();
    // Wait for PDF preview
    await this.page.waitForSelector('[data-testid="pdf-preview"]');
  }
}
```

### Student Flow Test Specs

```typescript
// student.spec.ts
import { test, expect } from "@playwright/test";
import { AuthPage } from "../../pages/auth.page";
import { StudentPage } from "../../pages/student.page";

test.describe("Student Flows", () => {
  let authPage: AuthPage;
  let studentPage: StudentPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    studentPage = new StudentPage(page);

    // Sign in as student
    await authPage.goto();
    await authPage.signIn("student@example.com", "password123");
    // Verify redirect to student dashboard
    await expect(page).toHaveURL(/student\/dashboard/);
  });

  test("should display courses", async () => {
    await expect(studentPage.courseList).toBeVisible();
    // Verify at least one course is displayed
    await expect(studentPage.courseList.locator("li")).toHaveCount({ min: 1 });
  });

  test("should display test scores", async () => {
    await expect(studentPage.testScoresList).toBeVisible();
  });

  test("should view transcript", async ({ page }) => {
    await studentPage.viewTranscript();
    // Verify PDF preview is shown
    await expect(page.locator('[data-testid="pdf-preview"]')).toBeVisible();
  });
});
```

## 5. Test Fixtures and Authentication Helpers

**Effort: Sprint (4-6 hours)**

### Authentication Fixture

```typescript
// auth.fixture.ts
import { test as base } from "@playwright/test";
import { AuthPage } from "../pages/auth.page";
import { GuardianPage } from "../pages/guardian.page";
import { StudentPage } from "../pages/student.page";

type UserRoles = "guardian" | "student";

// Extend the test fixture with authenticated users
export const test = base.extend<{
  authPage: AuthPage;
  guardianPage: GuardianPage;
  studentPage: StudentPage;
  authenticatedAsGuardian: void;
  authenticatedAsStudent: void;
}>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  guardianPage: async ({ page }, use) => {
    const guardianPage = new GuardianPage(page);
    await use(guardianPage);
  },

  studentPage: async ({ page }, use) => {
    const studentPage = new StudentPage(page);
    await use(studentPage);
  },

  // Guardian authentication
  authenticatedAsGuardian: async ({ page, authPage }, use) => {
    await authPage.goto();
    await authPage.signIn("guardian@example.com", "password123");
    await page.waitForURL(/guardian\/dashboard/);
    await use();
  },

  // Student authentication
  authenticatedAsStudent: async ({ page, authPage }, use) => {
    await authPage.goto();
    await authPage.signIn("student@example.com", "password123");
    await page.waitForURL(/student\/dashboard/);
    await use();
  },
});

export { expect } from "@playwright/test";
```

### Using Fixtures in Tests

```typescript
// Using fixtures in tests
import { test, expect } from "../../fixtures/auth.fixture";

test.describe("Guardian Dashboard with Authentication", () => {
  // This test will automatically be authenticated as a guardian
  test("should show student list", async ({
    page,
    guardianPage,
    authenticatedAsGuardian,
  }) => {
    // Already authenticated as guardian
    await expect(guardianPage.studentList).toBeVisible();
  });
});
```

## 6. CI/CD Integration

**Effort: Deep Work (Full day)**

### GitHub Actions Workflow

```yaml
# .github/workflows/playwright.yml
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

### Husky Pre-Push Hook Update

```bash
#!/bin/sh
# .husky/pre-push

npm run lint && npm run type-check && npm run test && npm run e2e
```

## 7. Visual Regression Testing

**Effort: Sprint (4-6 hours)**

### Visual Testing Configuration

```typescript
// Add to playwright.config.ts
import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // ... existing config

  // Add visual comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  // Add a specific project for visual testing
  projects: [
    // ... existing projects

    {
      name: "visual-tests",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /visual\.spec\.ts/,
    },
  ],
};

export default config;
```

### Visual Test Examples

```typescript
// visual.spec.ts
import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/auth.page";

test.describe("Visual Regression Tests", () => {
  test("auth form appearance", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();
    await expect(page).toHaveScreenshot("auth-form.png");
  });

  test("guardian dashboard appearance", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.signIn("guardian@example.com", "password123");
    await page.waitForURL(/guardian\/dashboard/);
    await expect(page).toHaveScreenshot("guardian-dashboard.png");
  });

  test("student dashboard appearance", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.signIn("student@example.com", "password123");
    await page.waitForURL(/student\/dashboard/);
    await expect(page).toHaveScreenshot("student-dashboard.png");
  });
});
```

## 8. API Testing with Playwright

**Effort: Sprint (4-6 hours)**

### API Test Examples

```typescript
// api.spec.ts
import { test, expect } from "@playwright/test";

test.describe("API Tests", () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Get auth token via API
    const response = await request.post("/api/auth/signin", {
      data: {
        email: "test@example.com",
        password: "password123",
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    authToken = body.token;
  });

  test("should get student list", async ({ request }) => {
    const response = await request.get("/api/students", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const students = await response.json();
    expect(Array.isArray(students)).toBeTruthy();
  });

  test("should create a student", async ({ request }) => {
    const studentName = `API Test Student ${Date.now()}`;

    const response = await request.post("/api/students", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        name: studentName,
        grade: "10",
      },
    });

    expect(response.ok()).toBeTruthy();
    const student = await response.json();
    expect(student.name).toBe(studentName);
  });
});
```

## 9. Implementation Timeline

Following our energy/focus units framework:

1. **Initial Setup (Quick Win)** - Day 1

   - Install Playwright
   - Create basic configuration
   - Set up directory structure

2. **Authentication Flow Tests (Sprint)** - Day 2

   - Create page objects for auth flows
   - Implement sign in/sign up tests
   - Test error handling

3. **Guardian Flow Tests (Sprint)** - Day 3

   - Create page objects for guardian flows
   - Implement student management tests
   - Implement course management tests
   - Test transcript generation

4. **Student Flow Tests (Sprint)** - Day 4

   - Create page objects for student flows
   - Implement course viewing tests
   - Implement test score viewing tests
   - Test transcript viewing

5. **Test Fixtures and Helpers (Sprint)** - Day 5

   - Create authentication fixtures
   - Implement test data helpers
   - Create reusable test utilities

6. **CI/CD Integration (Deep Work)** - Day 6

   - Set up GitHub Actions workflow
   - Configure Husky pre-push hook
   - Test CI/CD pipeline

7. **Visual Regression Testing (Sprint)** - Day 7

   - Configure visual comparison
   - Create baseline screenshots
   - Implement visual tests

8. **API Testing (Sprint)** - Day 8

   - Implement API authentication tests
   - Create data management API tests
   - Test error handling

9. **Documentation and Refinement (Sprint)** - Day 9
   - Document Playwright setup
   - Create usage guidelines
   - Refine tests based on feedback

## 10. Documentation

**Effort: Sprint (4-6 hours)**

### E2E Testing Guide (testing/docs/e2e_testing_guide.md)

````markdown
# E2E Testing Guide with Playwright

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
````

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

- Run all tests:

  ```bash
  npm run e2e
  ```

- Run tests with UI mode:

  ```bash
  npm run e2e:ui
  ```

- Run tests in debug mode:

  ```bash
  npm run e2e:debug
  ```

- View test report:
  ```bash
  npm run e2e:report
  ```

## Test Structure

- **Page Objects**: Reusable abstractions of UI pages
- **Fixtures**: Reusable test setup and authentication
- **Specs**: Actual test cases organized by feature

## Writing Tests

1. Create or use an existing page object
2. Use the authentication fixtures if needed
3. Write test cases using the page object methods
4. Run tests to verify functionality

## Best Practices

- Keep tests independent and isolated
- Use page objects for UI interaction
- Use fixtures for common setup
- Focus on user journeys, not implementation details
- Test error states and edge cases

```

## Integration with Existing Testing Infrastructure

This Playwright implementation plan is designed to complement our existing Jest and React Testing Library setup. While component tests focus on isolated functionality, Playwright E2E tests will verify complete user journeys and cross-component interactions.

The implementation will follow our established energy/focus units approach, with each phase building on the previous one. This incremental approach allows us to deliver value at each step while maintaining a clear path toward comprehensive E2E test coverage.

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Pattern](https://playwright.dev/docs/test-pom)
- [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Visual Testing with Playwright](https://playwright.dev/docs/test-snapshots)
- [API Testing with Playwright](https://playwright.dev/docs/api-testing)
```

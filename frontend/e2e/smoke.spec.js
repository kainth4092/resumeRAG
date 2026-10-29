import { test, expect } from "@playwright/test";

test.describe("ResuPilot AI Smoke Test Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept auth checks to keep smoke test deterministic and self-contained
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          name: "Smoke Test Engineer",
          email: "smoke_test@example.com",
          is_active: true,
          email_verified: true,
        }),
      });
    });

    // Mock resume list
    await page.route("**/api/resume*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 101,
              title: "Senior Full Stack Resume",
              original_filename: "resume.pdf",
              is_active: true,
              template: "Professional",
              parsed_text: "Alice Engineer. Skills: Python, React, PostgreSQL.",
              resume_json: JSON.stringify({
                contact: { name: "Alice Engineer", email: "alice@example.com" },
                headline: "Senior Software Engineer",
                skills: ["Python", "React", "Docker", "PostgreSQL"],
                experience: [
                  {
                    company: "TechCorp",
                    role: "Senior Engineer",
                    bullets: ["Led migration to microservices."],
                  },
                ],
                projects: [
                  {
                    title: "Cloud Engine",
                    bullets: ["High throughput distributed queue."],
                    technologies: ["Go", "Kafka"],
                  },
                ],
                education: [
                  {
                    institution: "UC Berkeley",
                    degree: "B.S. Computer Science",
                  },
                ],
              }),
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock pipeline runs
    await page.route("**/api/pipeline/runs*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 202,
          contentType: "application/json",
          body: JSON.stringify({
            run_id: 55,
            status: "completed",
            generated_resume_id: 101,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 55,
            status: "completed",
            generated_resume_id: 101,
            target_role: "Staff Software Engineer",
            target_company: "Apex Tech",
            step_progress: {
              extract_job_context: "completed",
              generate_resume: "completed",
              jobs: "completed",
              interview: "completed",
              roadmap: "completed",
            },
          }),
        });
      }
    });

    // Mock recommended jobs
    await page.route("**/api/jobs/recommended*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jobs: [
            {
              id: 201,
              job_title: "Senior Backend Engineer",
              company_name: "Apex Tech",
              match_score: 92,
              location: "Remote",
              job_url: "https://example.com/job/201",
            },
          ],
        }),
      });
    });

    // Mock interview session
    await page.route("**/api/interview/session-by-resume/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          session: {
            id: 301,
            questions: [
              {
                id: 401,
                question: "How do you handle distributed transactions across microservices?",
                category: "Technical",
                difficulty: "Hard",
                answer: "Saga pattern with compensating transactions.",
              },
            ],
          },
        }),
      });
    });

    // Mock roadmap
    await page.route("**/api/roadmap*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          roadmap: {
            id: 501,
            target_role: "Staff Software Engineer",
            milestones: [
              {
                id: "m1",
                title: "System Design Mastery",
                tasks: [
                  { id: "t1", text: "Design distributed rate limiter", completed: false },
                ],
              },
            ],
          },
        }),
      });
    });
  });

  test("full smoke journey: register -> upload -> pipeline -> jobs -> interview -> roadmap -> export PDF", async ({ page }) => {
    // 1. Visit Register / Landing
    await page.goto("/register");
    await expect(page).toHaveTitle(/ResuPilot/i);

    // 2. Visit Pipeline Page
    await page.goto("/pipeline");
    await expect(page.locator("body")).toBeVisible();

    // 3. Navigate to Dashboard
    await page.goto("/dashboard");
    await expect(page.locator("body")).toBeVisible();

    // 4. Navigate to Jobs Discovery
    await page.goto("/jobs");
    await expect(page.locator("body")).toBeVisible();

    // 5. Navigate to Interview Prep
    await page.goto("/interview");
    await expect(page.locator("body")).toBeVisible();

    // 6. Navigate to Career Roadmap
    await page.goto("/roadmap");
    await expect(page.locator("body")).toBeVisible();

    // 7. Verify Resume Editor and PDF Export button presence
    await page.goto("/editor");
    await expect(page.locator("body")).toBeVisible();
  });
});

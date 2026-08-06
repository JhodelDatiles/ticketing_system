import { test, expect } from "@playwright/test";

const FAKE_USER = {
  id: 1,
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  role: "customer",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ user, token }) => {
      window.localStorage.setItem("user", JSON.stringify(user));
      window.localStorage.setItem("token", token);
    },
    { user: FAKE_USER, token: "fake-jwt" },
  );

  await page.route("**/categories*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [{ id: 1, name: "Hardware" }],
        pagination: { page: 1, limit: 200, total: 1, totalPages: 1 },
      }),
    }),
  );

  await page.route("**/priorities*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [{ id: 1, name: "High" }],
        pagination: { page: 1, limit: 200, total: 1, totalPages: 1 },
      }),
    }),
  );

  await page.route("**/statuses*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [{ id: 1, name: "Open" }],
        pagination: { page: 1, limit: 200, total: 1, totalPages: 1 },
      }),
    }),
  );
});

test("creates a ticket and redirects to detail view", async ({ page }) => {
  await page.route("**/tickets", async (route) => {
    if (route.request().method() !== "POST") {
      return route.fallback();
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 42,
        ticket_number: "TKT-20260806-1234",
        title: "Printer not working",
        description: "The office printer jams on every print job.",
        category_id: 1,
        priority_id: 1,
        status_id: 1,
        created_by: 1,
        assigned_to: null,
      }),
    });
  });

  await page.route("**/tickets/42", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 42,
        ticket_number: "TKT-20260806-1234",
        title: "Printer not working",
        description: "The office printer jams on every print job.",
        category_id: 1,
        priority_id: 1,
        status_id: 1,
        created_by: 1,
        assigned_to: null,
        created_at: new Date().toISOString(),
        closed_at: null,
      }),
    }),
  );

  await page.route("**/tickets/42/comments", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  await page.route("**/tickets/42/attachments", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  await page.goto("/tickets/new");

  await page.getByRole("heading", { name: "New ticket" }).waitFor();

  await page.locator("input").first().fill("Printer not working");
  await page
    .locator("textarea")
    .fill("The office printer jams on every print job.");
  await page.locator("select").nth(0).selectOption({ label: "Hardware" });
  await page.locator("select").nth(1).selectOption({ label: "High" });

  await page.getByRole("button", { name: "Create ticket" }).click();

  await expect(page).toHaveURL("/tickets/42");
  await expect(page.getByText("Printer not working")).toBeVisible();
});
import { test, expect } from "@playwright/test";

test("logs in and redirects to tickets", async ({ page }) => {
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        role: "customer",
        token: "fake-jwt",
      }),
    });
  });

  await page.route("**/tickets*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    });
  });

  await page.route("**/statuses*", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ data: [], pagination: {} }) }),
  );
  await page.route("**/priorities*", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ data: [], pagination: {} }) }),
  );
  await page.route("**/categories*", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ data: [], pagination: {} }) }),
  );

  await page.goto("/login");
  await page.getByLabel("Email").fill("Jhodeldatiles09@gmail.com");
  await page.getByLabel("Password").fill("7B4adja3");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
});
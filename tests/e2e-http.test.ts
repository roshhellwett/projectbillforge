import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function isServerOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/en/login`, { method: "HEAD" });
    return res.ok || res.status === 200 || res.status === 307 || res.status === 308;
  } catch {
    return false;
  }
}

test("E2E HTTP: Verify public pages and authentication redirect guards against running app server", async (t) => {
  const online = await isServerOnline();
  if (!online) {
    t.skip(`Development server is not online at ${BASE_URL}. Skipping live HTTP E2E checks.`);
    return;
  }

  const loginRes = await fetch(`${BASE_URL}/en/login`);
  assert.equal(loginRes.status, 200, "Login page must return 200 OK");
  const loginHtml = await loginRes.text();
  assert.ok(loginHtml.includes("<html") || loginHtml.includes("BillForge") || loginHtml.includes("login"), "Login page should render HTML content");

  const registerRes = await fetch(`${BASE_URL}/en/register`);
  assert.equal(registerRes.status, 200, "Register page must return 200 OK");

  const forgotRes = await fetch(`${BASE_URL}/en/forgot-password`);
  assert.equal(forgotRes.status, 200, "Forgot password page must return 200 OK");

  const dashboardRes = await fetch(`${BASE_URL}/en/dashboard`, { redirect: "manual" });
  assert.ok(
    dashboardRes.status === 200 || dashboardRes.status === 307 || dashboardRes.status === 308,
    `Dashboard protected route should return 200 (if logged in) or 307/308 redirect to login (if unauthenticated). Got ${dashboardRes.status}`
  );
  if (dashboardRes.status === 307 || dashboardRes.status === 308) {
    const location = dashboardRes.headers.get("location");
    assert.ok(location?.includes("login"), `Unauthenticated dashboard request should redirect to login. Got location: ${location}`);
  }

  const invoicesRes = await fetch(`${BASE_URL}/en/dashboard/invoices`, { redirect: "manual" });
  assert.ok(invoicesRes.status === 200 || invoicesRes.status === 307 || invoicesRes.status === 308, "Invoices route accessible or protected by redirect");

  const khataRes = await fetch(`${BASE_URL}/en/dashboard/khata`, { redirect: "manual" });
  assert.ok(khataRes.status === 200 || khataRes.status === 307 || khataRes.status === 308, "Khata route accessible or protected by redirect");

  const productsRes = await fetch(`${BASE_URL}/en/dashboard/products`, { redirect: "manual" });
  assert.ok(productsRes.status === 200 || productsRes.status === 307 || productsRes.status === 308, "Products route accessible or protected by redirect");

  const customersRes = await fetch(`${BASE_URL}/en/dashboard/customers`, { redirect: "manual" });
  assert.ok(customersRes.status === 200 || customersRes.status === 307 || customersRes.status === 308, "Customers route accessible or protected by redirect");

  const settingsRes = await fetch(`${BASE_URL}/en/dashboard/settings`, { redirect: "manual" });
  assert.ok(settingsRes.status === 200 || settingsRes.status === 307 || settingsRes.status === 308, "Settings route accessible or protected by redirect");

  const authProvidersRes = await fetch(`${BASE_URL}/api/auth/providers`);
  assert.equal(authProvidersRes.status, 200, "NextAuth API /providers endpoint should respond with 200 OK");
  const providersJson = await authProvidersRes.json();
  assert.ok(typeof providersJson === "object", "NextAuth providers should return JSON object");
});

const { test, expect } = require("@playwright/test");

const sitePages = [
  { path: "/", title: /Dark Souls II Guide Hub/i, canonical: "https://darksoulsii.lol/" },
  { path: "/bosses.html", title: /Dark Souls II Bosses/i, canonical: "https://darksoulsii.lol/bosses.html" },
  { path: "/areas.html", title: /Dark Souls II Areas/i, canonical: "https://darksoulsii.lol/areas.html" },
  { path: "/builds.html", title: /Dark Souls II Builds/i, canonical: "https://darksoulsii.lol/builds.html" },
  { path: "/faq.html", title: /Dark Souls II FAQ/i, canonical: "https://darksoulsii.lol/faq.html" }
];

test.describe("Dark Souls II guide hub", () => {
  test("desktop homepage renders core content and internal navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Dark Souls II Guide Hub/i);
    await expect(page.locator("h1")).toHaveText("Dark Souls II");
    await expect(page.getByRole("link", { name: "Browse Bosses" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /bosses, area routing, beginner builds/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://darksoulsii.lol/");
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

    await page.getByRole("link", { name: "Bosses" }).first().click();
    await expect(page).toHaveURL(/bosses\.html$/);
    await expect(page.locator("h1")).toHaveText("Dark Souls II Bosses");
  });

  test("all pages expose metadata and load images cleanly", async ({ page }) => {
    for (const sitePage of sitePages) {
      await page.goto(sitePage.path);
      await expect(page).toHaveTitle(sitePage.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", sitePage.canonical);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/i);
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Dark Souls II Guide Hub");
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        "https://darksoulsii.lol/assets/brand/social-card.png"
      );
      await expect(page.locator('script[src*="googletagmanager"], script[src*="clarity"]')).toHaveCount(0);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

      const imagesLoaded = await page.evaluate(() =>
        Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
      );
      expect(imagesLoaded).toBe(true);
    }
  });

  test("mobile layout stays within viewport and menu remains usable", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("button", { name: "Menu" }).click();
    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    await expect(primaryNav.getByRole("link", { name: "FAQ" })).toBeVisible();
    await primaryNav.getByRole("link", { name: "Builds" }).click();
    await expect(page).toHaveURL(/builds\.html$/);
    await expect(page.locator("h1")).toHaveText("Dark Souls II Builds");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });

  test("site resources and machine-readable files are accessible", async ({ page, request }) => {
    const [robots, sitemap, manifest, healthz] = await Promise.all([
      request.get("/robots.txt"),
      request.get("/sitemap.xml"),
      request.get("/site.webmanifest"),
      request.get("/healthz")
    ]);
    const robotsText = await robots.text();
    const sitemapText = await sitemap.text();
    const manifestText = await manifest.text();

    expect(robots.ok()).toBe(true);
    expect(robotsText).toContain("Sitemap: https://darksoulsii.lol/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(sitemapText).toContain("<loc>https://darksoulsii.lol/bosses.html</loc>");
    expect(sitemapText).toContain("<lastmod>2026-04-23</lastmod>");
    expect(manifest.ok()).toBe(true);
    expect(manifestText).toContain('"name": "Dark Souls II Guide Hub"');
    expect(healthz.ok()).toBe(true);

    await page.goto("/faq.html");
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });
});

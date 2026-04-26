import { test, expect } from "@playwright/test";
import { SitePage } from "./pages/SitePage";

/**
 * Tests E2E — Pages publiques site-v2
 * Couvre : nav, footer, contenu clé, responsive, liens CTA
 */

test.describe("Navigation", () => {
  test("logo visible et redirige vers /", async ({ page }) => {
    const site = new SitePage(page);
    await site.goto("/espaces");
    await site.logo.click();
    await expect(page).toHaveURL("/");
  });

  test("liens desktop visibles @desktop", async ({ page }) => {
    await page.goto("/");
    const links = ["Espaces", "Concept", "Tarifs", "Menu", "Événements"];
    for (const label of links) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("menu mobile s'ouvre @mobile", async ({ page }) => {
    await page.goto("/");
    const site = new SitePage(page);
    await site.openMobileMenu();
    await expect(page.getByRole("navigation", { name: "Menu mobile" })).toBeVisible();
  });
});

test.describe("Landing page /", () => {
  test("charge sans erreur et affiche le hero", async ({ page }) => {
    const site = new SitePage(page);
    await site.goto("/");
    await site.expectPageLoaded();
    await site.expectH1(/Travailler/i);
  });

  test("affiche les 4 espaces", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Open-space")).toBeVisible();
    await expect(page.getByText("Salle Verrière")).toBeVisible();
    await expect(page.getByText("Salle Étage")).toBeVisible();
    await expect(page.getByText("Événementiel")).toBeVisible();
  });

  test("CTA Réserver visible et pointe vers /booking", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Réserver en ligne/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/booking");
  });
});

test.describe("Page /espaces", () => {
  test("affiche les 4 cards espace", async ({ page }) => {
    await page.goto("/espaces");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ambiance");
    const articles = page.locator("article");
    await expect(articles).toHaveCount(4);
  });

  test("chaque espace a un bouton Réserver", async ({ page }) => {
    await page.goto("/espaces");
    const btns = page.getByRole("link", { name: /Réserver/i });
    await expect(btns).toHaveCount(await btns.count());
    expect(await btns.count()).toBeGreaterThanOrEqual(4);
  });
});

test.describe("Page /tarifs", () => {
  test("affiche 3 plans tarifaires", async ({ page }) => {
    await page.goto("/tarifs");
    await expect(page.getByText("À l'heure")).toBeVisible();
    await expect(page.getByText("Journée")).toBeVisible();
    await expect(page.getByText("Mois")).toBeVisible();
  });

  test("toggle annuel modifie le prix mensuel", async ({ page }) => {
    await page.goto("/tarifs");
    await page.getByRole("button", { name: /annuel/i }).click();
    // 179 × 0.85 = ~152
    await expect(page.getByText("152€")).toBeVisible();
  });

  test("affiche la FAQ", async ({ page }) => {
    await page.goto("/tarifs");
    await expect(page.getByText("abonnement obligatoire")).toBeVisible();
  });
});

test.describe("Page /menu", () => {
  test("affiche les 4 catégories", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByText("Cafés spécialité")).toBeVisible();
    await expect(page.getByText("Thés & infusions")).toBeVisible();
    await expect(page.getByText("Boissons froides")).toBeVisible();
    await expect(page.getByText("Snacks & sucré")).toBeVisible();
  });
});

test.describe("Page /evenements", () => {
  test("affiche les événements à venir", async ({ page }) => {
    await page.goto("/evenements");
    await expect(page.getByText("Apéro du café")).toBeVisible();
    await expect(page.getByText("Coffee cupping")).toBeVisible();
  });

  test("section privatisation visible", async ({ page }) => {
    await page.goto("/evenements");
    await expect(page.getByText("Privatisation")).toBeVisible();
    await expect(page.getByRole("link", { name: /devis/i })).toBeVisible();
  });
});

test.describe("Footer", () => {
  test("présent sur toutes les pages publiques", async ({ page }) => {
    const paths = ["/", "/espaces", "/tarifs", "/concept", "/menu", "/evenements"];
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("footer")).toBeVisible();
    }
  });
});

test.describe("SEO", () => {
  test("chaque page a un title unique", async ({ page }) => {
    const expectations = [
      { path: "/", contains: "CoworKing Café Strasbourg" },
      { path: "/espaces", contains: "Nos espaces" },
      { path: "/tarifs", contains: "Tarifs" },
      { path: "/concept", contains: "concept" },
      { path: "/menu", contains: "Menu" },
      { path: "/evenements", contains: "Événements" },
    ];
    for (const { path, contains } of expectations) {
      await page.goto(path);
      const title = await page.title();
      expect(title.toLowerCase()).toContain(contains.toLowerCase());
    }
  });

  test("sitemap.xml accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("robots.txt accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
  });
});

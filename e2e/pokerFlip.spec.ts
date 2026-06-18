import {test, expect, type Page, type Locator} from "@playwright/test";

/*
 *  RevealPokerCard — expected behaviours (E2E)
 *  ───────────────────────────────────────────
 *  1. Five cards render face-down with a "squeeze to peek" hint; no overlays.
 *  2. Pressing near a corner selects the nearest anchor → finger + anchor label.
 *  3. Dragging toward the opposite side shows the progress bar.
 *  4. Release below the 50% threshold → springs back, stays face-down.
 *  5. Release past the threshold → fully reveals the face ("tap to reset").
 *  6. The revealed face is scaleX(-1) scaleY(-1) — i.e. a 180° rotation (readable).
 *  7. Tapping a revealed card resets it to face-down.
 *  8. Dragging beyond the anchor hides the finger.
 */

const W = 200, H = 275; // card-local size (CARD_W × CARD_H)

const firstCard = (page: Page): Locator => page.getByTestId("poker-card").first();

async function cardBox(card: Locator) {
    const b = await card.boundingBox();
    if (!b) throw new Error("card has no bounding box");
    return b;
}

/** Press at a card-local point and hold (caller releases). */
async function pressAt(page: Page, card: Locator, x: number, y: number) {
    const b = await cardBox(card);
    await page.mouse.move(b.x + x, b.y + y);
    await page.mouse.down();
    await page.waitForTimeout(60); // let the drag-listener effect attach
}

/** Move the (held) pointer to a card-local point. */
async function moveTo(page: Page, card: Locator, x: number, y: number, steps = 12) {
    const b = await cardBox(card);
    await page.mouse.move(b.x + x, b.y + y, {steps});
}

/** Full press → drag → release between two card-local points. */
async function dragRelease(page: Page, card: Locator, from: [number, number], to: [number, number]) {
    await pressAt(page, card, from[0], from[1]);
    await moveTo(page, card, to[0], to[1], 16);
    await page.mouse.up();
}

test.beforeEach(async ({page}) => {
    await page.goto("/tasks/PokerFlip");
    await expect(firstCard(page)).toBeVisible();
    await page.waitForTimeout(1200); // let the staggered entrance animation settle
});

test.describe("RevealPokerCard — squeeze / peel", () => {

    test("1. renders five face-down cards with the hint and no overlays", async ({page}) => {
        await expect(page.getByTestId("poker-card")).toHaveCount(5);
        await expect(firstCard(page).getByText("squeeze to peek")).toBeVisible();
        await expect(page.getByTestId("poker-card-finger")).toHaveCount(0);
        await expect(page.getByTestId("poker-card-face")).toHaveCount(0);
    });

    test("2. pressing near a corner shows the finger + nearest-anchor label", async ({page}) => {
        const card = firstCard(page);
        await pressAt(page, card, 6, 6);          // top-left corner
        await moveTo(page, card, 40, 55, 8);      // small drag inward
        await expect(card.getByTestId("poker-card-finger")).toBeVisible();
        await expect(card.getByText("top-left")).toBeVisible();
        await page.mouse.up();
    });

    test("3. dragging toward the opposite side shows the progress bar", async ({page}) => {
        const card = firstCard(page);
        await pressAt(page, card, 6, 6);
        await moveTo(page, card, 60, 80, 8);
        await expect(card.getByTestId("poker-card-progress")).toBeVisible();
        await page.mouse.up();
    });

    test("4. releasing below the threshold springs back (stays face-down)", async ({page}) => {
        const card = firstCard(page);
        await dragRelease(page, card, [6, 6], [40, 55]); // ≈ 0.36 progress
        await page.waitForTimeout(600);                  // spring-back animation
        await expect(card.getByTestId("poker-card-face")).toHaveCount(0);
        await expect(card.getByText("squeeze to peek")).toBeVisible();
    });

    test("5. releasing past the threshold fully reveals the face", async ({page}) => {
        const card = firstCard(page);
        await dragRelease(page, card, [6, 6], [W * 0.85, H * 0.85]);
        await expect(card.getByTestId("poker-card-face")).toBeVisible();
        await expect(card.getByText("tap to reset")).toBeVisible();
    });

    test("6. the revealed face is scaleX(-1) scaleY(-1) — a 180° rotation", async ({page}) => {
        const card = firstCard(page);
        await dragRelease(page, card, [6, 6], [W * 0.85, H * 0.85]);
        const face = card.getByTestId("poker-card-face");
        await expect(face).toBeVisible();
        // scaleX(-1) scaleY(-1) composes to a 180° rotation → matrix(-1, 0, 0, -1, 0, 0)
        expect(await face.evaluate((el) => getComputedStyle(el).transform)).toBe("matrix(-1, 0, 0, -1, 0, 0)");
    });

    test("7. tapping a revealed card resets it to face-down", async ({page}) => {
        const card = firstCard(page);
        await dragRelease(page, card, [6, 6], [W * 0.85, H * 0.85]);
        await expect(card.getByTestId("poker-card-face")).toBeVisible();
        await page.waitForTimeout(450);
        await card.click(); // tap → reset
        await expect(card.getByTestId("poker-card-face")).toHaveCount(0);
        await expect(card.getByText("squeeze to peek")).toBeVisible();
    });

    test("8. the finger hides when dragged beyond the anchor", async ({page}) => {
        const card = firstCard(page);
        await pressAt(page, card, 8, 8);                  // grab top-left
        await moveTo(page, card, 50, 65, 6);              // inward → finger visible
        await expect(card.getByTestId("poker-card-finger")).toBeVisible();
        await moveTo(page, card, -40, -40, 6);            // beyond the anchor (proj < 0)
        await expect(card.getByTestId("poker-card-finger")).toHaveCount(0);
        await page.mouse.up();
    });
});

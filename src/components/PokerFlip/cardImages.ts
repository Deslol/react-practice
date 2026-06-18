// ─────────────────────────────────────────────────────────────────
//  Card image registry + codec
//  ───────────────────────────
//  The image SET is static — every card PNG is bundled at build time via
//  import.meta.glob (compiles to plain static imports). The DATA is dynamic:
//  a card code (e.g. from a websocket) is decoded at runtime and mapped to one
//  of the bundled images. This module is the single source of truth for both,
//  so renderers just call cardImageFor()/cardImageForCode().
// ─────────────────────────────────────────────────────────────────

// const-object + union type (instead of `enum`, which TS's erasableSyntaxOnly
// forbids). Values match the filename suit letters; usage is identical to an enum.
export const CardType = {
    CLUB: "C",
    DIAMOND: "D",
    HEART: "H",
    SPADE: "S",
    UNKNOWN: "UNKNOWN",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

export type IPokerInfo = {
    suit: CardType;
    value: number; // contract: 1 = Ace … 11 = J, 12 = Q, 13 = K
};

// ── card code ⇄ poker info ──────────────────────────────────────
// A card code packs the suit in bits 0x30 and the face value (1–13) in 0x0f.
export function convertToCardCode(suit: CardType, value: number): number {
    let output = value & 0x0f;
    switch (suit) {
        case CardType.CLUB:    output |= 0x00; break;
        case CardType.DIAMOND: output |= 0x10; break;
        case CardType.SPADE:   output |= 0x20; break;
        case CardType.HEART:   output |= 0x30; break;
        default: break;
    }
    return output;
}

export function convertCardCodeToPoker(cardCode: number): IPokerInfo {
    const value = cardCode & 0x0f;
    let suit: CardType = CardType.UNKNOWN;
    switch (cardCode & 0x30) {
        case 0x00: suit = CardType.CLUB; break;
        case 0x10: suit = CardType.DIAMOND; break;
        case 0x20: suit = CardType.SPADE; break;
        case 0x30: suit = CardType.HEART; break;
    }
    return {suit, value};
}

// Only 1–13 are in-contract; 0/14/15 (from a corrupt code) have no asset.
// NOTE: face-down is NOT encoded here — it is a separate UI flag (e.g. the
// card's `revealed` state), exactly like the table renderers do it.
export const isValidCard = ({suit, value}: IPokerInfo): boolean =>
    suit !== CardType.UNKNOWN && value >= 1 && value <= 13;

// ── image registry ──────────────────────────────────────────────
// Eagerly bundle every card PNG, keyed by basename ("AS", "10H", "back").
const CARD_IMAGES: Record<string, string> = Object.fromEntries(
    Object.entries(
        import.meta.glob("../../assets/reveal-poker-cards/*.png", {eager: true, import: "default"}),
    ).map(([path, url]) => [path.split("/").pop()!.replace(".png", ""), url as string]),
);

export const backImage = CARD_IMAGES["back"];

// face value (1–13) → the rank token used in the filenames
const RANK_BY_VALUE: Record<number, string> = {
    1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
    8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};

// {suit, value} → asset basename, e.g. {HEART, 10} → "10H".  null if out of
// contract (the CardType enum value already IS the filename suit letter).
function assetKey(info: IPokerInfo): string | null {
    if (!isValidCard(info)) return null;
    return `${RANK_BY_VALUE[info.value]}${info.suit}`;
}

/** Front image for a decoded card. Falls back to the back for any
 *  out-of-contract / unknown / missing card — never returns undefined. */
export function cardImageFor(info: IPokerInfo): string {
    const key = assetKey(info);
    return (key && CARD_IMAGES[key]) || backImage;
}

/** Convenience: decode a raw card code straight to its front image. */
export function cardImageForCode(cardCode: number): string {
    return cardImageFor(convertCardCodeToPoker(cardCode));
}

// Dev-only sanity check: fail loudly at startup if any of the 52 fronts (or the
// back) is missing, instead of silently rendering a fallback later.
if (import.meta.env.DEV) {
    const missing: string[] = [];
    for (const suit of [CardType.CLUB, CardType.DIAMOND, CardType.HEART, CardType.SPADE]) {
        for (let v = 1; v <= 13; v++) {
            const key = `${RANK_BY_VALUE[v]}${suit}`;
            if (!CARD_IMAGES[key]) missing.push(key);
        }
    }
    if (!backImage) missing.push("back");
    if (missing.length) console.warn("[cardImages] missing card art:", missing);
}

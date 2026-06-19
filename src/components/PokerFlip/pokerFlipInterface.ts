// ─────────────────────────────────────────────────────────────────
//  Poker squeeze/peel — shared types
//  (Card-code / image types live in ./cardImages alongside the codec.)
// ─────────────────────────────────────────────────────────────────

import type {MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, ReactNode, RefObject} from "react";
import type {CardSize} from "./constants";

/** One of the 8 peel origins (4 corners + 4 edge midpoints), card-local coords. */
export interface Anchor {
    x: number;
    y: number;
    label: string;
}

/** The fold line: a point (px,py) it passes through and its unit normal (nx,ny). */
export interface Fold {
    px: number;
    py: number;
    nx: number;
    ny: number;
}

export interface Point {
    x: number;
    y: number;
}

/** Either a native DOM event (global listeners) or a React synthetic event (JSX handlers). */
export type PointerEventLike = MouseEvent | TouchEvent | ReactMouseEvent | ReactTouchEvent;

/**
 * Custom reset slot: render your own affordance for a revealed card and call the
 * provided `reset()` to flip it back face-down.
 */
export type ResetSlot = (reset: () => void) => ReactNode;

/**
 * Per-card appearance & behaviour — pass as the single `config` prop. Every field is
 * optional with a sensible default; define one object and reuse it across cards for a
 * consistent look. (Global feel — peel sensitivity, finger placement, timings — lives
 * in constants.ts, not here, since it's app-wide rather than per-card.)
 */
export interface PokerCardConfig {
    /**
     * Render size — a named preset (mobile / pc × small / default / large; px in
     * CARD_SIZES). The card scales from its base geometry, so the peel behaves identically
     * at every size. Use it to fit a card to a mobile vs desktop layout.
     * @default "pcDefault" (200 × 275)
     */
    size?: CardSize;
    /**
     * Rotate the whole card, in degrees (CSS rotate, about its centre). The peel gesture
     * is inverse-mapped, so dragging works at any angle. Use it to lay a card sideways or
     * diagonally (e.g. a fanned hand).
     * @default 0
     */
    rotation?: number;
    /**
     * Face-down instructional text:
     *  - `true`     → built-in "squeeze to peek" hint (plus the drag anchor label).
     *  - `false`    → no built-in text at all (hint, anchor label, and the tap-to-reset hint).
     *  - ReactNode  → your own content in the hint's place — a slot for a custom hint/badge.
     * Use it to brand/localise the prompt, or to strip all chrome for a clean card.
     * @default false
     */
    hint?: boolean | ReactNode;
    /**
     * Show the thin progress bar while peeling (blue → green once past the reveal
     * threshold). Use it to hide the peel-progress chrome.
     * @default false
     */
    showProgressBar?: boolean;
    /**
     * Post-reveal reset affordance:
     *  - `true`     → tapping the revealed card flips it back, with a "tap to reset" hint.
     *  - `false`    → disabled: the card stays revealed.
     *  - render fn  → custom slot: you render your own UI and call the provided `reset()`.
     * Note: the built-in (`true`) reset is also suppressed when `hint` is `false`, so a
     * fully chrome-free card has no tap-to-reset.
     * @default true
     */
    tapToReset?: boolean | ResetSlot;
}

/** Props for the reusable card: the card to render + wiring, with all tuning in `config`. */
export interface RevealPokerCardProps {
    /** Card code (suit nibble | value 1–13) — typically decoded from server data. */
    code: number;
    /** Position within a group; used only for the staggered entrance animation. */
    index?: number;
    /** Fired once the card finishes its full reveal. */
    onReveal?: (code: number) => void;
    /** Fired whenever a revealed card is reset back to face-down. */
    onReset?: () => void;
    /** Appearance & behaviour — size, rotation, hint, progress bar, tap-to-reset. */
    config?: PokerCardConfig;
}

/** Props for the photographic thumb drag-indicator. */
export interface FingerIndicatorProps {
    /** Current drag position, card-local coords. */
    cursor: Point;
    /** The held anchor the nail points toward. */
    anchor: Anchor;
}

/** Options for the usePeelGesture hook. */
export interface UsePeelGestureOptions {
    /** Called once the card crosses the reveal threshold on release. */
    onReveal?: () => void;
    /** Called whenever a revealed card is reset to face-down. */
    onReset?: () => void;
    /** Card rotation in degrees (CSS rotate, about centre); pointer is inverse-mapped. */
    rotation?: number;
    /** Uniform render scale (physical size ÷ base); pointer offset is divided by it. */
    scale?: number;
}

/** State + handlers returned by usePeelGesture — the gesture state machine. */
export interface PeelGesture {
    /** Attach to the draggable card element (its rect maps pointer → card-local coords). */
    cardRef: RefObject<HTMLDivElement | null>;
    /** True while a peel drag is in progress. */
    dragging: boolean;
    /** True once fully revealed (face-up). */
    revealed: boolean;
    /** The held anchor (peel origin), or null when idle. */
    anchor: Anchor | null;
    /** Reveal progress 0 → 1. */
    progress: number;
    /** Current drag position in card-local coords, or null when idle. */
    cursorPos: Point | null;
    /** Current fold geometry, or null when flat. */
    fold: Fold | null;
    /** Begin a peel — bind to onMouseDown / onTouchStart while face-down. */
    start: (e: PointerEventLike) => void;
    /** Flip a revealed card back to face-down. */
    reset: () => void;
}

// ─────────────────────────────────────────────────────────────────
//  Poker squeeze/peel — shared types
//  (Card-code / image types live in ./cardImages alongside the codec.)
// ─────────────────────────────────────────────────────────────────

import type {MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, ReactNode, RefObject} from "react";

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

/** Props for the reusable card. The parent supplies the card to render. */
export interface RevealPokerCardProps {
    /** Card code (suit nibble | value 1–13) — typically decoded from server data. */
    code: number;
    /** Position within a group; used only for the staggered entrance animation. */
    index?: number;
    /** Fired once the card finishes its full reveal. */
    onReveal?: (code: number) => void;
    /** Fired whenever a revealed card is reset back to face-down. */
    onReset?: () => void;
    /**
     * Controls the "tap to reset" affordance once a card is fully revealed:
     *  - omitted / `true` → default: tapping the card resets it, with a "tap to reset" hint.
     *  - `false`          → disabled: the revealed card stays put (no tap-to-reset, no hint).
     *  - render function  → custom slot: you render your own UI and call the provided
     *                       `reset()`; whole-card tap is left to your slot.
     */
    tapToReset?: boolean | ResetSlot;
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

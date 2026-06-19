import {useState, useRef, useCallback, useEffect} from "react";
import {
    CARD_W, CARD_H, THRESHOLD,
    MAX_PEEL_DIST, MAX_DRAG_DIST, SOFT_RESET_PROJ, SPRING_BACK_MS,
} from "./constants";
import {clamp, lerp, pos, nearestAnchor, toCardLocal} from "./pokerFlipHelper";
import type {Anchor, Fold, Point, PointerEventLike, PeelGesture, UsePeelGestureOptions} from "./pokerFlipInterface";

/**
 * The squeeze/peel gesture state machine — all interaction logic, no rendering.
 *
 * Drives a single card: touch-down picks the nearest of 8 anchors; dragging
 * toward the opposite side advances `progress` (projection onto the peel axis,
 * clamped to a max drag distance); release past THRESHOLD reveals, otherwise it
 * springs back. Attach the returned `cardRef` to the draggable element and bind
 * `start` to its pointer-down. Pure mechanics — the consumer renders the state.
 */
export function usePeelGesture({onReveal, onReset, rotation = 0, scale = 1}: UsePeelGestureOptions = {}): PeelGesture {
    const cardRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [progress, setProgress] = useState(0);                 // 0 → 1
    const [fold, setFold] = useState<Fold | null>(null);         // derived fold geometry

    const animRef = useRef<number | null>(null);
    const rectRef = useRef<DOMRect | null>(null); // card rect, captured once per gesture (avoids per-frame reflow)

    // ── start ─────────────────────────────────────────────────────
    const handleStart = useCallback((e: PointerEventLike) => {
        if (revealed || !cardRef.current) return;
        // Only mouse can preventDefault here — React's onTouchStart is passive, so
        // calling it on touch warns + no-ops. Touch scrolling is stopped declaratively
        // by touch-action:none on the card (plus the non-passive touchmove listener).
        if (!("touches" in e)) e.preventDefault();
        const rect = cardRef.current.getBoundingClientRect();
        rectRef.current = rect; // reuse for the whole drag — the card can't move mid-peel
        const p = pos(e);
        const local = toCardLocal(rect, p.x, p.y, rotation, scale); // → base card-local
        const a = nearestAnchor(local.x, local.y, CARD_W, CARD_H);
        setAnchor(a);
        setDragging(true);
        setProgress(0);
        setFold(null);
        if (animRef.current) cancelAnimationFrame(animRef.current);
    }, [revealed, rotation, scale]);

    // ── move ──────────────────────────────────────────────────────
    const handleMove = useCallback((e: PointerEventLike) => {
        if (!dragging || !anchor) return;
        e.preventDefault();
        const rect = rectRef.current;   // captured in handleStart — reusing it avoids a
        if (!rect) return;              // forced synchronous layout flush on every frame
        const p = pos(e);
        const local = toCardLocal(rect, p.x, p.y, rotation, scale); // → base card-local
        const rawX = local.x;
        const rawY = local.y;

        // Clamp the pointer to a max distance from the anchor: dragging far off the
        // card would otherwise fling the finger across the screen. Past the cap the
        // peel just stops advancing — direction preserved, gesture stays alive.
        let mx = rawX, my = rawY;
        const rdx = rawX - anchor.x, rdy = rawY - anchor.y;
        const rawDist = Math.hypot(rdx, rdy);
        if (rawDist > MAX_DRAG_DIST) {
            const k = MAX_DRAG_DIST / rawDist;
            mx = anchor.x + rdx * k;
            my = anchor.y + rdy * k;
        }

        // The peel is LOCKED to the peel axis: U = anchor → card centre, which for a
        // rectangle points straight at the opposite corner/edge. The pointer only
        // controls how far ALONG that axis the peel advances (its projection) — any
        // off-axis movement is ignored, so the fold direction never wobbles. Grab the
        // top-left and the peel always runs to the bottom-right; an edge peels straight
        // across. (Vice-versa for every anchor.)
        // Snap the peel axis to the 8 natural directions: a CORNER peels along the
        // 45° diagonal away from the held corner (a natural dog-ear), an EDGE peels
        // straight across. Math.sign() returns 0 on an edge anchor's centred axis, so
        // edges stay axis-aligned; corners get equal ±1 components → a true 45°.
        let ux = Math.sign(CARD_W / 2 - anchor.x), uy = Math.sign(CARD_H / 2 - anchor.y);
        const ulen = Math.hypot(ux, uy) || 1;
        ux /= ulen;
        uy /= ulen;
        const proj = (mx - anchor.x) * ux + (my - anchor.y) * uy;

        // Dragged back to / past the anchor → soft reset: flap retracts, progress 0,
        // but the gesture stays alive so dragging forward again resumes it.
        if (proj < SOFT_RESET_PROJ) {
            setFold(null);
            setProgress(0);
            return;
        }

        const t = clamp(proj / MAX_PEEL_DIST, 0, 1);

        // Fold line is perpendicular to the fixed peel axis, at the midpoint of the
        // peeled span — always a clean diagonal (corners) or straight across (edges),
        // so the folded flap stays congruent to the area it lifted from.
        setFold({px: anchor.x + ux * proj * 0.5, py: anchor.y + uy * proj * 0.5, nx: ux, ny: uy});
        setProgress(t);
    }, [dragging, anchor, rotation, scale]);

    // ── end ───────────────────────────────────────────────────────
    const handleEnd = useCallback(() => {
        if (!dragging) return;
        setDragging(false);

        if (progress >= THRESHOLD) {
            // auto-complete to fully revealed
            setRevealed(true);
            setFold(null);
            setProgress(1);
            onReveal?.();
            return;
        }

        // spring back (below threshold): retreat the fold line to the anchor
        const startP = progress;
        const startFold = fold ? {...fold} : null;
        const t0 = performance.now();
        const ease = (x: number) => 1 - Math.pow(1 - x, 3);

        const tick = (now: number) => {
            const elapsed = clamp((now - t0) / SPRING_BACK_MS, 0, 1);
            const e = ease(elapsed);
            setProgress(lerp(startP, 0, e));

            if (startFold && anchor) {
                // Retract the fold toward the anchor; cursorPos (derived from fold)
                // follows automatically, keeping the finger attached during spring-back.
                setFold({
                    ...startFold,
                    px: lerp(startFold.px, anchor.x, e),
                    py: lerp(startFold.py, anchor.y, e),
                });
            }

            if (elapsed < 1) {
                animRef.current = requestAnimationFrame(tick);
            } else {
                setFold(null);
                setProgress(0);
            }
        };
        animRef.current = requestAnimationFrame(tick);
    }, [dragging, progress, fold, anchor, onReveal]);

    // flip a revealed card back to face-down
    const reset = useCallback(() => {
        setRevealed(false);
        setFold(null);
        setProgress(0);
        setAnchor(null);
        onReset?.();
    }, [onReset]);

    // global listeners while dragging (so the drag continues outside the card)
    useEffect(() => {
        if (!dragging) return;
        const mv = (e: MouseEvent | TouchEvent) => handleMove(e);
        const up = () => handleEnd();
        window.addEventListener("mousemove", mv);
        window.addEventListener("mouseup", up);
        window.addEventListener("touchmove", mv, {passive: false});
        window.addEventListener("touchend", up);
        return () => {
            window.removeEventListener("mousemove", mv);
            window.removeEventListener("mouseup", up);
            window.removeEventListener("touchmove", mv);
            window.removeEventListener("touchend", up);
        };
    }, [dragging, handleMove, handleEnd]);

    // Cancel any in-flight spring-back frame if the card unmounts mid-animation.
    useEffect(() => () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
    }, []);

    // cursorPos is fully derived from the fold: the drag point is the fold point
    // reflected across the anchor (cursor = 2·foldPoint − anchor). Non-null iff a fold
    // exists, which also matches the finger's render gate.
    const cursorPos: Point | null = fold && anchor
        ? {x: 2 * fold.px - anchor.x, y: 2 * fold.py - anchor.y}
        : null;

    return {cardRef, dragging, revealed, anchor, progress, cursorPos, fold, start: handleStart, reset};
}

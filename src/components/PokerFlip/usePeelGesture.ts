import {useState, useRef, useCallback, useEffect} from "react";
import {
    CARD_W, CARD_H, THRESHOLD,
    MAX_PEEL_DIST, MAX_DRAG_DIST, SOFT_RESET_PROJ, SPRING_BACK_MS,
} from "./constants";
import {clamp, lerp, pos, nearestAnchor, peelAxisProjection} from "./pokerFlipHelper";
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
export function usePeelGesture({onReveal, onReset}: UsePeelGestureOptions = {}): PeelGesture {
    const cardRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [progress, setProgress] = useState(0);                 // 0 → 1
    const [cursorPos, setCursorPos] = useState<Point | null>(null); // card-local
    const [fold, setFold] = useState<Fold | null>(null);         // derived fold geometry

    const animRef = useRef<number | null>(null);

    // ── start ─────────────────────────────────────────────────────
    const handleStart = useCallback((e: PointerEventLike) => {
        if (revealed || !cardRef.current) return;
        e.preventDefault();
        const rect = cardRef.current.getBoundingClientRect();
        const p = pos(e);
        const a = nearestAnchor(p.x - rect.left, p.y - rect.top, CARD_W, CARD_H);
        setAnchor(a);
        setDragging(true);
        setProgress(0);
        setFold(null);
        setCursorPos({x: p.x - rect.left, y: p.y - rect.top});
        if (animRef.current) cancelAnimationFrame(animRef.current);
    }, [revealed]);

    // ── move ──────────────────────────────────────────────────────
    const handleMove = useCallback((e: PointerEventLike) => {
        if (!dragging || !anchor || !cardRef.current) return;
        e.preventDefault();
        const rect = cardRef.current.getBoundingClientRect();
        const p = pos(e);
        const rawX = p.x - rect.left;
        const rawY = p.y - rect.top;

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

        // Progress is the drag's projection onto the peel axis (anchor → centre =
        // toward the opposite corner/edge), so off-axis drift advances it less.
        const proj = peelAxisProjection(anchor, mx, my);

        // keep the finger tracking the (clamped) pointer, whatever direction it goes
        setCursorPos({x: mx, y: my});

        // Dragged back to / past the anchor → soft reset: flap retracts, progress 0,
        // but the gesture stays alive so dragging forward again resumes it.
        if (proj < SOFT_RESET_PROJ) {
            setFold(null);
            setProgress(0);
            return;
        }

        const t = clamp(proj / MAX_PEEL_DIST, 0, 1);

        // The fold line follows the actual pointer direction (free, natural angle);
        // only the progress metric is axis-gated.
        const dx = mx - anchor.x, dy = my - anchor.y;
        const dist = Math.hypot(dx, dy);
        const ndx = dx / dist, ndy = dy / dist;
        setFold({px: anchor.x + ndx * dist * 0.5, py: anchor.y + ndy * dist * 0.5, nx: ndx, ny: ndy});
        setProgress(t);
    }, [dragging, anchor]);

    // ── end ───────────────────────────────────────────────────────
    const handleEnd = useCallback(() => {
        if (!dragging) return;
        setDragging(false);

        if (progress >= THRESHOLD) {
            // auto-complete to fully revealed
            setRevealed(true);
            setFold(null);
            setProgress(1);
            setCursorPos(null);
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
                setFold({...startFold, px: lerp(startFold.px, anchor.x, e), py: lerp(startFold.py, anchor.y, e)});
            }

            if (elapsed < 1) {
                animRef.current = requestAnimationFrame(tick);
            } else {
                setFold(null);
                setProgress(0);
                setCursorPos(null);
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
        setCursorPos(null);
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

    return {cardRef, dragging, revealed, anchor, progress, cursorPos, fold, start: handleStart, reset};
}

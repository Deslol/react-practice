import {useState, useRef, useCallback, useEffect} from "react";

/*
 *  Poker Card Squeeze / Peel
 *  ─────────────────────────
 *  Touch the card back → drag → the nearest of 8 anchor points (4 corners +
 *  4 edge midpoints) peels inward, revealing the card face underneath.
 *  Release past threshold → full reveal.  Below threshold → spring back.
 *
 *  Geometry:
 *    • A "fold line" is computed perpendicular to the drag vector, passing
 *      through the current pointer position.
 *    • A mirrored sliver of the front-face is shown in the peeled area,
 *      reflected across the fold line, giving the illusion of paper curl.
 *    • The finger 👆 follows the drag position and points toward the anchor.
 */

// ── card deck ───────────────────────────────────────────────────
const SUITS = {hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠"};
const COLORS = {hearts: "#C41E3A", diamonds: "#C41E3A", clubs: "#1B1B1B", spades: "#1B1B1B"};

type Suit = keyof typeof SUITS;

interface Card {
    rank: string;
    suit: Suit;
}

interface Anchor {
    x: number;
    y: number;
    label: string;
}

interface Fold {
    px: number;
    py: number;
    nx: number;
    ny: number;
}

interface Point {
    x: number;
    y: number;
}

type PointerEventLike = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;

/* Extract client coords from a mouse or touch event. */
const pos = (e: PointerEventLike): Point => {
    const t = "touches" in e ? e.touches[0] : e;
    return {x: t.clientX, y: t.clientY};
};

const DECK: Card[] = [
    {rank: "A", suit: "spades"},
    {rank: "K", suit: "hearts"},
    {rank: "Q", suit: "diamonds"},
    {rank: "J", suit: "clubs"},
    {rank: "10", suit: "hearts"},
];

// ── math helpers ────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Return a polygon (as CSS clip-path) that keeps everything on one side
   of a line defined by a point + normal.  side = 1 keeps the half the
   normal points into; side = -1 keeps the other half.
   We build a huge quad that covers the card for the "keep" side. */
function halfPlaneClip(px: number, py: number, nx: number, ny: number, side: number, W: number, H: number) {
    // tangent along the fold line
    const tx = -ny * side;
    const ty = nx * side;
    // push the "base" deep into the keep-side so the polygon covers the card
    const depth = W + H; // more than enough
    const bx = px + nx * side * depth;
    const by = py + ny * side * depth;
    // four corners of a huge quad
    const pts = [
        [px + tx * depth, py + ty * depth],
        [px - tx * depth, py - ty * depth],
        [bx - tx * depth, by - ty * depth],
        [bx + tx * depth, by + ty * depth],
    ];
    const poly = pts.map(([x, y]) => `${x}px ${y}px`).join(", ");
    return `polygon(${poly})`;
}

/* Determine the nearest anchor point to the initial touch, returning its
   position in card-local coords.

   There are 8 anchor points — the 4 corners and the 4 edge midpoints:

       TL ───── TOP ───── TR
       │                   │
      LEFT    (center)   RIGHT
       │                   │
       BL ─── BOTTOM ───── BR

   Selection is purely by Euclidean distance: whichever of the 8 points is
   closest to the touch wins, so the peel always originates from the single
   nearest anchor (and never a farther corner when an edge is closer). */
function nearestAnchor(localX: number, localY: number, W: number, H: number): Anchor {
    const anchors: Anchor[] = [
        {x: 0, y: 0, label: "top-left"},
        {x: W / 2, y: 0, label: "top"},
        {x: W, y: 0, label: "top-right"},
        {x: 0, y: H / 2, label: "left"},
        {x: W, y: H / 2, label: "right"},
        {x: 0, y: H, label: "bottom-left"},
        {x: W / 2, y: H, label: "bottom"},
        {x: W, y: H, label: "bottom-right"},
    ];

    // Strict `<` makes exact ties resolve to the earlier anchor in array order
    // (deterministic). On this portrait card, a touch at the dead centre is
    // equidistant to "left" and "right", so "left" wins — intentional.
    let best = anchors[0], bestD = Infinity;
    for (const a of anchors) {
        const d = Math.hypot(a.x - localX, a.y - localY);
        if (d < bestD) {
            bestD = d;
            best = a;
        }
    }
    return best;
}

// ── card-back pattern (SVG data-uri for performance) ────────────
const backPatternCSS = `
  repeating-linear-gradient(
    45deg,
    rgba(42,63,102,0.35) 0px,
    rgba(42,63,102,0.35) 1px,
    transparent 1px,
    transparent 8px
  ),
  repeating-linear-gradient(
    -45deg,
    rgba(42,63,102,0.25) 0px,
    rgba(42,63,102,0.25) 1px,
    transparent 1px,
    transparent 8px
  ),
  linear-gradient(135deg, #172a4a 0%, #0f1d35 100%)
`;

// ── constants ───────────────────────────────────────────────────
const CARD_W = 200;
const CARD_H = 290;
const THRESHOLD = 0.50; // drag-progress to auto-complete

// ═════════════════════════════════════════════════════════════════
//  Single card
// ═════════════════════════════════════════════════════════════════
function PokerCard({rank, suit, index}: Card & {index: number}) {
    const cardRef = useRef<HTMLDivElement>(null);

    // interaction state
    const [dragging, setDragging] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [anchor, setAnchor] = useState<Anchor | null>(null);   // { x, y, label }
    const [progress, setProgress] = useState(0);       // 0 → 1
    const [cursorPos, setCursorPos] = useState<Point | null>(null);    // { x, y } card-local

    // derived fold geometry (updated every frame while dragging)
    const [fold, setFold] = useState<Fold | null>(null);

    // animation spring-back / complete
    const animRef = useRef<number | null>(null);

    // ── start ─────────────────────────────────────────────────────
    const handleStart = useCallback((e: PointerEventLike) => {
        if (revealed || !cardRef.current) return;
        e.preventDefault();
        const rect = cardRef.current.getBoundingClientRect();
        const p = pos(e);
        const lx = p.x - rect.left;
        const ly = p.y - rect.top;
        const a = nearestAnchor(lx, ly, CARD_W, CARD_H);
        setAnchor(a);
        setDragging(true);
        setProgress(0);
        setFold(null);
        setCursorPos({x: lx, y: ly});
        if (animRef.current) cancelAnimationFrame(animRef.current);
    }, [revealed]);

    // ── move ──────────────────────────────────────────────────────
    const handleMove = useCallback((e: PointerEventLike) => {
        if (!dragging || !anchor || !cardRef.current) return;
        e.preventDefault();
        const rect = cardRef.current.getBoundingClientRect();
        const p = pos(e);
        const mx = p.x - rect.left;   // mouse in card-local
        const my = p.y - rect.top;

        // vector from anchor toward mouse (this is the peel direction)
        const dx = mx - anchor.x;
        const dy = my - anchor.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) return;

        // The fold line sits between the anchor and the current pointer.
        const maxDist = Math.hypot(CARD_W, CARD_H) * 0.55;
        const t = clamp(dist / maxDist, 0, 1);

        // unit drag direction
        const ndx = dx / dist, ndy = dy / dist;

        // fold-line point sits halfway between the anchor and the pointer
        const fpx = anchor.x + ndx * dist * 0.5;
        const fpy = anchor.y + ndy * dist * 0.5;

        // fold normal points from the kept back-side into the peeled region
        setFold({px: fpx, py: fpy, nx: ndx, ny: ndy});
        setProgress(t);
        setCursorPos({x: mx, y: my});
    }, [dragging, anchor]);

    // ── end ───────────────────────────────────────────────────────
    const handleEnd = useCallback(() => {
        if (!dragging) return;
        setDragging(false);

        if (progress >= THRESHOLD) {
            // animate to fully revealed
            setRevealed(true);
            setFold(null);
            setProgress(1);
            setCursorPos(null);
        } else {
            // spring back
            const startP = progress;
            const startFold = fold ? {...fold} : null;
            const t0 = performance.now();
            const dur = 350;
            const ease = (x: number) => 1 - Math.pow(1 - x, 3);

            const tick = (now: number) => {
                const elapsed = clamp((now - t0) / dur, 0, 1);
                const e = ease(elapsed);
                const p = lerp(startP, 0, e);
                setProgress(p);

                if (startFold && anchor) {
                    // pull fold line back toward anchor
                    const fpx = lerp(startFold.px, anchor.x, e);
                    const fpy = lerp(startFold.py, anchor.y, e);
                    setFold({...startFold, px: fpx, py: fpy});
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
        }
    }, [dragging, progress, fold, anchor]);

    // reset
    const handleReset = () => {
        setRevealed(false);
        setFold(null);
        setProgress(0);
        setAnchor(null);
        setCursorPos(null);
    };

    // global listeners while dragging
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

    // ── render helpers ────────────────────────────────────────────
    const suitChar = SUITS[suit];
    const color = COLORS[suit];

    // clip paths
    let peelClip = "none";
    let peelTransform = "none";

    if (fold && !revealed) {
        const {px, py, nx, ny} = fold;
        // peeled region: the half the drag points into; we mirror the face content
        peelClip = halfPlaneClip(px, py, nx, ny, 1, CARD_W, CARD_H);

        // The peeled flap shows the FACE, mirrored across the fold line.
        // Reflection across line through (px,py) with normal (nx,ny):
        //   M = I - 2 * n * nᵀ  (translation-adjusted)
        const a = 1 - 2 * nx * nx;
        const b = -2 * nx * ny;
        const c = -2 * nx * ny;
        const d = 1 - 2 * ny * ny;
        const eTx = 2 * px * nx * nx + 2 * py * nx * ny;
        const eTy = 2 * px * nx * ny + 2 * py * ny * ny;
        peelTransform = `matrix(${a}, ${c}, ${b}, ${d}, ${eTx}, ${eTy})`;
    }

    // ── face card JSX (reused in both full reveal and peel) ───────
    const faceContent = (
        <div style={{
            position: "absolute", inset: 0,
            borderRadius: 14,
            background: "#faf8f4",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color, fontFamily: "'Playfair Display', 'Georgia', serif",
        }}>
            {/* inner border */}
            <div style={{
                position: "absolute", inset: 7,
                borderRadius: 9,
                border: `1.5px solid ${color}22`,
            }}/>
            {/* top-left */}
            <div style={{
                position: "absolute", top: 12, left: 14,
                display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1,
            }}>
                <span style={{fontSize: 24, fontWeight: 700}}>{rank}</span>
                <span style={{fontSize: 18, marginTop: -1}}>{suitChar}</span>
            </div>
            {/* center */}
            <div style={{fontSize: 82, lineHeight: 1, opacity: 0.9}}>{suitChar}</div>
            {/* bottom-right */}
            <div style={{
                position: "absolute", bottom: 12, right: 14,
                display: "flex", flexDirection: "column", alignItems: "center",
                lineHeight: 1, transform: "rotate(180deg)",
            }}>
                <span style={{fontSize: 24, fontWeight: 700}}>{rank}</span>
                <span style={{fontSize: 18, marginTop: -1}}>{suitChar}</span>
            </div>
        </div>
    );

    // ── back card JSX ─────────────────────────────────────────────
    const backContent = (
        <div style={{
            position: "absolute", inset: 0,
            borderRadius: 14,
            background: backPatternCSS,
            border: "3px solid #263d66",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", inset: 9, borderRadius: 8,
                border: "1.5px solid rgba(255,255,255,0.07)",
            }}/>
            <div style={{
                fontSize: 46, color: "#3b5998",
                textShadow: "0 0 24px rgba(59,89,152,0.35)",
                fontFamily: "'Georgia', serif", position: "relative", zIndex: 1,
            }}>♠
            </div>
        </div>
    );

    return (
        <div
            style={{
                width: CARD_W, height: CARD_H,
                perspective: 1000,
                cursor: revealed ? "pointer" : "grab",
                animationDelay: `${index * 0.12}s`,
            }}
            className="card-enter"
        >
            <div
                ref={cardRef}
                onMouseDown={revealed ? handleReset : handleStart}
                onTouchStart={revealed ? handleReset : handleStart}
                style={{
                    position: "relative",
                    width: "100%", height: "100%",
                    borderRadius: 14,
                    userSelect: "none", WebkitUserSelect: "none",
                    boxShadow: `0 ${4 + progress * 14}px ${12 + progress * 30}px rgba(0,0,0,${0.18 + progress * 0.22})`,
                    transition: dragging ? "none" : "box-shadow 0.4s ease",
                }}
            >
                {/* Layer 1 — full card back (always visible as the base) */}
                {!revealed && (
                    <div style={{
                        position: "absolute", inset: 0,
                        borderRadius: 14, overflow: "hidden",
                        zIndex: 1,
                    }}>
                        {backContent}
                        {/* hint */}
                        {!dragging && progress === 0 && (
                            <div style={{
                                position: "absolute", bottom: 16, left: 0, right: 0,
                                textAlign: "center", fontSize: 9, color: "#4a6491",
                                letterSpacing: 2, textTransform: "uppercase",
                                fontFamily: "'SF Mono', 'Courier New', monospace", zIndex: 3,
                            }}>squeeze to peek</div>
                        )}
                    </div>
                )}

                {/* Layer 2 — peeled flap shows the CARD FACE (mirrored across fold line) */}
                {!revealed && fold && (
                    <div style={{
                        position: "absolute", inset: 0,
                        borderRadius: 14, overflow: "hidden",
                        clipPath: peelClip,
                        WebkitClipPath: peelClip,
                        zIndex: 4,
                    }}>
                        <div style={{
                            position: "absolute", inset: 0,
                            transform: peelTransform,
                            transformOrigin: "0 0",
                        }}>
                            {faceContent}
                        </div>
                    </div>
                )}

                {/* Layer 4 — direction indicator while dragging */}
                {!revealed && dragging && anchor && (
                    <div style={{
                        position: "absolute", top: 8, left: 0, right: 0,
                        textAlign: "center", fontSize: 9, color: "#7ba3d4",
                        letterSpacing: 1.5, textTransform: "uppercase",
                        fontFamily: "'SF Mono', 'Courier New', monospace",
                        zIndex: 20, pointerEvents: "none",
                        textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}>
                        {anchor.label}
                    </div>
                )}

                {/* Layer 6 — progress indicator */}
                {!revealed && progress > 0.01 && (
                    <div style={{
                        position: "absolute", bottom: 8, left: 20, right: 20,
                        height: 3, borderRadius: 2,
                        background: "rgba(0,0,0,0.2)",
                        zIndex: 20, overflow: "hidden", pointerEvents: "none",
                    }}>
                        <div style={{
                            width: `${progress * 100}%`, height: "100%",
                            borderRadius: 2,
                            background: progress >= THRESHOLD
                                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                                : "linear-gradient(90deg, #7ba3d4, #3b5998)",
                            transition: dragging ? "none" : "width 0.3s ease",
                        }}/>
                    </div>
                )}

                {/* Layer 7 — finger indicator at drag position */}
                {!revealed && dragging && cursorPos && anchor && (
                    (() => {
                        // 👆 points "up" by default. We rotate it so it points from
                        // the cursor TOWARD the anchor (the held corner/edge).
                        const dx = anchor.x - cursorPos.x;
                        const dy = anchor.y - cursorPos.y;
                        const angleToAnchor = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                        return (
                            <div style={{
                                position: "absolute",
                                left: cursorPos.x - 16,
                                top: cursorPos.y - 6,
                                width: 32, height: 32,
                                zIndex: 30, pointerEvents: "none",
                                fontSize: 26,
                                lineHeight: 1,
                                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
                                transform: `rotate(${angleToAnchor}deg)`,
                                transformOrigin: "center center",
                                transition: "none",
                            }}>
                                👆
                            </div>
                        );
                    })()
                )}

                {/* Fully revealed state */}
                {revealed && (
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden",
                        animation: "popIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}>
                        {faceContent}
                        <div style={{
                            position: "absolute", bottom: 10, left: 0, right: 0,
                            textAlign: "center", fontSize: 9, color: "#b0a89a",
                            letterSpacing: 2, textTransform: "uppercase",
                            fontFamily: "'SF Mono', 'Courier New', monospace",
                        }}>tap to reset
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════
//  App
// ═════════════════════════════════════════════════════════════════
export default function PokerFlip() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(165deg, #070c16 0%, #101c30 45%, #0a1220 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "48px 20px", position: "relative", overflow: "hidden",
        }}>
            {/* ambient glow */}
            <div style={{
                position: "absolute", top: "15%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 700, height: 500,
                background: "radial-gradient(ellipse, rgba(40,70,130,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
            }}/>

            {/* felt texture overlay */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23ffffff' opacity='0.015'/%3E%3C/svg%3E")`,
                pointerEvents: "none",
            }}/>

            {/* title */}
            <div style={{textAlign: "center", marginBottom: 52, position: "relative", zIndex: 1}}>
                <h1 style={{
                    fontSize: 26, fontWeight: 400, color: "#9bb5d6",
                    letterSpacing: 10, textTransform: "uppercase",
                    margin: 0, fontFamily: "'SF Mono', 'Courier New', monospace",
                }}>
                    Squeeze
                </h1>
                <div style={{
                    width: 40, height: 1, background: "#2a4470",
                    margin: "14px auto",
                }}/>
                <p style={{
                    fontSize: 11, color: "#3d5a85", marginTop: 0,
                    letterSpacing: 3, textTransform: "uppercase",
                    fontFamily: "'SF Mono', 'Courier New', monospace",
                    lineHeight: 1.8,
                }}>
                    Touch near a corner or edge · Drag inward to peel · Release to reveal
                </p>
            </div>

            {/* cards */}
            <div style={{
                display: "flex", flexWrap: "wrap",
                gap: 32, justifyContent: "center",
                position: "relative", zIndex: 1,
                maxWidth: 760,
            }}>
                {DECK.map((c, i) => (
                    <PokerCard key={`${c.rank}-${c.suit}`} {...c} index={i}/>
                ))}
            </div>

            {/* legend */}
            <div style={{
                marginTop: 56, padding: "18px 26px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)",
                maxWidth: 420, width: "100%",
                position: "relative", zIndex: 1,
            }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px",
                    fontSize: 12, fontFamily: "'SF Mono', 'Courier New', monospace",
                    lineHeight: 1.9,
                }}>
                    <span style={{color: "#5a82b4"}}>Near corner</span>
                    <span style={{color: "#3a5a84"}}>→ peels diagonally</span>
                    <span style={{color: "#5a82b4"}}>Near edge</span>
                    <span style={{color: "#3a5a84"}}>→ peels from that side</span>
                    <span style={{color: "#4ade80"}}>Green bar</span>
                    <span style={{color: "#3a5a84"}}>→ release to fully reveal</span>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { transform: scale(0.94); opacity: 0.6; }
          to   { transform: scale(1); opacity: 1; }
        }
        .card-enter {
          animation: cardEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
        </div>
    );
}

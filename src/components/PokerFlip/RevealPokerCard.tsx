import {useCallback} from "react";
import type {CSSProperties} from "react";
import {cardImageForCode, backImage} from "./cardImages";
import {CARD_W, CARD_H, CARD_RADIUS, THRESHOLD, ENTRANCE_STAGGER_S, CARD_SIZES, CardSize} from "./constants";
import {foldClipAndTransform} from "./pokerFlipHelper";
import type {RevealPokerCardProps} from "./pokerFlipInterface";
import {usePeelGesture} from "./usePeelGesture";
import {FingerIndicator} from "./FingerIndicator";

/*
 *  Reveal Poker Card — a single reusable squeeze/peel card (presentational).
 *  ────────────────────────────────────────────────────────────────────────
 *  Gesture mechanics live in usePeelGesture; this component renders the layers
 *  from that state: card back (clipped to expose the table while peeling), the
 *  mirrored peeled flap, the progress bar / anchor label / finger overlays, and
 *  the revealed face. The card to show comes from the `code` prop; the
 *  post-reveal "tap to reset" affordance is controlled via `tapToReset`.
 */

// Inject the card's keyframes once, so the component is self-contained/reusable
// (no reliance on a stylesheet provided by the host page).
const KEYFRAME_STYLE_ID = "poker-card-keyframes";
if (typeof document !== "undefined" && !document.getElementById(KEYFRAME_STYLE_ID)) {
    const el = document.createElement("style");
    el.id = KEYFRAME_STYLE_ID;
    el.textContent = `
@keyframes pokerCardEnter { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes pokerCardPopIn { from { transform: scale(0.94); opacity: 0.6; } to { transform: scale(1); opacity: 1; } }
`;
    document.head.appendChild(el);
}

// shared style for the full-bleed card-art images (back + face)
const cardImgStyle: CSSProperties = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "fill",
    pointerEvents: "none",
};

export function RevealPokerCard({code, index = 0, onReveal, onReset, config}: RevealPokerCardProps) {
    // All appearance/behaviour comes from the single `config` prop (see PokerCardConfig).
    const {size = CardSize.pcDefault, rotation = 0, hint = false, showProgressBar = false, tapToReset} = config ?? {};

    // Physical render size. The gesture works in the base CARD_W×CARD_H space and the
    // card is CSS-scaled to fit, so `scale` is what the pointer offset is divided by.
    const {width: physW, height: physH} = CARD_SIZES[size];
    const scale = physW / CARD_W;
    const cardTransform = [
        scale !== 1 ? `scale(${scale})` : "",
        rotation ? `rotate(${rotation}deg)` : "",
    ].filter(Boolean).join(" ") || undefined;

    const handleReveal = useCallback(() => onReveal?.(code), [onReveal, code]);
    const {cardRef, dragging, revealed, anchor, progress, cursorPos, fold, start, reset} =
        usePeelGesture({onReveal: handleReveal, onReset, rotation, scale});

    // Reset affordance modes (see RevealPokerCardProps.tapToReset):
    //   custom slot → render fn controls reset;  false → disabled;  default → card-tap resets.
    // The built-in tap-to-reset (its "tap to reset" hint + whole-card tap) is also
    // suppressed when hint===false — disabling the card text turns it off too. A custom
    // reset slot (tapToReset render-fn) is unaffected, since that's UI you opted into.
    const customReset = typeof tapToReset === "function" ? tapToReset : null;
    const tapResetsCard = tapToReset !== false && !customReset && hint !== false;

    // peel clip + face reflection for the current fold
    const {clip: peelClip, transform: peelTransform} =
        fold && !revealed ? foldClipAndTransform(fold) : {clip: "none", transform: "none"};

    const faceImg = <img src={cardImageForCode(code)} alt="" draggable={false} style={cardImgStyle}/>;
    const backImg = <img src={backImage} alt="" draggable={false} style={cardImgStyle}/>;

    // press handler: drag-to-peel when face-down; reset only in default tap-to-reset mode
    const onPress = !revealed ? start : (tapResetsCard ? reset : undefined);

    return (
        <div
            style={{
                width: physW, height: physH,
                perspective: 1000, position: "relative",
                cursor: !revealed ? "grab" : (tapResetsCard ? "pointer" : "default"),
                animation: "pokerCardEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: `${index * ENTRANCE_STAGGER_S}s`,
            }}
        >
            <div
                ref={cardRef}
                data-testid="poker-card"
                onMouseDown={onPress}
                onTouchStart={onPress}
                style={{
                    // Base CARD_W×CARD_H geometry, centred in the physical wrapper and
                    // scaled (+ rotated) to fill it. The gesture undoes scale & rotation.
                    position: "absolute",
                    top: (physH - CARD_H) / 2, left: (physW - CARD_W) / 2,
                    width: CARD_W, height: CARD_H,
                    borderRadius: CARD_RADIUS,
                    transform: cardTransform,
                    transformOrigin: "center",
                    userSelect: "none", WebkitUserSelect: "none",
                    touchAction: "none", // card handles its own touch — no page scroll/zoom
                    // While peeling, the lift shadow lives on the (clipped) back layer so
                    // it hugs the peeled silhouette; the wrapper only carries the resting
                    // shadow once the card is fully revealed.
                    boxShadow: revealed ? "0 18px 42px rgba(0,0,0,0.4)" : "none",
                    transition: dragging ? "none" : "box-shadow 0.4s ease",
                }}
            >
                {/* Layer 1 — card back. Clipped to the kept (drag) side while peeling,
                    so the lifted anchor-side region falls away to reveal the container
                    underneath. peelClip is "none" when not folding → full back. */}
                {!revealed && (
                    <div style={{
                        position: "absolute", inset: 0, zIndex: 1,
                        // drop-shadow (unlike box-shadow) follows the clipped alpha, so the
                        // lift shadow hugs the peeled silhouette and doesn't ring the
                        // exposed felt where the corner has lifted away.
                        filter: `drop-shadow(0 ${4 + progress * 14}px ${12 + progress * 30}px rgba(0,0,0,${0.18 + progress * 0.22}))`,
                        transition: dragging ? "none" : "filter 0.4s ease",
                    }}>
                        <div style={{
                            position: "absolute", inset: 0,
                            borderRadius: CARD_RADIUS, overflow: "hidden",
                            clipPath: peelClip, WebkitClipPath: peelClip,
                        }}>
                            {backImg}
                            {/* Idle hint: built-in text (hint===true), a custom slot
                                (hint is a node), or nothing (hint===false). */}
                            {!dragging && progress === 0 && hint !== false && (
                                hint === true ? (
                                    <div style={{
                                        position: "absolute", bottom: 16, left: 0, right: 0,
                                        textAlign: "center", fontSize: 9, color: "#4a6491",
                                        letterSpacing: 2, textTransform: "uppercase",
                                        fontFamily: "'SF Mono', 'Courier New', monospace", zIndex: 3,
                                    }}>squeeze to peek</div>
                                ) : hint
                            )}
                        </div>
                    </div>
                )}

                {/* Layer 2 — peeled flap shows the CARD FACE (mirrored across fold line) */}
                {!revealed && fold && (
                    <div style={{
                        position: "absolute", inset: 0,
                        borderRadius: CARD_RADIUS, overflow: "hidden",
                        clipPath: peelClip, WebkitClipPath: peelClip,
                        zIndex: 4,
                    }}>
                        <div style={{position: "absolute", inset: 0, transform: peelTransform, transformOrigin: "0 0"}}>
                            {faceImg}
                        </div>
                    </div>
                )}

                {/* Anchor label while dragging (suppressed when text is disabled) */}
                {!revealed && dragging && anchor && hint !== false && (
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

                {/* Progress bar (showProgressBar={false} to hide) */}
                {!revealed && showProgressBar && progress > 0.01 && (
                    <div style={{
                        position: "absolute", bottom: 8, left: 20, right: 20,
                        height: 3, borderRadius: 2,
                        background: "rgba(0,0,0,0.2)",
                        zIndex: 20, overflow: "hidden", pointerEvents: "none",
                    }}>
                        <div style={{
                            width: `${progress * 100}%`, height: "100%", borderRadius: 2,
                            background: progress >= THRESHOLD
                                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                                : "linear-gradient(90deg, #7ba3d4, #3b5998)",
                            transition: dragging ? "none" : "width 0.3s ease",
                        }}/>
                    </div>
                )}

                {/* Finger indicator (photographic thumb) — shown whenever a fold exists,
                    i.e. while peeling AND through the spring-back (so it stays attached as
                    the card retracts). A bare click leaves fold null → no thumbs, which
                    also avoids flinging them off-card diagonally. */}
                {!revealed && fold && cursorPos && anchor && (
                    <FingerIndicator cursor={cursorPos} anchor={anchor}/>
                )}

                {/* Fully revealed state */}
                {revealed && (
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: CARD_RADIUS, overflow: "hidden",
                        animation: "pokerCardPopIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}>
                        {faceImg}
                        {/* Reset affordance: default hint, custom slot, or nothing (disabled) */}
                        {tapResetsCard && (
                            <div style={{
                                position: "absolute", bottom: 10, left: 0, right: 0,
                                textAlign: "center", fontSize: 9, color: "#b0a89a",
                                letterSpacing: 2, textTransform: "uppercase",
                                fontFamily: "'SF Mono', 'Courier New', monospace",
                            }}>tap to reset</div>
                        )}
                        {customReset?.(reset)}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RevealPokerCard;

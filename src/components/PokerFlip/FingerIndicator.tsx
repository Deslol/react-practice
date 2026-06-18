import handImg from "../../assets/reveal-poker-hand/hand.png";
import {HAND_W, HAND_H, HAND_TIP_X, HAND_TIP_Y, HAND_ANGLE_OFFSET} from "./constants";
import {peelAxisProjection} from "./pokerFlipHelper";
import type {FingerIndicatorProps} from "./pokerFlipInterface";

/**
 * Photographic thumb that follows the drag point and aims its nail at the anchor.
 * Pinned by its fingertip and rotated about it. Renders nothing once the pointer
 * is dragged *beyond* the anchor (negative peel-axis projection) — past the held
 * corner/edge it would otherwise float oddly off the card.
 */
export function FingerIndicator({cursor, anchor}: FingerIndicatorProps) {
    if (peelAxisProjection(anchor, cursor.x, cursor.y) < 0) return null;

    // Rotate so the nail points from the cursor TOWARD the anchor (held corner/edge).
    const dx = anchor.x - cursor.x;
    const dy = anchor.y - cursor.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + HAND_ANGLE_OFFSET;

    return (
        <img
            src={handImg}
            alt=""
            draggable={false}
            style={{
                position: "absolute",
                left: cursor.x - HAND_TIP_X * HAND_W,
                top: cursor.y - HAND_TIP_Y * HAND_H,
                width: HAND_W, height: HAND_H,
                zIndex: 30, pointerEvents: "none",
                transform: `rotate(${angle}deg)`,
                transformOrigin: `${HAND_TIP_X * 100}% ${HAND_TIP_Y * 100}%`,
                transition: "none",
            }}
        />
    );
}

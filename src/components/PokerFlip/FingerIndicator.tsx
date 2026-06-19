import handImg from "../../assets/reveal-poker-hand/hand.png";
import {CARD_W, CARD_H, HAND_W, HAND_H, HAND_TIP_X, HAND_TIP_Y, HAND_ANGLE_OFFSET} from "./constants";
import {peelAxisProjection} from "./pokerFlipHelper";
import type {FingerIndicatorProps, Point} from "./pokerFlipInterface";

// Value-thumb position dials — ONE PAIR PER PEEL AXIS, because on a portrait card the
// value surfaces at a different inset for a sideways (left/right) peel than for an
// up/down (top/bottom) one. Each is the rank-index inset from the card's near corner.
const IDX_LR_X = 32;  // left / right peel
const IDX_LR_Y = 36;
const IDX_TB_X = 20;  // top / bottom peel — tune these independently
const IDX_TB_Y = 45;

/**
 * Photographic thumb(s) that follow the peel and aim the nail at the anchor.
 *  - CORNER peel: one thumb, over the value revealed in the dog-ear flap.
 *  - EDGE peel: two thumbs — the value thumb over the rank index, and the "middle"
 *    thumb beside it (toward the card centre). Both ride the peel axis, so they move
 *    together / aligned. Hidden once dragged *beyond* the anchor.
 */
export function FingerIndicator({cursor, anchor}: FingerIndicatorProps) {
    if (peelAxisProjection(anchor, cursor.x, cursor.y) < 0) return null;

    // Rotate so the nail points from the cursor TOWARD the anchor (held corner/edge).
    const dx = anchor.x - cursor.x;
    const dy = anchor.y - cursor.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + HAND_ANGLE_OFFSET;

    const isCorner = anchor.label.includes("-");

    // Corner: one thumb over the dog-ear value, a fraction of the way along the peel.
    const COVER = 0.45;
    const coverPin: Point = {
        x: anchor.x + (cursor.x - anchor.x) * COVER,
        y: anchor.y + (cursor.y - anchor.y) * COVER,
    };

    // Edge: the value (rank index) surfaces at the 180° fold-reflection of the card's
    // near-side index about F = (anchor + cursor) / 2, i.e. 2F − index = anchor +
    // cursor − index. (The surfacing index is the one on the anchor's near corner.)
    // Pick the inset for this peel's axis (sideways vs up/down), then mirror it for the
    // far edge (right / bottom) via the nearTL flip.
    const horizontal = anchor.label === "left" || anchor.label === "right";
    const baseX = horizontal ? IDX_LR_X : IDX_TB_X;
    const baseY = horizontal ? IDX_LR_Y : IDX_TB_Y;
    const nearTL = anchor.x === 0 || anchor.y === 0;
    const idxX = nearTL ? baseX : CARD_W - baseX;
    const idxY = nearTL ? baseY : CARD_H - baseY;
    const valuePin: Point = {x: anchor.x + cursor.x - idxX, y: anchor.y + cursor.y - idxY};

    // The middle thumb is the value thumb projected onto the card's centre-line (the
    // peel axis runs through the card centre for an edge anchor), so it sits exactly
    // centred while staying level with the value thumb; both move together along the axis.
    const len = Math.hypot(cursor.x - anchor.x, cursor.y - anchor.y) || 1;
    const ux = (cursor.x - anchor.x) / len, uy = (cursor.y - anchor.y) / len;
    const cx = CARD_W / 2, cy = CARD_H / 2;
    const along = (valuePin.x - cx) * ux + (valuePin.y - cy) * uy;
    const middlePin: Point = {x: cx + ux * along, y: cy + uy * along};

    // Keep every pin on the card. At a tiny peel the edge value/middle pins can compute
    // off-card (e.g. valuePin.x = proj − idx < 0) before the peel slides them on; clamp
    // so a thumb never flies off diagonally.
    const onCard = (p: Point): Point => ({
        x: Math.max(0, Math.min(CARD_W, p.x)),
        y: Math.max(0, Math.min(CARD_H, p.y)),
    });
    const pins: Point[] = (isCorner ? [coverPin] : [middlePin, valuePin]).map(onCard);

    return (
        <>
            {pins.map((pin, i) => (
                <img
                    key={i}
                    src={handImg}
                    alt=""
                    draggable={false}
                    style={{
                        position: "absolute",
                        left: pin.x - HAND_TIP_X * HAND_W,
                        top: pin.y - HAND_TIP_Y * HAND_H,
                        width: HAND_W, height: HAND_H,
                        zIndex: 30, pointerEvents: "none",
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: `${HAND_TIP_X * 100}% ${HAND_TIP_Y * 100}%`,
                        transition: "none",
                    }}
                />
            ))}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────
//  Poker squeeze/peel — pure helpers (no React, no component state)
// ─────────────────────────────────────────────────────────────────

import {CARD_W, CARD_H} from "./constants";
import type {Anchor, Fold, Point, PointerEventLike} from "./pokerFlipInterface";

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Extract client coords from a mouse or touch event. */
export const pos = (e: PointerEventLike): Point => {
    const t = "touches" in e ? e.touches[0] : e;
    return {x: t.clientX, y: t.clientY};
};

/* Map a viewport point to BASE card-local coords (0..CARD_W, 0..CARD_H). `rect` is the
   card's (possibly scaled/rotated) bounding box, whose centre is the card centre — CSS
   scale + rotate are about the centre, so we measure from there, divide the offset by
   `scale` to undo the size, then apply the INVERSE rotation. With rotationDeg = 0 and
   scale = 1 this is just the offset from the card's top-left. (2D, screen space, y-down.) */
export function toCardLocal(rect: DOMRect, clientX: number, clientY: number, rotationDeg: number, scale: number): Point {
    const dx = (clientX - (rect.left + rect.width / 2)) / scale;
    const dy = (clientY - (rect.top + rect.height / 2)) / scale;
    if (!rotationDeg) return {x: CARD_W / 2 + dx, y: CARD_H / 2 + dy};
    const r = -rotationDeg * (Math.PI / 180);
    const cos = Math.cos(r), sin = Math.sin(r);
    return {x: CARD_W / 2 + (dx * cos - dy * sin), y: CARD_H / 2 + (dx * sin + dy * cos)};
}

/* Return a polygon (as CSS clip-path) that keeps everything on one side of a
   line defined by a point + normal. side = 1 keeps the half the normal points
   into; side = -1 keeps the other half. We build a huge quad covering the card
   on the "keep" side. */
export function halfPlaneClip(px: number, py: number, nx: number, ny: number, side: number, W: number, H: number): string {
    // tangent along the fold line
    const tx = -ny * side;
    const ty = nx * side;
    // push the "base" deep into the keep-side so the polygon covers the card
    const depth = W + H; // more than enough
    const bx = px + nx * side * depth;
    const by = py + ny * side * depth;
    const pts = [
        [px + tx * depth, py + ty * depth],
        [px - tx * depth, py - ty * depth],
        [bx - tx * depth, by - ty * depth],
        [bx + tx * depth, by + ty * depth],
    ];
    const poly = pts.map(([x, y]) => `${x}px ${y}px`).join(", ");
    return `polygon(${poly})`;
}

/* Nearest of the 8 anchor points (4 corners + 4 edge midpoints) to the touch,
   in card-local coords:

       TL ───── TOP ───── TR
       │                   │
      LEFT    (center)   RIGHT
       │                   │
       BL ─── BOTTOM ───── BR

   Purely by Euclidean distance, so the peel originates from the single nearest
   anchor (never a farther corner when an edge is closer). Strict `<` makes exact
   ties resolve to the earlier anchor in array order — on this portrait card a
   dead-centre touch is equidistant to "left"/"right", so "left" wins. */
export function nearestAnchor(localX: number, localY: number, W: number, H: number): Anchor {
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

/* Signed distance of a point along the peel axis — the ray from the anchor
   toward the card centre, which (for a rectangle) points straight at the
   opposite corner/edge. Positive = toward the centre/opposite side; negative =
   behind the anchor (i.e. dragged beyond the held corner/edge). */
export function peelAxisProjection(anchor: Anchor, px: number, py: number): number {
    let ux = CARD_W / 2 - anchor.x, uy = CARD_H / 2 - anchor.y;
    const ulen = Math.hypot(ux, uy) || 1;
    ux /= ulen;
    uy /= ulen;
    return (px - anchor.x) * ux + (py - anchor.y) * uy;
}

/* Given the current fold, return the CSS clip-path for the peeled (drag-side)
   region and the transform applied to the flap's face: a 180° ROTATION about the
   fold point (scaleX(-1)·scaleY(-1)), so the rank reads upright while peeking
   rather than mirrored. About the fold point (px,py):
     x' = 2·px − x,  y' = 2·py − y  →  matrix(-1, 0, 0, -1, 2px, 2py). */
export function foldClipAndTransform(fold: Fold): {clip: string; transform: string} {
    const {px, py, nx, ny} = fold;
    const clip = halfPlaneClip(px, py, nx, ny, 1, CARD_W, CARD_H);
    const transform = `matrix(-1, 0, 0, -1, ${2 * px}, ${2 * py})`;

    return {clip, transform};
}

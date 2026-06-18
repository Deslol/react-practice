import {CardType, convertToCardCode} from "./cardImages";
import {RevealPokerCard} from "./RevealPokerCard";

/*
 *  Example / demo page for <PokerCard/>.
 *  Renders a small hand of cards on a felt table with title + legend.
 *  The reusable piece is PokerCard — this file is just the showcase.
 */

// Card codes (suit nibble | value 1–13) — the same shape the websocket delivers.
const DECK: number[] = [
    convertToCardCode(CardType.SPADE, 1),     // A♠
    convertToCardCode(CardType.HEART, 13),    // K♥
    convertToCardCode(CardType.DIAMOND, 12),  // Q♦
    convertToCardCode(CardType.CLUB, 11),     // J♣
    convertToCardCode(CardType.HEART, 10),    // 10♥
];

export default function PokerFlipExample() {
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
                <div style={{width: 40, height: 1, background: "#2a4470", margin: "14px auto"}}/>
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
                {DECK.map((code, i) => (
                    <RevealPokerCard key={`${code}-${i}`} code={code} index={i}/>
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

            <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        </div>
    );
}

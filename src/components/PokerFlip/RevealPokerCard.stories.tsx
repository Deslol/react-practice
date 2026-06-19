import type {Meta, StoryObj} from "@storybook/react-vite";
import type {CSSProperties} from "react";
import {RevealPokerCard} from "./RevealPokerCard";
import {CardSize, CARD_SIZES} from "./constants";
import {CardType, convertToCardCode} from "./cardImages";

/*
 *  Storybook for <RevealPokerCard/> — one page per `config` field.
 *  ───────────────────────────────────────────────────────────────
 *  The component takes a single `config` prop (see PokerCardConfig). To make each
 *  field tweakable from the Controls panel, the stories expose them as FLAT args and
 *  the render() folds them back into one `config` object. Drag a card from a corner
 *  or an edge and pull inward to peel it; release past the halfway point to reveal.
 */

// A few example cards to choose from in the Controls panel.
const CARDS = {
    "A♠": convertToCardCode(CardType.SPADE, 1),
    "K♥": convertToCardCode(CardType.HEART, 13),
    "Q♦": convertToCardCode(CardType.DIAMOND, 12),
    "J♣": convertToCardCode(CardType.CLUB, 11),
    "10♥": convertToCardCode(CardType.HEART, 10),
};
// Reverse map (code → label) so the `code` select shows readable card names.
const CODE_LABELS: Record<string, string> = Object.fromEntries(
    Object.entries(CARDS).map(([label, code]) => [String(code), label]),
);
const CODE_LIST = Object.values(CARDS);

// Flat args surfaced as controls; render() below assembles them into `config`.
interface StoryArgs {
    code: number;
    size: CardSize;
    rotation: number;
    hint: boolean;
    showProgressBar: boolean;
    tapToReset: boolean;
    onReveal: (code: number) => void;
    onReset: () => void;
}

// Dark "felt" backdrop — the peel exposes whatever sits behind the card, so a dark
// stage makes the lifted corner read clearly (same look as the demo page).
const stage: CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: 460, padding: 48, boxSizing: "border-box",
    background: "linear-gradient(165deg, #070c16 0%, #101c30 45%, #0a1220 100%)",
};

const labelStyle: CSSProperties = {
    color: "#5a82b4", fontSize: 11, letterSpacing: 1,
    fontFamily: "'SF Mono', 'Courier New', monospace",
};

const meta: Meta<StoryArgs> = {
    title: "PokerFlip/RevealPokerCard",
    component: RevealPokerCard,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "A squeeze/peel poker card. Press near a corner or edge and drag inward to " +
                    "peel it open; release past the halfway threshold to reveal. All appearance & " +
                    "behaviour is set through the single `config` prop — each control below maps to " +
                    "one `config` field. (Global feel — peel sensitivity, finger placement, timings " +
                    "— lives in constants.ts, not here.)",
            },
        },
    },
    argTypes: {
        code: {
            control: "select",
            options: CODE_LIST,
            labels: CODE_LABELS,
            description: "Card code (suit nibble | value 1–13). Normally decoded from server data.",
            table: {category: "Card"},
        },
        size: {
            control: "select",
            options: Object.values(CardSize),
            description:
                "config.size — named render preset (mobile / pc × small / default / large). " +
                "Scales the base geometry, so the peel feels identical at every size.",
            table: {category: "config", defaultValue: {summary: "pcDefault"}},
        },
        rotation: {
            control: {type: "range", min: -180, max: 180, step: 1},
            description:
                "config.rotation — rotate the whole card (deg, about centre). The peel gesture is " +
                "inverse-mapped, so dragging works at any angle.",
            table: {category: "config", defaultValue: {summary: "0"}},
        },
        hint: {
            control: "boolean",
            description:
                "config.hint — built-in 'squeeze to peek' text + drag anchor label. Can also be a " +
                "custom ReactNode (see the “Custom hint slot” story). When false, the built-in " +
                "tap-to-reset is suppressed too.",
            table: {category: "config", defaultValue: {summary: "false"}},
        },
        showProgressBar: {
            control: "boolean",
            description:
                "config.showProgressBar — show the thin peel-progress bar (blue → green once past " +
                "the reveal threshold).",
            table: {category: "config", defaultValue: {summary: "false"}},
        },
        tapToReset: {
            control: "boolean",
            description:
                "config.tapToReset — tapping a revealed card flips it back (with a 'tap to reset' " +
                "hint). Can also be a render-fn slot (see the “Custom reset slot” story). Note: the " +
                "built-in reset is suppressed when hint is false.",
            table: {category: "config", defaultValue: {summary: "true"}},
        },
        onReveal: {action: "revealed", table: {category: "Events"}},
        onReset: {action: "reset", table: {category: "Events"}},
    },
    args: {
        code: CARDS["K♥"],
        size: CardSize.pcDefault,
        rotation: 0,
        hint: true,
        showProgressBar: true,
        tapToReset: true,
    },
    render: (args) => (
        <div style={stage}>
            <RevealPokerCard
                code={args.code}
                onReveal={args.onReveal}
                onReset={args.onReset}
                config={{
                    size: args.size,
                    rotation: args.rotation,
                    hint: args.hint,
                    showProgressBar: args.showProgressBar,
                    tapToReset: args.tapToReset,
                }}
            />
        </div>
    ),
};

export default meta;
type Story = StoryObj<StoryArgs>;

/**
 * Full chrome — hint text, progress bar and tap-to-reset all on. Tweak every
 * `config` field live from the Controls panel. Drag from any corner or edge.
 */
export const Playground: Story = {};

/**
 * A clean card with no chrome: `config.hint = false` and `showProgressBar = false`.
 * Because `hint` is false, the built-in tap-to-reset is suppressed too, so the card
 * stays revealed after the peel.
 */
export const Bare: Story = {
    args: {hint: false, showProgressBar: false},
    parameters: {
        docs: {description: {story: "The minimal look — no instructional text and no progress bar."}},
    },
};

/**
 * `config.size` — all six named presets, small → large. They share the base geometry,
 * so the peel behaves identically at every scale.
 */
export const Sizes: Story = {
    parameters: {
        controls: {disable: true},
        docs: {description: {story: "Drag any card to confirm the peel feels the same at each size."}},
    },
    render: () => (
        <div style={{...stage, flexWrap: "wrap", gap: 28, alignItems: "flex-end"}}>
            {Object.values(CardSize).map((s, i) => (
                <div key={s} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
                    <RevealPokerCard code={CODE_LIST[i % CODE_LIST.length]} config={{size: s, hint: true, showProgressBar: true}}/>
                    <span style={labelStyle}>{s} · {CARD_SIZES[s].width}×{CARD_SIZES[s].height}</span>
                </div>
            ))}
        </div>
    ),
};

/**
 * `config.rotation` — the squeeze works at any angle because the pointer is
 * inverse-mapped about the card's centre. Drag any of these.
 */
export const Rotations: Story = {
    parameters: {
        controls: {disable: true},
        docs: {description: {story: "A spread of angles (incl. a negative). Every one peels from the corner/edge you actually grab."}},
    },
    render: () => (
        <div style={{...stage, flexWrap: "wrap", gap: 12}}>
            {[0, 23, 45, 90, 137, -75].map((rotation, i) => (
                <div key={rotation} style={{
                    width: 320, height: 360, position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <RevealPokerCard code={CODE_LIST[i % CODE_LIST.length]} config={{rotation, hint: true, showProgressBar: true}}/>
                    <span style={{...labelStyle, position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center"}}>{rotation}°</span>
                </div>
            ))}
        </div>
    ),
};

/**
 * `config.hint = true` vs `false`. The built-in hint is the "squeeze to peek" prompt
 * (face-down) plus the anchor label shown while dragging.
 */
export const HintText: Story = {
    args: {hint: true, showProgressBar: false},
    parameters: {docs: {description: {story: "Toggle the `hint` control to compare with the chrome-free card."}}},
};

/**
 * `config.hint` can be any ReactNode — render your own branded prompt in the hint's
 * place instead of the built-in text.
 */
export const CustomHintSlot: Story = {
    parameters: {
        controls: {disable: true},
        docs: {description: {story: "Here `hint` is a custom node (a VIP badge) rather than `true`/`false`."}},
    },
    render: () => (
        <div style={stage}>
            <RevealPokerCard
                code={CARDS["A♠"]}
                config={{
                    showProgressBar: true,
                    hint: (
                        <div style={{
                            position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center",
                            color: "#e0b15a", fontSize: 10, letterSpacing: 2,
                            fontFamily: "'SF Mono', 'Courier New', monospace", zIndex: 3,
                        }}>★ VIP · squeeze to reveal ★</div>
                    ),
                }}
            />
        </div>
    ),
};

/**
 * `config.showProgressBar` — the thin bar tracks peel progress and turns green once
 * past the reveal threshold. Toggle the control to show/hide it.
 */
export const ProgressBar: Story = {
    args: {showProgressBar: true, hint: true},
    parameters: {docs: {description: {story: "Start a peel and watch the bar fill; it flips blue → green at the reveal threshold."}}},
};

/**
 * `config.tapToReset = false` — the card stays revealed after the peel; there's no
 * reset affordance and tapping it does nothing.
 */
export const TapToResetDisabled: Story = {
    args: {tapToReset: false, hint: true, showProgressBar: true},
    parameters: {docs: {description: {story: "Reveal the card, then note it cannot be tapped back to face-down."}}},
};

/**
 * `config.tapToReset` can be a render-fn slot: you draw the affordance for a revealed
 * card and call the provided `reset()` to flip it back.
 */
export const CustomResetSlot: Story = {
    parameters: {
        controls: {disable: true},
        docs: {description: {story: "Reveal the card to see a custom “Deal again” button wired to reset()."}},
    },
    render: () => (
        <div style={stage}>
            <RevealPokerCard
                code={CARDS["Q♦"]}
                config={{
                    hint: true,
                    showProgressBar: true,
                    tapToReset: (reset) => (
                        <button
                            onClick={reset}
                            style={{
                                position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                                padding: "6px 14px", borderRadius: 999,
                                border: "1px solid #c9a24a", background: "rgba(0,0,0,0.45)",
                                color: "#e0b15a", fontSize: 11, letterSpacing: 1, cursor: "pointer",
                                fontFamily: "'SF Mono', 'Courier New', monospace",
                            }}
                        >Deal again ↺</button>
                    ),
                }}
            />
        </div>
    ),
};

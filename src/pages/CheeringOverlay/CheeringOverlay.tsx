import style from './CheeringOverlay.module.scss'
import {useCallback, useEffect, useRef, useState} from "react";

type Team = "red" | "blue";
type CellId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface ChantPayload {
    id: number;
    text: string;
    team: Team;
}

interface VisibleChant extends ChantPayload {
    cellId: CellId;
    rotation: number;
}

const CELL_IDS: CellId[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const words = ['Go!', 'Three!', 'Four!', 'Face Card!', 'Peel It!', 'Blow It!'];

function startMockSocket(
    onMessage: (payload: ChantPayload) => void,
    frequency = 300,
) {
    const intervalId = setInterval(() => {
        const team: Team = Math.random() > 0.5 ? 'blue' : 'red';

        onMessage({
            id: Date.now() + Math.random(),
            text: pickRandomWord(words),
            team,
        });
    }, frequency);

    return () => clearInterval(intervalId);
}

function rng() {
    return Math.random();
}

function getRandomRotation() {
    return rng() * 40 - 20;
}

function pickRandomWord(words: string[]): string {
    if (!words.length) throw new Error("Word list cannot be empty");
    const index = Math.floor(Math.random() * words.length);
    return words[index];
}

export default function CheeringOverlay() {
    const MAX_VISIBLE_PER_TEAM = 3;
    const RETRY_FLUSH_MS = 150;

    const [visibleChants, setVisibleChants] = useState<VisibleChant[]>([]);
    const visibleChantsRef = useRef<VisibleChant[]>([]);
    const queueRef = useRef<ChantPayload[]>([]);
    const retryFlushTimeoutRef = useRef<number | null>(null);
    const tryFlushQueueRef = useRef<() => void>(() => {
    });

    useEffect(() => {
        visibleChantsRef.current = visibleChants;
    }, [visibleChants]);

    const getVisibleCount = useCallback((team: Team) => {
        return visibleChantsRef.current.filter((item) => item.team === team).length;
    }, []);

    const getRandomFreeCell = useCallback((team: Team): CellId | null => {
        const occupied = new Set(
            visibleChantsRef.current
                .filter((item) => item.team === team)
                .map((item) => item.cellId)
        );

        const freeCells = CELL_IDS.filter((cellId) => !occupied.has(cellId));

        if (freeCells.length === 0) return null;

        return freeCells[Math.floor(rng() * freeCells.length)] as CellId;
    }, []);

    const showQueuedChant = useCallback((payload: ChantPayload, cellId: CellId) => {
        setVisibleChants((prev) => {
            const next = [
                ...prev,
                {
                    ...payload,
                    cellId,
                    rotation: getRandomRotation(),
                }
            ];
            visibleChantsRef.current = next;
            return next;
        });
    }, []);

    const tryFlushQueue = useCallback(() => {
        const nextQueuedItem = queueRef.current[0];
        if (!nextQueuedItem) return;

        const visibleCount = getVisibleCount(nextQueuedItem.team);
        if (visibleCount >= MAX_VISIBLE_PER_TEAM) {
            if (retryFlushTimeoutRef.current !== null) return;

            retryFlushTimeoutRef.current = window.setTimeout(() => {
                retryFlushTimeoutRef.current = null;
                tryFlushQueueRef.current();
            }, RETRY_FLUSH_MS);

            return;
        }

        if (retryFlushTimeoutRef.current !== null) {
            clearTimeout(retryFlushTimeoutRef.current);
            retryFlushTimeoutRef.current = null;
        }

        const cellId = getRandomFreeCell(nextQueuedItem.team);
        if (cellId === null) return;

        queueRef.current.shift();
        showQueuedChant(nextQueuedItem, cellId);
    }, [getRandomFreeCell, getVisibleCount, showQueuedChant, MAX_VISIBLE_PER_TEAM, RETRY_FLUSH_MS]);

    const handleIncomingChant = useCallback((payload: ChantPayload) => {
        queueRef.current.push(payload);
        tryFlushQueueRef.current();
    }, []);

    const handleAnimationEnd = useCallback((chant: VisibleChant) => {
        setVisibleChants((prev) => {
            const next = prev.filter((item) => item.id !== chant.id);
            visibleChantsRef.current = next;
            return next;
        });

        tryFlushQueueRef.current();
    }, []);

    useEffect(() => {
        const stopMockSocket = startMockSocket(handleIncomingChant, 250);

        return () => {
            stopMockSocket();

            if (retryFlushTimeoutRef.current !== null) {
                clearTimeout(retryFlushTimeoutRef.current);
                retryFlushTimeoutRef.current = null;
            }
        };
    }, [handleIncomingChant]);

    useEffect(() => {
        tryFlushQueueRef.current = tryFlushQueue;
    }, [tryFlushQueue]);

    return (
        <div className={style.gameContainer}>
            <div>a</div>
            <div className={style.testLayer}>
                <div className={style.overlayLayer}>
                    <div className={`${style.board} ${style.boardRed}`}>
                        <div className={style.chantContainer}>
                            {CELL_IDS.map((cellId) => {
                                const chant = visibleChants.find(
                                    (item) => item.team === 'red' && item.cellId === cellId,
                                );

                                return (
                                    <div key={`red-${cellId}`} className={style.cell}>
                                        {chant ? (
                                            <span
                                                className={style.chantCell}
                                                style={
                                                {
                                                    ['--rotation' as string]: `${chant.rotation}deg`,
                                                    // 'margin': `${rng() * 50}px ${rng() * 50}px ${rng() * 50}px ${rng() * 50}px`,
                                                }}
                                                onAnimationEnd={() => handleAnimationEnd(chant)}
                                            >
                                                {chant.text}
                                            </span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`bg-blue-500/50 ${style.board} ${style.boardBlue}`}>
                        <div className={style.chantContainer}>
                            {CELL_IDS.map((cellId) => {
                                const chant = visibleChants.find(
                                    (item) => item.team === 'blue' && item.cellId === cellId,
                                );

                                return (
                                    <div key={`blue-${cellId}`} className={style.cell}>
                                        {chant ? (
                                            <span
                                                className={style.chantCell}
                                                style={{['--rotation' as string]: `${chant.rotation}deg`}}
                                                onAnimationEnd={() => handleAnimationEnd(chant)}
                                            >
                                                {chant.text}
                                            </span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                b
            </div>
            <div>
                c
            </div>
        </div>
    );
}
import style from './RandomRenderOverlay.module.css'
import {useEffect, useRef, useState} from "react";

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

const CELL_IDS: CellId[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function startMockSocket(
    onMessage: (payload: ChantPayload) => void,
    frequency = 300,
) {
    const intervalId = setInterval(() => {
        const team: Team = Math.random() > 0.5 ? 'blue' : 'red';

        onMessage({
            id: Date.now() + Math.random(),
            text: 'Halajoi',
            team: team,
        });
    }, frequency);

    return () => {
        clearInterval(intervalId);
    }
}

function rng() {
    return Math.random()
}

function getRandomRotation() {
    return rng() * 40 - 20
}

export default function RandomRenderOverlay() {
    const [visibleChants, setVisibleChants] = useState<VisibleChant[]>([]);

    const queueRef = useRef<ChantPayload[]>([])

    const occupiedCellsRef = useRef<Record<Team, Set<CellId>>>({
        blue: new Set<CellId>(),
        red: new Set<CellId>()
    })

    function getRandomFreeCell(team: Team): CellId | null {
        const freeCells = CELL_IDS.filter(
            (cellId) => !occupiedCellsRef.current[team].has(cellId)
        );

        if (freeCells.length === 0) {
            return null;
        }

        return freeCells[
            Math.floor(rng() * freeCells.length)
            ] as CellId;
    }

    function handleIncomingChant(payload: ChantPayload) {
        queueRef.current.push(payload);
        tryFlushQueue()
    }

    function tryFlushQueue() {
        const nextQueuedItem = queueRef.current[0];
        if (!nextQueuedItem) return;

        const cellId = getRandomFreeCell(nextQueuedItem.team)
        if (cellId === null) return;

        queueRef.current.shift()

        showQueuedChant(nextQueuedItem, cellId);
    }

    function showQueuedChant(payload: ChantPayload, cellId: CellId) {
        occupiedCellsRef.current[payload.team].add(cellId);

        setVisibleChants((prev) => [
            ...prev,
            {
                ...payload,
                cellId,
                rotation: getRandomRotation(),
            }
        ])
    }

    function handleAnimationEnd(payload: ChantPayload, cellId: CellId) {
        setVisibleChants((prev) => prev.filter((chant) => chant.id !== payload.id))
        occupiedCellsRef.current[payload.team].delete(cellId);
        tryFlushQueue()
    }

    useEffect(() => {
        const stopMockSocket = startMockSocket(handleIncomingChant, 300)

        return () => {
            stopMockSocket()
        }
    }, []);


    return (
        <div className={style.gameContainer}>
            <div>a</div>
            <div className={style.testLayer}>
                <div className={style.overlayLayer}>
                    <div>
                        <div className={style.chantContainer}>
                            {CELL_IDS.map((cellId) => {
                                const chant = visibleChants.find(
                                    (item) => item.team === 'red' && item.cellId === cellId,
                                )

                                return (
                                    <div key={`red-${cellId}`} className={style.cell}>
                                        {chant ? <p
                                            className={style.chantCell}
                                            style={{ ['--rotation' as string]: `${chant.rotation}deg` }}
                                            onAnimationEnd={() => handleAnimationEnd(chant, cellId)}
                                        >{chant.text}</p> : null}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="bg-blue-500/50">
                        <div className={style.chantContainer}>
                            {CELL_IDS.map((cellId) => {
                                const chant = visibleChants.find(
                                    (item) => item.team === 'blue' && item.cellId === cellId,
                                )

                                return (
                                    <div key={`blue-${cellId}`} className={style.cell}>
                                        {chant ? <p
                                            className={style.chantCell}
                                            style={{ ['--rotation' as string]: `${chant.rotation}deg` }}
                                            onAnimationEnd={() => handleAnimationEnd(chant, cellId)}
                                        >{chant.text}</p> : null}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                b
            </div>
            <div>c</div>
        </div>
    )
}

// function CustomisedButton ({children} : {children: React.ReactNode}) {
//     return (<Button>{children}</Button>)
// }
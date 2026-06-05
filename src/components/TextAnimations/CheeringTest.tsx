import style from "./CheeringTest.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
// import { Text, Button } from "@aceron/ui";
import TextAnimation from "./TextAnimation/TextAnimation.tsx";
import TextAnimationTwo from "./TextAnimationTwo/TextAnimationTwo.tsx";

type Team = "red" | "blue";
type CellId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type CheerType = "go" | "three" | "four" | "face" | "peel" | "blow";

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

const cheerMap: Record<CheerType, string> = {
	go: "Go!",
	three: "Three!",
	four: "Four!",
	face: "Face Card!",
	peel: "Peel It!",
	blow: "Blow It!",
};

// const words = ["go", "three", "four", "face", "peel", "blow"];
//
// function getCheerWord(cheer: CheerType): string {
// 	return cheerMap[cheer];
// }
//
// function startMockSocket(
// 	onMessage: (payload: ChantPayload) => void,
// 	frequency = 300,
// ) {
// 	const intervalId = setInterval(() => {
// 		const team: Team = Math.random() > 0.5 ? "blue" : "red";
//
// 		onMessage({
// 			id: Date.now() + Math.random(),
// 			text: pickRandomWord(words),
// 			team,
// 		});
// 	}, frequency);
//
// 	return () => clearInterval(intervalId);
// }
//
// function pickRandomWord(words: string[]): string {
// 	if (!words.length) throw new Error("Word list cannot be empty");
// 	const index = Math.floor(Math.random() * words.length);
// 	return getCheerWord(words[index] as CheerType);
// }

function rng() {
	return Math.random();
}

function getRandomRotation() {
	return rng() * 60 - 30;
}

export default function CheeringTest() {
	const MAX_VISIBLE_PER_TEAM = 3;
	const RETRY_FLUSH_MS = 150;

	const [visibleChants, setVisibleChants] = useState<VisibleChant[]>([]);
	const visibleChantsRef = useRef<VisibleChant[]>([]);
	const queueRef = useRef<ChantPayload[]>([]);
	const retryFlushTimeoutRef = useRef<number | null>(null);
	const tryFlushQueueRef = useRef<() => void>(() => {});

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
				.map((item) => item.cellId),
		);

		const freeCells = CELL_IDS.filter((cellId) => !occupied.has(cellId));

		if (freeCells.length === 0) return null;

		return freeCells[Math.floor(rng() * freeCells.length)] as CellId;
	}, []);

	const showQueuedChant = useCallback(
		(payload: ChantPayload, cellId: CellId) => {
			setVisibleChants((prev) => {
				const next = [
					...prev,
					{
						...payload,
						cellId,
						rotation: getRandomRotation(),
					},
				];
				visibleChantsRef.current = next;
				return next;
			});
		},
		[],
	);

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
	}, [
		getRandomFreeCell,
		getVisibleCount,
		showQueuedChant,
		MAX_VISIBLE_PER_TEAM,
		RETRY_FLUSH_MS,
	]);

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

	const handleCheerBtnClick = (cheerText: CheerType, team: Team) => {
		const newCheerPayload: ChantPayload = {
			// eslint-disable-next-line react-hooks/purity
			id: Date.now() + Math.random(),
			text: cheerText,
			team,
		};

		handleIncomingChant(newCheerPayload);
	};

	// Mock socket behaviour
	// useEffect(() => {
	// 	const stopMockSocket = startMockSocket(handleIncomingChant, 250);
	//
	// 	return () => {
	// 		stopMockSocket();
	//
	// 		if (retryFlushTimeoutRef.current !== null) {
	// 			clearTimeout(retryFlushTimeoutRef.current);
	// 			retryFlushTimeoutRef.current = null;
	// 		}
	// 	};
	// }, [handleIncomingChant]);

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
									(item) => item.team === "red" && item.cellId === cellId,
								);

								return (
									<div key={`red-${cellId}`} className={style.cell}>
										{chant ? (
											<TextAnimationTwo
												text={chant.text}
												rotation={chant.rotation}
												onAnimationEnd={() => handleAnimationEnd(chant)}
											/>
										) : null}
									</div>
								);
							})}
						</div>
					</div>

					<div className={`${style.board} ${style.boardBlue}`}>
						<div className={style.chantContainer}>
							{CELL_IDS.map((cellId) => {
								const chant = visibleChants.find(
									(item) => item.team === "blue" && item.cellId === cellId,
								);

								return (
									<div key={`blue-${cellId}`} className={style.cell}>
										{chant ? (
											<TextAnimation
												text={chant.text}
												rotation={chant.rotation}
												onAnimationEnd={() => handleAnimationEnd(chant)}
											/>
										) : null}
									</div>
								);
							})}
						</div>
					</div>
				</div>
				b
			</div>
			<div className={style.btnContainer}>
				<div className={`${style.btnGroup} ${style.teamRed}`}>
					{Object.values(cheerMap).map((cheerText) => {
						return (
							<button
								// className={`!bg-[linear-gradient(0deg,rgba(242,0,0,0.5)_0%,rgba(173,0,3,0.5)_100%)] ${style.cheerBtn}`}
								className={`${style.redBtn} ${style.cheerBtn}`}
								onClick={() =>
									handleCheerBtnClick(cheerText as CheerType, "red")
								}
							>
								<p className="breakText">
									{cheerText.includes(" ") ? (
										<>
											{cheerText.split(" ")[0]}
											<br />
											{cheerText.split(" ")[1]}
										</>
									) : (
										cheerText
									)}
								</p>
							</button>
						);
					})}
				</div>
				<div className={`${style.btnGroup} ${style.teamBlue}`}>
					{Object.values(cheerMap).map((cheerText) => {
						return (
							<button
								// className={`!bg-[linear-gradient(0deg,rgba(0,96,255,0.3)_0%,rgba(11,83,197,0.3)_100%)] ${style.cheerBtn}`}
								className={`${style.blueBtn} ${style.cheerBtn}`}
								onClick={() =>
									handleCheerBtnClick(cheerText as CheerType, "blue")
								}
							>
								<p>
									{cheerText.includes(" ") ? (
										<>
											{cheerText.split(" ")[0]}
											<br />
											{cheerText.split(" ")[1]}
										</>
									) : (
										cheerText
									)}
								</p>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

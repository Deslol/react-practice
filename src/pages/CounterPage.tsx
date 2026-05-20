import {useAppDispatch, useAppSelector} from "../store/redux/hooks.ts";
import {decrementCounter, incrementCounter, resetCounter, setCounter} from "../features/counter/counterSlice.ts";
import {useState} from "react";

export default function CounterPage() {
    const [curCount, setCurCount] = useState<number>(0);
    const dispatch = useAppDispatch();
    const globalCount = useAppSelector((state)=> state.counter.count)

    const incrementHandler = () => {
        dispatch(incrementCounter());
    }

    const decrementHandler = () => {
        dispatch(decrementCounter())
    }

    const resetCounterHandler = () => {
        dispatch(resetCounter())
    }

    const setCounterHandler = () => {
        dispatch(setCounter(curCount))
    }

    return (
        <div className="flex flex-col justify-center gap-3">
            <div className="flex justify-center gap-2 align-middle">
                <button onClick={incrementHandler} className="bg-white p-1 rounded-full cursor-pointer m-1">+</button>
                <p>Current Count:</p> <p>{globalCount}</p>
                <button onClick={decrementHandler} className="bg-white p-1 rounded-full cursor-pointer m-1">-</button>
            </div>


            <div className='flex justify-center gap-2 align-middle mx-auto'>
                <label>New count:</label>
                <input
                    id='new-count'
                    type="number"
                    value={curCount}
                    onChange={(e)=> setCurCount(Number(e.target.value))}/>
            </div>


            <button onClick={setCounterHandler} className="bg-white p-1 rounded-full cursor-pointer m-1">Set Count</button>

            <button onClick={resetCounterHandler} className="bg-white p-1 rounded-full cursor-pointer m-1">Reset</button>
        </div>
    )
}
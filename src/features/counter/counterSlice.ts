import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {Counter} from "../../types/counter.type.ts";

const initialState: Counter = {
    count: 0
}

export const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        incrementCounter: (state) => {
            state.count += 1;
        },
        decrementCounter: (state) => {
            state.count -= 1;
        },
        resetCounter: (state) => {
            state.count = 0;
        },
        setCounter: (state, action: PayloadAction<number>) => {
            state.count = action.payload;
        }
    }
})

export const {
    incrementCounter,
    decrementCounter,
    resetCounter,
    setCounter
} = counterSlice.actions;

export default counterSlice.reducer;
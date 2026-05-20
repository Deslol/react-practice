import {configureStore} from "@reduxjs/toolkit";
import todoSlice from "../features/todos/todoSlice.ts";
import counterSlice from "../features/counter/counterSlice.ts";

export const store = configureStore({
    reducer: {
        todos: todoSlice,
        counter: counterSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
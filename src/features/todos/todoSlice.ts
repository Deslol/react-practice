import type {TODO} from "../../interfaces/todo.interface.ts";
import type {TodoFilter} from "../../types/TODO.type.ts";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

type TodoState = {
    todos: TODO[]
    filter: TodoFilter
}

const initialState: TodoState = {
    todos: [],
    filter: "all"
}

const todoSlice = createSlice({
    name: "todos",
    initialState,
    reducers: {
        addTodo: (state, action: PayloadAction<string>) => {
            state.todos.push({
                id: crypto.randomUUID(),
                text: action.payload.trim(),
                completed: false
            })
        },
        deleteTodo: (state, action: PayloadAction<string>) => {
            state.todos = state.todos.filter(
                (todo) => todo.id !== action.payload
            )
        },
        toggleTodo: (state, action: PayloadAction<string>) => {
            state.todos = state.todos.map((todo) => {
                if (todo.id === action.payload) {
                    return {...todo, completed: !todo.completed}
                }

                return todo
            })
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload as TodoFilter;
        }
    }
})

export const {
    addTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
} = todoSlice.actions;

export default todoSlice.reducer;
import type {TODO} from "../../interfaces/todo.interface.ts";
import {useState} from "react";
import TodoListItem from "./TodoListItem.tsx";
import type {TodoFilter} from "../../types/TODO.type.ts";
import {useAppDispatch, useAppSelector} from "../../store/redux/hooks.ts";
import {addTodo, deleteTodo, setFilter, toggleTodo} from "../../features/todos/todoSlice.ts";


export default function TodoList() {
    const [inputTxt, setInputTxt] = useState<string>("");

    const todos = useAppSelector((state) => state.todos.todos)
    const filter = useAppSelector((state) => state.todos.filter)
    const dispatch = useAppDispatch();

    const plusClickHandler = () => {
        // setTodos((prevTodos: TODO[]): TODO[] => [...prevTodos, newTodo])
        dispatch(addTodo(inputTxt));
        setInputTxt('')
    }

    const deleteHandler = (id: string) => {
        dispatch(deleteTodo(id));
    }

    const toggleCompleteHandler = (id: string) => {
        dispatch(toggleTodo(id));
    }

    const filteredTodos = todos
        .filter((todo) => {
            if (filter === "active") {
                return !todo.completed
            } else if (filter === "completed") {
                return todo.completed
            } else {
                return true
            }
        })

    return (
        <div className='flex align-middle justify-center flex-col gap-2'>
            <h1>TODO List</h1>
            <select name="filter" id="filter-select" className='mx-auto'
                    onChange={(e) => dispatch(setFilter(e.target.value as TodoFilter))} value={filter}>
                <option value='all'>All</option>
                <option value='active'>Active</option>
                <option value='completed'>Completed</option>
            </select>
            <div className="flex mx-auto gap-1.5">
                <input onChange={(e) => setInputTxt(e.target.value)} value={inputTxt} className="bg-white p-2"/>
                <button onClick={plusClickHandler} className="bg-blue-600 p-2 rounded-4xl cursor-pointer">+</button>
            </div>
            <ul className="mx-auto pt-2">
                {
                    filteredTodos.length === 0 ? <p>The list is empty, please add a task now!</p> :
                        filteredTodos
                            .map((todo: TODO) => {
                                return (
                                    <TodoListItem
                                        todo={todo}
                                        key={todo.id}
                                        deleteHandler={deleteHandler}
                                        toggleHandler={toggleCompleteHandler}
                                    />
                                )
                            })
                }
            </ul>
        </div>
    );
}
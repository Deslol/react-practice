import type {TODO} from "../interfaces/todo.interface.ts";
import {useState} from "react";


export default function TodoList() {
    const [todos, setTodos] = useState<TODO[]>([])
    const [inputTxt, setInputTxt] = useState<string>("");

    const plusClickHandler = () => {
        const newTodo: TODO = {
            id: crypto.randomUUID(),
            text: inputTxt,
            completed: false,
        }
        setTodos((prevTodos: TODO[]): TODO[] => [...prevTodos, newTodo])
        setInputTxt('')
    }

    return (
        <>
            <h1>TODO List</h1>
            <div className="flex mx-auto gap-1.5">
                <input onChange={(e) => setInputTxt(e.target.value)} value={inputTxt} className="bg-white p-2" />
                <button onClick={plusClickHandler} className="bg-blue-600 p-2 rounded-4xl cursor-pointer">+</button>
            </div>
            <ul className="mx-auto pt-2">
                {
                    todos.map((todo: TODO) => {
                        return (
                            <li key={todo.id} className="flex gap-3">
                                <p>
                                    {todo.text}
                                </p>
                                <p className={todo.completed? 'text-green-400' : 'text-red-600'}>
                                    {todo.completed ? 'Y': 'X'}
                                </p>
                            </li>
                        )
                    })
                }
            </ul>
        </>
    );
}
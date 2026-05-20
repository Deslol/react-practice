import type {TODO} from "../../interfaces/todo.interface.ts";

export default function TodoListItem(
    {
        todo,
        deleteHandler,
        toggleHandler,
    }: {
        todo: TODO,
        deleteHandler: (id: string) => void,
        toggleHandler: (id: string) => void,
    }) {

    return (
        <li className="flex gap-3">
            <p className={`${todo.completed ? 'text-green-500 line-through' : 'text-red-500'}`}>
                {todo.text}
            </p>

            {/*<p className={todo.completed? 'text-green-400' : 'text-red-600'}>*/}
            {/*    {todo.completed ? 'Y': 'X'}*/}
            {/*</p>*/}

            <input type="checkbox" onChange={() => toggleHandler(todo.id)} checked={todo.completed}/>
            <button className="text-red-600 cursor-pointer" onClick={() => deleteHandler(todo.id)}>X</button>

        </li>
    )
}
import { Link, Outlet } from "react-router";

export default function DashboardLayout() {
    return (
        <div>
            <header>
                <h1>Practice Dashboard</h1>

                <nav className="flex items-center justify-center">
                    <ul className="flex gap-2">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/tasks/todo">TODO</Link>
                        </li>
                        <li>
                            <Link to="tasks/counter">Counter</Link>
                        </li>
                        <li>
                            <Link to="tasks/notesPanel">Notes Panel</Link>
                        </li>
                    </ul>
                </nav>
            </header>

            <main>
                <Outlet/>
            </main>
        </div>
    )
}
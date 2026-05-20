import {useAppSelector} from "../store/redux/hooks.ts";

export default function DashboardHome() {
    const globalCount = useAppSelector((state)=> state.counter.count)

    return (
        <section>
            <h2>Home</h2>
            <p>Welcome to the practice dashboard.</p>
            <p>Global count: {globalCount}</p>
        </section>
    )
}
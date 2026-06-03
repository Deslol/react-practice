import {createBrowserRouter} from "react-router";
import DashboardLayout from "./pages/DashboardLayout.tsx";
import DashboardHome from "./pages/DashboardHome.tsx";
import TodoPage from "./pages/TodoPage.tsx";
import CounterPage from "./pages/CounterPage.tsx";
import NotePanelPage from "./pages/NotePanelPage.tsx";
import NotificationsPage from "./pages/NotificationsPage.tsx";
import CheeringOverlay from "./pages/CheeringOverlay/CheeringOverlay.tsx";
import TextAnimationPage from "./pages/TextAnimation/TextAnimationPage.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: DashboardLayout,
        children: [
            {
                index: true,
                Component: DashboardHome
            },
            {
                path: "tasks",
                children: [
                    {
                        path: "todo",
                        Component: TodoPage
                    },
                    {
                        path: "counter",
                        Component: CounterPage
                    },
                    {
                        path: "notesPanel",
                        Component: NotePanelPage
                    },
                    {
                        path: "notifications",
                        Component: NotificationsPage
                    },
                    {
                        path: 'cheeringOverlay',
                        Component: CheeringOverlay
                    },
                    {
                        path: "textAnimation",
                        Component: TextAnimationPage
                    }
                ]
            }
        ]
    }
])
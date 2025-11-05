import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TopBar } from "@/components/TopBar"

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen">
            <TopBar />
            <Outlet />
        </div>
    ),
})

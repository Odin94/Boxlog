/// <reference types="vite/client" />
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./style.css"

import { ClerkProvider } from "@clerk/clerk-react"
import { ContainersProvider } from "./contexts/ContainersContext"
import { getConfig } from "./lib/config"
import { routeTree } from "./routeTree.gen"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

const { CLERK_PUBLISHABLE_KEY } = getConfig()

createRoot(document.getElementById("app")!).render(
    <StrictMode>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <ContainersProvider>
                <RouterProvider router={router} />
            </ContainersProvider>
        </ClerkProvider>
    </StrictMode>
)

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import "./style.css"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"
import { ContainersProvider } from "./contexts/ContainersContext"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("app")!).render(
    <StrictMode>
        <ContainersProvider>
            <RouterProvider router={router} />
        </ContainersProvider>
    </StrictMode>
)

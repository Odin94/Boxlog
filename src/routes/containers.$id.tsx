import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ContainerDetail } from "@/components/ContainerDetail"
import { useContainers } from "@/contexts/ContainersContext"
import { useAuth } from "@clerk/clerk-react"
import { useEffect } from "react"
import type { ContentImage } from "@/components/types"

export const Route = createFileRoute("/containers/$id")({
    component: ContainerDetailComponent,
})

function ContainerDetailComponent() {
    const { id } = Route.useParams()
    const navigate = useNavigate()
    const { containers, categories, updateContainer } = useContainers()
    const { isSignedIn, isLoaded } = useAuth()

    // Redirect to landing page if not signed in
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate({ to: "/landing" })
        }
    }, [isLoaded, isSignedIn, navigate])

    // Show loading while checking auth
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Don't render if not signed in (will redirect)
    if (!isSignedIn) {
        return null
    }

    const container = containers.find((c) => c.id === id)

    const handleNameChange = (containerId: string, name: string) => {
        updateContainer(containerId, { name })
    }

    const handleContentImagesChange = async (containerId: string, images: ContentImage[]) => {
        await updateContainer(containerId, { contentImages: images })
    }

    const handleBack = () => {
        navigate({ to: "/" })
    }

    if (!container) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <button onClick={handleBack} className="mb-4">
                    ← Back to containers
                </button>
                <p>Container not found</p>
            </div>
        )
    }

    return (
        <ContainerDetail
            container={container}
            categories={categories}
            onBack={handleBack}
            onNameChange={handleNameChange}
            onContentImagesChange={handleContentImagesChange}
        />
    )
}

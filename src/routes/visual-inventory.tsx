import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useContainers } from "@/contexts/ContainersContext"
import { useAuth } from "@clerk/clerk-react"
import { useEffect, useState, useMemo } from "react"
import { Camera, ImageIcon, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/visual-inventory")({
    component: VisualInventoryComponent,
})

function VisualInventoryComponent() {
    const navigate = useNavigate()
    const { containers, isLoadingContainers } = useContainers()
    const { isSignedIn, isLoaded } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")

    // Redirect to landing page if not signed in
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate({ to: "/landing" })
        }
    }, [isLoaded, isSignedIn, navigate])

    // Flatten all content images from all containers
    const allContentImages = useMemo(() => {
        return containers.flatMap((container) =>
            container.contentImages.map((image) => ({
                image,
                containerId: container.id,
                containerName: container.name,
            }))
        )
    }, [containers])

    // Fuzzy search filter - matches only image descriptions
    const filteredImages = useMemo(() => {
        if (!searchQuery.trim()) {
            return allContentImages
        }

        const query = searchQuery.toLowerCase().trim()
        return allContentImages.filter((item) => {
            return item.image.description?.toLowerCase().includes(query)
        })
    }, [allContentImages, searchQuery])

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

    const handleImageClick = (containerId: string | undefined) => {
        if (containerId) {
            navigate({ to: "/containers/$id", params: { id: containerId } })
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ImageIcon className="w-8 h-8" />
                        Visual Inventory
                    </h1>
                    <div className="max-w-md flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by image description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground">Click on a photo to see it's container</p>
            </div>

            {isLoadingContainers && containers.length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading containers...</p>
                </div>
            ) : allContentImages.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No content images yet. Add images to your containers to see them here.</p>
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground">No images match your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredImages.map((item, idx) => (
                        <div key={`${item.containerId}-${item.image.id}-${idx}`} className="flex flex-col">
                            <button
                                onClick={() => handleImageClick(item.containerId)}
                                className="group relative aspect-square bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all cursor-pointer"
                            >
                                {item.image.url ? (
                                    <img
                                        src={item.image.url}
                                        alt={item.image.description || item.containerName || "Content image"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement
                                            img.style.display = "none"
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground text-center px-2 line-clamp-2">
                                            {item.containerName || "No image"}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                {item.containerName && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-medium truncate">{item.containerName}</p>
                                    </div>
                                )}
                            </button>
                            {item.image.description && (
                                <div className="mt-2 text-center">
                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.image.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

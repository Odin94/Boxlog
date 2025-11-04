import { ContainerCard } from "./ContainerCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Container } from "@/components/types"

interface ContainerGridProps {
    containers: Container[]
    onContainerClick: (container: Container) => void
    onCreateContainer: () => void
    onNameChange: (id: string, name: string) => void
    onCoverImageChange: (id: string, image: string) => void
    onContentImagesChange: (id: string, images: string[]) => void
}

export function ContainerGrid({
    containers,
    onContainerClick,
    onCreateContainer,
    onNameChange,
    onCoverImageChange,
    onContentImagesChange,
}: ContainerGridProps) {
    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Containers</h1>
                <Button onClick={onCreateContainer}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Container
                </Button>
            </div>

            {containers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground mb-4">No containers yet. Create your first container to get started!</p>
                    <Button onClick={onCreateContainer}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Container
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {containers.map((container) => (
                        <ContainerCard
                            key={container.id}
                            container={container}
                            onNameChange={onNameChange}
                            onCoverImageChange={onCoverImageChange}
                            onContentImagesChange={onContentImagesChange}
                            onClick={() => onContainerClick(container)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

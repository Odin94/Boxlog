import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus, FolderPlus } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CategorySection } from "./CategorySection"
import type { Container, Category } from "@/components/types"

type ContainerGridProps = {
    containers: Container[]
    categories: Category[]
    onContainerClick: (container: Container) => void
    onCreateContainer: () => void
    onCreateCategory: () => void
    onNameChange: (id: string, name: string) => void
    onCoverImageChange: (id: string, image: string) => void
    onContentImagesChange: (id: string, images: string[]) => void
    onCategoryNameChange: (id: string, name: string) => void
    onDeleteCategory: (id: string) => void
    onMoveContainerToCategory: (containerId: string, categoryId: string | undefined) => void
    onReorderContainers: (containerId: string, overContainerId: string) => void
    onMoveCategoryUp: (id: string) => void
    onMoveCategoryDown: (id: string) => void
}

export function ContainerGrid({
    containers,
    categories,
    onContainerClick,
    onCreateContainer,
    onCreateCategory,
    onNameChange,
    onCoverImageChange,
    onContentImagesChange,
    onCategoryNameChange,
    onDeleteCategory,
    onMoveContainerToCategory,
    onReorderContainers,
    onMoveCategoryUp,
    onMoveCategoryDown,
}: ContainerGridProps) {
    const [activeId, setActiveId] = useState<string | null>(null)

    const uncategorizedContainers = containers.filter((c) => !c.categoryId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const categorizedContainers = sortedCategories.map((category, index) => ({
        category,
        containers: containers.filter((c) => c.categoryId === category.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        canMoveUp: index > 0,
        canMoveDown: index < sortedCategories.length - 1,
    }))

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const containerId = active.id as string
        const overId = over.id as string

        // Don't do anything if dropped on itself
        if (containerId === overId) return

        // If dropped on a category section (including uncategorized), move container to that category
        if (categories.some((cat) => cat.id === overId) || overId === "uncategorized") {
            onMoveContainerToCategory(containerId, overId === "uncategorized" ? undefined : overId)
        } else {
            // Check if dropped on a container - reorder or move to that container's category
            const targetContainer = containers.find((c) => c.id === overId)
            if (targetContainer) {
                const draggedContainer = containers.find((c) => c.id === containerId)
                // If same category, reorder; otherwise move to new category
                if (draggedContainer?.categoryId === targetContainer.categoryId) {
                    onReorderContainers(containerId, overId)
                } else {
                    onMoveContainerToCategory(containerId, targetContainer.categoryId)
                }
            }
        }
    }

    const allSortableIds = ["uncategorized", ...categories.map((c) => c.id), ...containers.map((c) => c.id)]

    return (
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Containers</h1>
                    <div className="flex gap-2">
                        <Button onClick={onCreateCategory} variant="outline">
                            <FolderPlus className="h-4 w-4 mr-2" />
                            New Category
                        </Button>
                        <Button onClick={onCreateContainer}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Container
                        </Button>
                    </div>
                </div>

                <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
                    {containers.length === 0 && categories.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                            <p className="text-muted-foreground mb-4">No containers yet. Create your first container to get started!</p>
                            <Button onClick={onCreateContainer}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Container
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Uncategorized section - always shown first */}
                            {uncategorizedContainers.length > 0 && (
                                <CategorySection
                                    containers={uncategorizedContainers}
                                    onContainerClick={onContainerClick}
                                    onNameChange={onNameChange}
                                    onCoverImageChange={onCoverImageChange}
                                    onContentImagesChange={onContentImagesChange}
                                    onCategoryNameChange={onCategoryNameChange}
                                />
                            )}

                            {/* Categorized sections */}
                            <AnimatePresence>
                                {categorizedContainers.map(({ category, containers: categoryContainers, canMoveUp, canMoveDown }) => (
                                    <motion.div
                                        key={category.id}
                                        layout
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <CategorySection
                                            category={category}
                                            containers={categoryContainers}
                                            onContainerClick={onContainerClick}
                                            onNameChange={onNameChange}
                                            onCoverImageChange={onCoverImageChange}
                                            onContentImagesChange={onContentImagesChange}
                                            onCategoryNameChange={onCategoryNameChange}
                                            onDeleteCategory={onDeleteCategory}
                                            onMoveCategoryUp={onMoveCategoryUp}
                                            onMoveCategoryDown={onMoveCategoryDown}
                                            canMoveUp={canMoveUp}
                                            canMoveDown={canMoveDown}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </>
                    )}
                </SortableContext>

                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-50">
                            <div className="bg-card border rounded-lg p-4 shadow-lg">Dragging...</div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    )
}

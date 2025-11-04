import { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { ContainerCard } from "./ContainerCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import type { Container, Category } from "@/components/types"

type CategorySectionProps = {
    category?: Category
    containers: Container[]
    onContainerClick: (container: Container) => void
    onNameChange: (id: string, name: string) => void
    onCoverImageChange: (id: string, image: string) => void
    onContentImagesChange: (id: string, images: string[]) => void
    onCategoryNameChange: (id: string, name: string) => void
    onDeleteCategory?: (id: string) => void
    onMoveCategoryUp?: (id: string) => void
    onMoveCategoryDown?: (id: string) => void
    canMoveUp?: boolean
    canMoveDown?: boolean
}

export function CategorySection({
    category,
    containers,
    onContainerClick,
    onNameChange,
    onCoverImageChange,
    onContentImagesChange,
    onCategoryNameChange,
    onDeleteCategory,
    onMoveCategoryUp,
    onMoveCategoryDown,
    canMoveUp,
    canMoveDown,
}: CategorySectionProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(category?.name || "Uncategorized")

    useEffect(() => {
        if (category) {
            setNameValue(category.name)
        }
    }, [category?.name])

    const sectionId = category?.id || "uncategorized"
    const {
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: sectionId,
        disabled: !category, // Don't allow dragging uncategorized section
    })

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: sectionId,
    })

    // Combine both refs for the main container - make it both sortable and droppable
    const setContainerRef = (node: HTMLDivElement | null) => {
        setSortableRef(node)
        setDroppableRef(node)
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleNameSubmit = () => {
        if (category) {
            onCategoryNameChange(category.id, nameValue)
        }
        setIsEditingName(false)
    }

    const title = category ? (
        isEditingName ? (
            <div className="flex gap-2 items-center">
                <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onBlur={handleNameSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleNameSubmit()
                        } else if (e.key === "Escape") {
                            setNameValue(category.name)
                            setIsEditingName(false)
                        }
                    }}
                    autoFocus
                    className="h-8"
                />
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">{category.name}</h2>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingName(true)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                {onMoveCategoryUp && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMoveCategoryUp(category.id)}
                        disabled={!canMoveUp}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                )}
                {onMoveCategoryDown && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMoveCategoryDown(category.id)}
                        disabled={!canMoveDown}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                )}
                {onDeleteCategory && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => onDeleteCategory(category.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        )
    ) : (
        <h2 className="text-2xl font-semibold">Uncategorized</h2>
    )

    return (
        <div ref={setContainerRef} style={style} className={`mb-8 ${isOver ? "ring-2 ring-primary rounded-lg p-2" : ""}`}>
            <div className="mb-4">{title}</div>
            {containers.length === 0 ? (
                <div
                    className={`text-center py-8 border-2 border-dashed border-muted rounded-lg ${
                        isOver ? "border-primary bg-primary/5" : ""
                    }`}
                >
                    <p className="text-muted-foreground text-sm">No containers in this category</p>
                    {isOver && <p className="text-primary text-sm mt-2">Drop here</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {containers.map((container) => (
                        <DraggableContainerCard
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

function DraggableContainerCard({
    container,
    onNameChange,
    onCoverImageChange,
    onContentImagesChange,
    onClick,
}: {
    container: Container
    onNameChange: (id: string, name: string) => void
    onCoverImageChange: (id: string, image: string) => void
    onContentImagesChange: (id: string, images: string[]) => void
    onClick: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: container.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-3 top-2 z-10 cursor-grab active:cursor-grabbing p-2 rounded"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 13h8M8 17h8" />
                </svg>
            </div>
            <ContainerCard
                container={container}
                onNameChange={onNameChange}
                onCoverImageChange={onCoverImageChange}
                onContentImagesChange={onContentImagesChange}
                onClick={onClick}
            />
        </div>
    )
}

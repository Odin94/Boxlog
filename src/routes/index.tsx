import { createFileRoute } from "@tanstack/react-router"
import { ContainerGrid } from "@/components/ContainerGrid"
import type { Container, Category, ContentImage } from "@/components/types"
import { useNavigate } from "@tanstack/react-router"
import { useContainers } from "@/contexts/ContainersContext"
import { useWriteCategories } from "@/db/category_db"

export const Route = createFileRoute("/")({
    component: IndexComponent,
})

function IndexComponent() {
    const navigate = useNavigate()
    const {
        containers,
        categories,
        addContainer,
        updateContainer,
        addCategory,
        updateCategory,
        deleteCategory,
        moveContainerToCategory,
        reorderContainers,
        moveCategoryUp,
        moveCategoryDown,
    } = useContainers()
    const { upsertCategory } = useWriteCategories()

    const handleCreateContainer = () => {
        const newContainer: Container = {
            id: Date.now().toString(),
            name: "New Container",
            contentImages: [],
        }
        addContainer(newContainer)
    }

    const handleCreateCategory = async () => {
        const newCategory: Category = {
            name: "New Category",
        }
        const result = await upsertCategory(newCategory)
        if (result.status === "success" && result.category) {
            addCategory(result.category)
        } else if (result.error) {
            console.error("Failed to create category in Supabase:", result.error)
        }
    }

    const handleNameChange = (id: string, name: string) => {
        updateContainer(id, { name })
    }

    const handleCoverImageChange = (id: string, image: string) => {
        updateContainer(id, { coverImage: image })
    }

    const handleContentImagesChange = (id: string, images: ContentImage[]) => {
        updateContainer(id, { contentImages: images })
    }

    const handleCategoryNameChange = (id: string, name: string) => {
        updateCategory(id, { name })
    }

    const handleContainerClick = (container: Container) => {
        navigate({ to: "/boxes/$id", params: { id: container.id } })
    }

    return (
        <ContainerGrid
            containers={containers}
            categories={categories}
            onContainerClick={handleContainerClick}
            onCreateContainer={handleCreateContainer}
            onCreateCategory={handleCreateCategory}
            onNameChange={handleNameChange}
            onCoverImageChange={handleCoverImageChange}
            onContentImagesChange={handleContentImagesChange}
            onCategoryNameChange={handleCategoryNameChange}
            onDeleteCategory={deleteCategory}
            onMoveContainerToCategory={moveContainerToCategory}
            onReorderContainers={reorderContainers}
            onMoveCategoryUp={moveCategoryUp}
            onMoveCategoryDown={moveCategoryDown}
        />
    )
}

import { createFileRoute } from "@tanstack/react-router"
import { ContainerGrid } from "@/components/ContainerGrid"
import type { Container, Category, ContentImage } from "@/components/types"
import { useNavigate } from "@tanstack/react-router"
import { useContainers } from "@/contexts/ContainersContext"

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

    const handleCreateContainer = async () => {
        const newContainer: Container = {
            name: "New Container",
            contentImages: [],
        }
        await addContainer(newContainer)
    }

    const handleCreateCategory = async () => {
        const newCategory: Category = {
            name: "New Category",
        }
        await addCategory(newCategory)
    }

    const handleNameChange = async (id: string, name: string) => {
        await updateContainer(id, { name })
    }

    const handleCoverImageChange = async (id: string, image: string) => {
        await updateContainer(id, { coverImage: image })
    }

    const handleContentImagesChange = async (id: string, images: ContentImage[]) => {
        await updateContainer(id, { contentImages: images })
    }

    const handleCategoryNameChange = async (id: string, name: string) => {
        await updateCategory(id, { name })
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

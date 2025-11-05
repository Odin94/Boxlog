import { createFileRoute } from "@tanstack/react-router"
import { ContainerGrid } from "@/components/ContainerGrid"
import type { Container, Category, ContentImage } from "@/components/types"
import { useNavigate } from "@tanstack/react-router"
import { useContainers } from "@/contexts/ContainersContext"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
        deleteContainer,
        addCategory,
        updateCategory,
        deleteCategory,
        moveContainerToCategory,
        reorderContainers,
        moveCategoryUp,
        moveCategoryDown,
    } = useContainers()

    const [deleteContainerDialog, setDeleteContainerDialog] = useState<{
        open: boolean
        containerId: string | null
        containerName: string
    }>({
        open: false,
        containerId: null,
        containerName: "",
    })

    const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{ open: boolean; categoryId: string | null; categoryName: string }>({
        open: false,
        categoryId: null,
        categoryName: "",
    })

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

    const handleDeleteContainerClick = (containerId: string) => {
        const container = containers.find((c) => c.id === containerId)
        if (container) {
            setDeleteContainerDialog({
                open: true,
                containerId,
                containerName: container.name || "this container",
            })
        }
    }

    const handleDeleteContainerConfirm = async () => {
        if (deleteContainerDialog.containerId) {
            await deleteContainer(deleteContainerDialog.containerId)
            setDeleteContainerDialog({ open: false, containerId: null, containerName: "" })
        }
    }

    const handleDeleteCategoryClick = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId)
        if (category) {
            setDeleteCategoryDialog({
                open: true,
                categoryId,
                categoryName: category.name || "this category",
            })
        }
    }

    const handleDeleteCategoryConfirm = async () => {
        if (deleteCategoryDialog.categoryId) {
            await deleteCategory(deleteCategoryDialog.categoryId)
            setDeleteCategoryDialog({ open: false, categoryId: null, categoryName: "" })
        }
    }

    return (
        <>
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
                onDeleteContainer={handleDeleteContainerClick}
                onDeleteCategory={handleDeleteCategoryClick}
                onMoveContainerToCategory={moveContainerToCategory}
                onReorderContainers={reorderContainers}
                onMoveCategoryUp={moveCategoryUp}
                onMoveCategoryDown={moveCategoryDown}
            />

            {/* Delete Container Confirmation Dialog */}
            <Dialog open={deleteContainerDialog.open} onOpenChange={(open) => setDeleteContainerDialog({ ...deleteContainerDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Container</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteContainerDialog.containerName}"? This action cannot be undone and will
                            also delete all images in this container.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteContainerDialog({ ...deleteContainerDialog, open: false })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteContainerConfirm}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Category Confirmation Dialog */}
            <Dialog open={deleteCategoryDialog.open} onOpenChange={(open) => setDeleteCategoryDialog({ ...deleteCategoryDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteCategoryDialog.categoryName}"? This action cannot be undone. Containers
                            in this category will be moved to uncategorized.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteCategoryDialog({ ...deleteCategoryDialog, open: false })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCategoryConfirm}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

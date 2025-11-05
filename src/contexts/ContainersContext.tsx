import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { ReactNode } from "react"
import type { Container, Category } from "@/components/types"
import { useReadCategories, useWriteCategories } from "@/db/category_db"
import { useReadContainers, useWriteContainers } from "@/db/container_db"

type ContainersContextType = {
    containers: Container[]
    categories: Category[]
    isLoadingContainers: boolean
    isLoadingCategories: boolean
    setContainers: (containers: Container[]) => void
    setCategories: (categories: Category[]) => void
    addContainer: (container: Container) => Promise<void>
    updateContainer: (id: string, updates: Partial<Container>) => Promise<void>
    deleteContainer: (id: string) => Promise<void>
    addCategory: (category: Category) => Promise<void>
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
    moveContainerToCategory: (containerId: string, categoryId: string | undefined, newOrder?: number) => Promise<void>
    reorderContainers: (containerId: string, overContainerId: string) => Promise<void>
    moveCategoryUp: (categoryId: string) => Promise<void>
    moveCategoryDown: (categoryId: string) => Promise<void>
}

const ContainersContext = createContext<ContainersContextType | undefined>(undefined)

export function ContainersProvider({ children }: { children: ReactNode }) {
    const { categories: fetchedCategories, status: categoriesStatus } = useReadCategories()
    const { containers: fetchedContainers, status: containersStatus } = useReadContainers()
    const { upsertCategory, deleteCategory: deleteCategoryFromDb } = useWriteCategories()
    const { upsertContainer, deleteContainer: deleteContainerFromDb } = useWriteContainers()

    const [containers, setContainers] = useState<Container[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    // Sync fetched data from Supabase to local state
    useEffect(() => {
        if (categoriesStatus === "success") {
            setCategories(fetchedCategories)
        }
    }, [fetchedCategories, categoriesStatus])

    useEffect(() => {
        if (containersStatus === "success") {
            setContainers(fetchedContainers)
        }
    }, [fetchedContainers, containersStatus])

    const addContainer = useCallback(
        async (container: Container) => {
            const result = await upsertContainer(container)
            if (result.status === "success" && result.container) {
                setContainers((prev) => [...prev, result.container!])
            }
        },
        [upsertContainer]
    )

    const updateContainer = useCallback(
        async (id: string, updates: Partial<Container>) => {
            const existingContainer = containers.find((c) => c.id === id)
            if (!existingContainer) return

            const updatedContainer = { ...existingContainer, ...updates }
            const result = await upsertContainer(updatedContainer)

            if (result.status === "success" && result.container) {
                // Update local state (images are loaded separately from storage)
                setContainers((prev) =>
                    prev.map((c) => {
                        if (c.id === id) {
                            return { ...result.container!, ...updates }
                        }
                        return c
                    })
                )
            }
        },
        [containers, upsertContainer]
    )

    const deleteContainer = useCallback(
        async (id: string) => {
            const result = await deleteContainerFromDb(id)
            if (result.status === "success") {
                setContainers((prev) => prev.filter((c) => c.id !== id))
            }
        },
        [deleteContainerFromDb]
    )

    const addCategory = useCallback(
        async (category: Category) => {
            // If no order specified, assign it to the end
            if (category.order === undefined) {
                const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order ?? 0)) : -1
                category.order = maxOrder + 1
            }

            const result = await upsertCategory(category)
            if (result.status === "success" && result.category) {
                setCategories((prev) => [...prev, result.category!])
            }
        },
        [categories, upsertCategory]
    )

    const updateCategory = useCallback(
        async (id: string, updates: Partial<Category>) => {
            const existingCategory = categories.find((c) => c.id === id)
            if (!existingCategory) return

            const updatedCategory = { ...existingCategory, ...updates }
            const result = await upsertCategory(updatedCategory)

            if (result.status === "success" && result.category) {
                setCategories((prev) => prev.map((c) => (c.id === id ? result.category! : c)))
            }
        },
        [categories, upsertCategory]
    )

    const deleteCategory = useCallback(
        async (id: string) => {
            const result = await deleteCategoryFromDb(id)
            if (result.status === "success") {
                setCategories((prev) => prev.filter((c) => c.id !== id))
                // Move containers in this category to uncategorized
                const containersToUpdate = containers.filter((c) => c.categoryId === id)
                for (const container of containersToUpdate) {
                    if (container.id) {
                        await updateContainer(container.id, { categoryId: undefined })
                    }
                }
            }
        },
        [deleteCategoryFromDb, containers, updateContainer]
    )

    const moveCategoryUp = useCallback(
        async (categoryId: string) => {
            const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            const currentIndex = sortedCategories.findIndex((c) => c.id === categoryId)

            if (currentIndex <= 0) return // Already at top or not found

            const currentCategory = sortedCategories[currentIndex]
            const previousCategory = sortedCategories[currentIndex - 1]

            // Swap orders
            await updateCategory(currentCategory.id!, { order: currentIndex - 1 })
            await updateCategory(previousCategory.id!, { order: currentIndex })
        },
        [categories, updateCategory]
    )

    const moveCategoryDown = useCallback(
        async (categoryId: string) => {
            const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            const currentIndex = sortedCategories.findIndex((c) => c.id === categoryId)

            if (currentIndex < 0 || currentIndex >= sortedCategories.length - 1) return // Already at bottom or not found

            const currentCategory = sortedCategories[currentIndex]
            const nextCategory = sortedCategories[currentIndex + 1]

            // Swap orders
            await updateCategory(currentCategory.id!, { order: currentIndex + 1 })
            await updateCategory(nextCategory.id!, { order: currentIndex })
        },
        [categories, updateCategory]
    )

    const moveContainerToCategory = useCallback(
        async (containerId: string, categoryId: string | undefined, newOrder?: number) => {
            if (newOrder !== undefined) {
                await updateContainer(containerId, { categoryId, order: newOrder })
            } else {
                // When moving to a new category, set order to end of that category
                const containersInCategory = containers.filter((c) => c.categoryId === categoryId)
                const maxOrder = containersInCategory.length > 0 ? Math.max(...containersInCategory.map((c) => c.order ?? 0)) : -1
                await updateContainer(containerId, { categoryId, order: maxOrder + 1 })
            }
        },
        [containers, updateContainer]
    )

    const reorderContainers = useCallback(
        async (containerId: string, overContainerId: string) => {
            const draggedContainer = containers.find((c) => c.id === containerId)
            const overContainer = containers.find((c) => c.id === overContainerId)

            if (!draggedContainer || !overContainer) return

            // Only reorder if they're in the same category
            if (draggedContainer.categoryId !== overContainer.categoryId) {
                await moveContainerToCategory(containerId, overContainer.categoryId)
                return
            }

            const categoryId = draggedContainer.categoryId
            const containersInCategory = containers
                .filter((c) => c.categoryId === categoryId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

            const draggedIndex = containersInCategory.findIndex((c) => c.id === containerId)
            const overIndex = containersInCategory.findIndex((c) => c.id === overContainerId)

            if (draggedIndex === -1 || overIndex === -1 || draggedIndex === overIndex) return

            // Remove dragged container from array
            containersInCategory.splice(draggedIndex, 1)

            // Insert at new position
            const newIndex = draggedIndex < overIndex ? overIndex : overIndex + 1
            containersInCategory.splice(newIndex, 0, draggedContainer)

            // Update orders for all containers in the category
            for (let index = 0; index < containersInCategory.length; index++) {
                const container = containersInCategory[index]
                if (container.order !== index) {
                    if (container.id) {
                        await updateContainer(container.id, { order: index })
                    }
                }
            }
        },
        [containers, moveContainerToCategory, updateContainer]
    )

    return (
        <ContainersContext.Provider
            value={{
                containers,
                categories,
                // Show loading if status is "loading" OR if status is "idle" with no fetched data yet (hasn't started loading)
                isLoadingContainers: containersStatus === "loading" || (containersStatus === "idle" && fetchedContainers.length === 0),
                isLoadingCategories: categoriesStatus === "loading" || (categoriesStatus === "idle" && fetchedCategories.length === 0),
                setContainers,
                setCategories,
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
            }}
        >
            {children}
        </ContainersContext.Provider>
    )
}

export function useContainers() {
    const context = useContext(ContainersContext)
    if (context === undefined) {
        throw new Error("useContainers must be used within a ContainersProvider")
    }
    return context
}

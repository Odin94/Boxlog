import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { Container, Category } from "@/components/types"

type ContainersContextType = {
    containers: Container[]
    categories: Category[]
    setContainers: (containers: Container[]) => void
    setCategories: (categories: Category[]) => void
    addContainer: (container: Container) => void
    updateContainer: (id: string, updates: Partial<Container>) => void
    addCategory: (category: Category) => void
    updateCategory: (id: string, updates: Partial<Category>) => void
    deleteCategory: (id: string) => void
    moveContainerToCategory: (containerId: string, categoryId: string | undefined, newOrder?: number) => void
    reorderContainers: (containerId: string, overContainerId: string) => void
    moveCategoryUp: (categoryId: string) => void
    moveCategoryDown: (categoryId: string) => void
}

const ContainersContext = createContext<ContainersContextType | undefined>(undefined)

export function ContainersProvider({ children }: { children: ReactNode }) {
    const [containers, setContainers] = useState<Container[]>(() => {
        const stored = localStorage.getItem("boxlog-containers")
        return stored ? JSON.parse(stored) : []
    })

    const [categories, setCategories] = useState<Category[]>(() => {
        const stored = localStorage.getItem("boxlog-categories")
        return stored ? JSON.parse(stored) : []
    })

    useEffect(() => {
        localStorage.setItem("boxlog-containers", JSON.stringify(containers))
    }, [containers])

    useEffect(() => {
        localStorage.setItem("boxlog-categories", JSON.stringify(categories))
    }, [categories])

    const addContainer = (container: Container) => {
        // If no order specified, assign it to the end of its category
        if (container.order === undefined) {
            const containersInCategory = containers.filter((c) => c.categoryId === container.categoryId)
            const maxOrder = containersInCategory.length > 0 ? Math.max(...containersInCategory.map((c) => c.order ?? 0)) : -1
            container.order = maxOrder + 1
        }
        setContainers((prev) => [...prev, container])
    }

    const updateContainer = (id: string, updates: Partial<Container>) => {
        setContainers((prev) => prev.map((container) => (container.id === id ? { ...container, ...updates } : container)))
    }

    const addCategory = (category: Category) => {
        // If no order specified, assign it to the end
        if (category.order === undefined) {
            const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order ?? 0)) : -1
            category.order = maxOrder + 1
        }
        setCategories((prev) => [...prev, category])
    }

    const moveCategoryUp = (categoryId: string) => {
        setCategories((prev) => {
            const sortedCategories = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            const currentIndex = sortedCategories.findIndex((c) => c.id === categoryId)

            if (currentIndex <= 0) return prev // Already at top or not found

            // Swap positions
            const currentCategory = sortedCategories[currentIndex]
            const previousCategory = sortedCategories[currentIndex - 1]

            // Remove both from array
            sortedCategories.splice(currentIndex - 1, 2)

            // Insert in swapped order
            sortedCategories.splice(currentIndex - 1, 0, currentCategory, previousCategory)

            // Reassign orders sequentially
            return sortedCategories.map((category, index) => ({
                ...category,
                order: index,
            }))
        })
    }

    const moveCategoryDown = (categoryId: string) => {
        setCategories((prev) => {
            const sortedCategories = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            const currentIndex = sortedCategories.findIndex((c) => c.id === categoryId)

            if (currentIndex < 0 || currentIndex >= sortedCategories.length - 1) return prev // Already at bottom or not found

            // Swap positions
            const currentCategory = sortedCategories[currentIndex]
            const nextCategory = sortedCategories[currentIndex + 1]

            // Remove both from array
            sortedCategories.splice(currentIndex, 2)

            // Insert in swapped order
            sortedCategories.splice(currentIndex, 0, nextCategory, currentCategory)

            // Reassign orders sequentially
            return sortedCategories.map((category, index) => ({
                ...category,
                order: index,
            }))
        })
    }

    const updateCategory = (id: string, updates: Partial<Category>) => {
        setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updates } : category)))
    }

    const deleteCategory = (id: string) => {
        setCategories((prev) => prev.filter((category) => category.id !== id))
        // Move containers in this category to uncategorized
        setContainers((prev) =>
            prev.map((container) => (container.categoryId === id ? { ...container, categoryId: undefined } : container))
        )
    }

    const moveContainerToCategory = (containerId: string, categoryId: string | undefined, newOrder?: number) => {
        if (newOrder !== undefined) {
            updateContainer(containerId, { categoryId, order: newOrder })
        } else {
            // When moving to a new category, set order to end of that category
            const containersInCategory = containers.filter((c) => c.categoryId === categoryId)
            const maxOrder = containersInCategory.length > 0 ? Math.max(...containersInCategory.map((c) => c.order ?? 0)) : -1
            updateContainer(containerId, { categoryId, order: maxOrder + 1 })
        }
    }

    const reorderContainers = (containerId: string, overContainerId: string) => {
        const draggedContainer = containers.find((c) => c.id === containerId)
        const overContainer = containers.find((c) => c.id === overContainerId)

        if (!draggedContainer || !overContainer) return

        // Only reorder if they're in the same category
        if (draggedContainer.categoryId !== overContainer.categoryId) {
            moveContainerToCategory(containerId, overContainer.categoryId)
            return
        }

        const categoryId = draggedContainer.categoryId
        const containersInCategory = containers.filter((c) => c.categoryId === categoryId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

        const draggedIndex = containersInCategory.findIndex((c) => c.id === containerId)
        const overIndex = containersInCategory.findIndex((c) => c.id === overContainerId)

        if (draggedIndex === -1 || overIndex === -1 || draggedIndex === overIndex) return

        // Remove dragged container from array
        containersInCategory.splice(draggedIndex, 1)

        // Insert at new position
        const newIndex = draggedIndex < overIndex ? overIndex : overIndex + 1
        containersInCategory.splice(newIndex, 0, draggedContainer)

        // Update orders for all containers in the category
        containersInCategory.forEach((container, index) => {
            if (container.order !== index) {
                updateContainer(container.id, { order: index })
            }
        })
    }

    return (
        <ContainersContext.Provider
            value={{
                containers,
                categories,
                setContainers,
                setCategories,
                addContainer,
                updateContainer,
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

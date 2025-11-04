import { createFileRoute } from '@tanstack/react-router'
import { ContainerGrid } from '@/components/ContainerGrid'
import type { Container, Category } from '@/components/types'
import { useNavigate } from '@tanstack/react-router'
import { useContainers } from '@/contexts/ContainersContext'

export const Route = createFileRoute('/')({
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

  const handleCreateContainer = () => {
    const newContainer: Container = {
      id: Date.now().toString(),
      name: 'New Container',
      contentImages: [],
    }
    addContainer(newContainer)
  }

  const handleCreateCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: 'New Category',
    }
    addCategory(newCategory)
  }

  const handleNameChange = (id: string, name: string) => {
    updateContainer(id, { name })
  }

  const handleCoverImageChange = (id: string, image: string) => {
    updateContainer(id, { coverImage: image })
  }

  const handleContentImagesChange = (id: string, images: string[]) => {
    updateContainer(id, { contentImages: images })
  }

  const handleCategoryNameChange = (id: string, name: string) => {
    updateCategory(id, { name })
  }

  const handleContainerClick = (container: Container) => {
    navigate({ to: '/boxes/$id', params: { id: container.id } })
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

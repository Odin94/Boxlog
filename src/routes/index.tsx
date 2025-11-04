import { createFileRoute } from '@tanstack/react-router'
import { ContainerGrid } from '@/components/ContainerGrid'
import type { Container } from '@/components/types'
import { useNavigate } from '@tanstack/react-router'
import { useContainers } from '@/contexts/ContainersContext'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const navigate = useNavigate()
  const { containers, addContainer, updateContainer } = useContainers()

  const handleCreateContainer = () => {
    const newContainer: Container = {
      id: Date.now().toString(),
      name: 'New Container',
      contentImages: [],
    }
    addContainer(newContainer)
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

  const handleContainerClick = (container: Container) => {
    navigate({ to: '/boxes/$id', params: { id: container.id } })
  }

  return (
    <ContainerGrid
      containers={containers}
      onContainerClick={handleContainerClick}
      onCreateContainer={handleCreateContainer}
      onNameChange={handleNameChange}
      onCoverImageChange={handleCoverImageChange}
      onContentImagesChange={handleContentImagesChange}
    />
  )
}

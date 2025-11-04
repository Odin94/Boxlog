import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ContainerDetail } from '@/components/ContainerDetail'
import { useContainers } from '@/contexts/ContainersContext'

export const Route = createFileRoute('/boxes/$id')({
  component: BoxDetailComponent,
})

function BoxDetailComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { containers, updateContainer } = useContainers()

  const container = containers.find((c) => c.id === id)

  const handleNameChange = (containerId: string, name: string) => {
    updateContainer(containerId, { name })
  }

  const handleContentImagesChange = (containerId: string, images: string[]) => {
    updateContainer(containerId, { contentImages: images })
  }

  const handleBack = () => {
    navigate({ to: '/' })
  }

  if (!container) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <button onClick={handleBack} className="mb-4">
          ← Back to containers
        </button>
        <p>Container not found</p>
      </div>
    )
  }

  return (
    <ContainerDetail
      container={container}
      onBack={handleBack}
      onNameChange={handleNameChange}
      onContentImagesChange={handleContentImagesChange}
    />
  )
}

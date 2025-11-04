import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Container } from '@/components/types'

interface ContainersContextType {
  containers: Container[]
  setContainers: (containers: Container[]) => void
  addContainer: (container: Container) => void
  updateContainer: (id: string, updates: Partial<Container>) => void
}

const ContainersContext = createContext<ContainersContextType | undefined>(undefined)

export function ContainersProvider({ children }: { children: ReactNode }) {
  const [containers, setContainers] = useState<Container[]>(() => {
    const stored = localStorage.getItem('boxlog-containers')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('boxlog-containers', JSON.stringify(containers))
  }, [containers])

  const addContainer = (container: Container) => {
    setContainers((prev) => [...prev, container])
  }

  const updateContainer = (id: string, updates: Partial<Container>) => {
    setContainers((prev) =>
      prev.map((container) => (container.id === id ? { ...container, ...updates } : container))
    )
  }

  return (
    <ContainersContext.Provider value={{ containers, setContainers, addContainer, updateContainer }}>
      {children}
    </ContainersContext.Provider>
  )
}

export function useContainers() {
  const context = useContext(ContainersContext)
  if (context === undefined) {
    throw new Error('useContainers must be used within a ContainersProvider')
  }
  return context
}


import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DndContext, closestCenter } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ImagePlus, X, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"
import type { Container, ContentImage, Category } from "@/components/types"

type ContainerDetailProps = {
    container: Container
    categories: Category[]
    onBack: () => void
    onNameChange: (id: string, name: string) => void
    onContentImagesChange: (id: string, images: ContentImage[]) => void
}

export function ContainerDetail({ container, categories, onBack, onNameChange, onContentImagesChange }: ContainerDetailProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(container.name)
    const [isDragging, setIsDragging] = useState(false)
    const [imagesToRemove, setImagesToRemove] = useState<Set<string>>(new Set())
    const [lightboxImageId, setLightboxImageId] = useState<string | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)

    // Sync nameValue when container.name changes externally
    useEffect(() => {
        if (!isEditingName) {
            setNameValue(container.name)
        }
    }, [container.name, isEditingName])

    const processFiles = (files: File[]) => {
        if (files.length > 0) {
            const imageFiles = files.filter((file) => file.type.startsWith("image/"))
            if (imageFiles.length === 0) return

            const readers = imageFiles.map((file) => {
                return new Promise<{ id: string; url: string }>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const url = event.target?.result as string
                        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
                        resolve({ id, url })
                    }
                    reader.readAsDataURL(file)
                })
            })

            Promise.all(readers).then((images) => {
                onContentImagesChange(container.id, [...container.contentImages, ...images])
            })
        }
    }

    const handleContentImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        processFiles(files)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        processFiles(files)
    }

    const handleRemoveImage = (index: number) => {
        const imageToRemove = container.contentImages[index]
        // Mark image for removal - this will trigger AnimatePresence exit animation
        setImagesToRemove((prev) => new Set(prev).add(imageToRemove.id))

        // After animation completes, actually remove from array
        setTimeout(() => {
            const newImages = container.contentImages.filter((img) => img.id !== imageToRemove.id)
            onContentImagesChange(container.id, newImages)
            setImagesToRemove((prev) => {
                const next = new Set(prev)
                next.delete(imageToRemove.id)
                return next
            })
        }, 300) // Match animation duration
    }

    const handleNameSubmit = () => {
        onNameChange(container.id, nameValue)
        setIsEditingName(false)
    }

    const handleReorderImages = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragId(null)

        if (!over || active.id === over.id) return

        const visibleImages = container.contentImages.filter((img) => !imagesToRemove.has(img.id))
        const oldIndex = visibleImages.findIndex((img) => img.id === active.id)
        const newIndex = visibleImages.findIndex((img) => img.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const reorderedImages = [...visibleImages]
        const [movedImage] = reorderedImages.splice(oldIndex, 1)
        reorderedImages.splice(newIndex, 0, movedImage)

        // Reconstruct the full array in the new order
        const allImages = [...container.contentImages]
        const finalOrder = reorderedImages.map((img) => {
            return allImages.find((orig) => orig.id === img.id)!
        })

        onContentImagesChange(container.id, finalOrder)
    }

    const openLightbox = (imageId: string) => {
        setLightboxImageId(imageId)
    }

    const closeLightbox = () => {
        setLightboxImageId(null)
    }

    const nextImage = () => {
        if (lightboxImageId !== null) {
            const visibleImages = container.contentImages.filter((img) => !imagesToRemove.has(img.id))
            const currentIndex = visibleImages.findIndex((img) => img.id === lightboxImageId)
            if (currentIndex !== -1) {
                const nextIndex = (currentIndex + 1) % visibleImages.length
                setLightboxImageId(visibleImages[nextIndex].id)
            }
        }
    }

    const previousImage = () => {
        if (lightboxImageId !== null) {
            const visibleImages = container.contentImages.filter((img) => !imagesToRemove.has(img.id))
            const currentIndex = visibleImages.findIndex((img) => img.id === lightboxImageId)
            if (currentIndex !== -1) {
                const prevIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length
                setLightboxImageId(visibleImages[prevIndex].id)
            }
        }
    }

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (lightboxImageId === null) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeLightbox()
            } else if (e.key === "ArrowRight") {
                nextImage()
            } else if (e.key === "ArrowLeft") {
                previousImage()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [lightboxImageId, container.contentImages, imagesToRemove])

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to containers
                </Button>
                {container.categoryId &&
                    (() => {
                        const category = categories.find((c) => c.id === container.categoryId)
                        return category ? <p className="text-sm text-muted-foreground mb-1">{category.name}</p> : null
                    })()}
                {isEditingName ? (
                    <div className="flex gap-2 items-center">
                        <Input
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleNameSubmit()
                                } else if (e.key === "Escape") {
                                    setNameValue(container.name)
                                    setIsEditingName(false)
                                }
                            }}
                            autoFocus
                            className="text-2xl font-bold h-auto py-2"
                        />
                    </div>
                ) : (
                    <h1
                        className="text-3xl font-bold mb-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setIsEditingName(true)}
                    >
                        {container.name || "Unnamed Container"}
                    </h1>
                )}
            </div>

            <div className="mb-6">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                    <ImagePlus className="h-4 w-4" />
                    Add Content Photos
                    <input type="file" accept="image/*" multiple onChange={handleContentImagesUpload} className="hidden" />
                </label>
            </div>

            {(container.contentImages.length > 0 || imagesToRemove.size > 0) && (
                <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={(e) => setActiveDragId(e.active.id as string)}
                    onDragEnd={handleReorderImages}
                >
                    <SortableContext
                        items={container.contentImages.filter((img) => !imagesToRemove.has(img.id)).map((img) => img.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <AnimatePresence>
                                {container.contentImages
                                    .map((image, index) => ({ image, index }))
                                    .filter(({ image }) => !imagesToRemove.has(image.id))
                                    .map(({ image, index }) => (
                                        <SortableImageItem
                                            key={image.id}
                                            image={image}
                                            index={index}
                                            isDragging={activeDragId === image.id}
                                            onOpenLightbox={() => openLightbox(image.id)}
                                            onRemove={() => handleRemoveImage(index)}
                                        />
                                    ))}
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>
            )}
            <div
                className={`text-center py-12 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <ImagePlus
                    className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                />
                <p className={isDragging ? "text-primary font-medium" : "text-muted-foreground"}>
                    {isDragging
                        ? "Drop photos here"
                        : container.contentImages.length === 0
                          ? "No content photos yet. Add some photos to see what's inside!"
                          : "Drag & drop photos here to add more"}
                </p>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImageId !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(() => {
                                const visibleImages = container.contentImages.filter((img) => !imagesToRemove.has(img.id))
                                const currentImage = visibleImages.find((img) => img.id === lightboxImageId)
                                if (!currentImage) return null

                                const currentIndex = visibleImages.findIndex((img) => img.id === lightboxImageId)

                                return (
                                    <>
                                        <img
                                            src={currentImage.url}
                                            alt={`Content ${currentIndex + 1}`}
                                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-4 right-4 bg-background/50 hover:bg-background/80"
                                            onClick={closeLightbox}
                                        >
                                            <X className="h-6 w-6" />
                                        </Button>
                                        {visibleImages.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                                                    onClick={previousImage}
                                                >
                                                    <ChevronLeft className="h-8 w-8" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                                                    onClick={nextImage}
                                                >
                                                    <ChevronRight className="h-8 w-8" />
                                                </Button>
                                            </>
                                        )}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/50 px-4 py-2 rounded-md text-sm">
                                            {currentIndex + 1} / {visibleImages.length}
                                        </div>
                                    </>
                                )
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

type SortableImageItemProps = {
    image: ContentImage
    index: number
    isDragging: boolean
    onOpenLightbox: () => void
    onRemove: () => void
}

function SortableImageItem({ image, index, isDragging, onOpenLightbox, onRemove }: SortableImageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: image.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
                opacity: 0,
                scale: 0.8,
                x: -100,
                rotate: -10,
                transition: { duration: 0.3, ease: "easeInOut" },
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                layout: { duration: 0.3 },
            }}
            className="relative group"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 bg-background/80 hover:bg-background rounded-full p-1.5 cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <img
                src={image.url}
                alt={`Content ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg cursor-pointer"
                onClick={onOpenLightbox}
            />
            <motion.button
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="h-4 w-4" />
            </motion.button>
        </motion.div>
    )
}

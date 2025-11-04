import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ImagePlus, X } from "lucide-react"
import type { Container, ContentImage } from "@/components/types"

type ContainerDetailProps = {
    container: Container
    onBack: () => void
    onNameChange: (id: string, name: string) => void
    onContentImagesChange: (id: string, images: ContentImage[]) => void
}

export function ContainerDetail({ container, onBack, onNameChange, onContentImagesChange }: ContainerDetailProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(container.name)
    const [isDragging, setIsDragging] = useState(false)
    const [imagesToRemove, setImagesToRemove] = useState<Set<string>>(new Set())

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

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to containers
                </Button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <AnimatePresence>
                        {container.contentImages
                            .map((image, index) => ({ image, index }))
                            .filter(({ image }) => !imagesToRemove.has(image.id))
                            .map(({ image, index }) => (
                                <motion.div
                                    key={image.id}
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
                                    <img src={image.url} alt={`Content ${index + 1}`} className="w-full h-64 object-cover rounded-lg" />
                                    <motion.button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
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
        </div>
    )
}

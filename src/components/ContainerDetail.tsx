import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ImagePlus, X } from "lucide-react"
import type { Container } from "@/components/types"

type ContainerDetailProps = {
    container: Container
    onBack: () => void
    onNameChange: (id: string, name: string) => void
    onContentImagesChange: (id: string, images: string[]) => void
}

export function ContainerDetail({ container, onBack, onNameChange, onContentImagesChange }: ContainerDetailProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(container.name)

    // Sync nameValue when container.name changes externally
    useEffect(() => {
        if (!isEditingName) {
            setNameValue(container.name)
        }
    }, [container.name, isEditingName])

    const handleContentImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const readers = files.map((file) => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        resolve(event.target?.result as string)
                    }
                    reader.readAsDataURL(file)
                })
            })

            Promise.all(readers).then((images) => {
                onContentImagesChange(container.id, [...container.contentImages, ...images])
            })
        }
    }

    const handleRemoveImage = (index: number) => {
        const newImages = container.contentImages.filter((_, i) => i !== index)
        onContentImagesChange(container.id, newImages)
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

            {container.contentImages.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No content photos yet. Add some photos to see what's inside!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {container.contentImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <img src={image} alt={`Content ${index + 1}`} className="w-full h-64 object-cover rounded-lg" />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

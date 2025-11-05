import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Edit2, Image as ImageIcon, Trash2 } from "lucide-react"

import type { ContentImage } from "./types"

type ContainerCardProps = {
    container: {
        id: string
        name: string
        coverImage?: string
        contentImages: ContentImage[]
    }
    onNameChange: (id: string, name: string) => void
    onCoverImageChange: (id: string, image: string) => void
    onContentImagesChange: (id: string, images: ContentImage[]) => void
    onDeleteContainer?: (id: string) => void
    onClick: () => void
}

export function ContainerCard({
    container,
    onNameChange,
    onCoverImageChange,
    onContentImagesChange,
    onDeleteContainer,
    onClick,
}: ContainerCardProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(container.name)

    // Sync nameValue when container.name changes externally
    useEffect(() => {
        if (!isEditingName) {
            setNameValue(container.name)
        }
    }, [container.name, isEditingName])

    const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const result = event.target?.result as string
                onCoverImageChange(container.id, result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleContentImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const readers = files.map((file) => {
                return new Promise<ContentImage>((resolve) => {
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

    const handleNameSubmit = () => {
        onNameChange(container.id, nameValue)
        setIsEditingName(false)
    }

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
            <CardHeader className="pb-3">
                {isEditingName ? (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="h-8"
                        />
                    </div>
                ) : (
                    <CardTitle className="flex items-center justify-between text-lg">
                        <span>{container.name || "Unnamed Container"}</span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsEditingName(true)
                                }}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            {onDeleteContainer && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteContainer(container.id)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    {container.coverImage ? (
                        <img
                            src={container.coverImage}
                            alt={container.name}
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                                const img = e.target as HTMLImageElement
                                img.style.opacity = "1"
                            }}
                            onError={(e) => {
                                const img = e.target as HTMLImageElement
                                img.style.display = "none"
                            }}
                            style={{ opacity: 0, transition: "opacity 0.2s" }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Camera className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                    <label
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            className="hidden"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Camera className="h-8 w-8 text-white" />
                    </label>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>
                        {container.contentImages.length} content photo{container.contentImages.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

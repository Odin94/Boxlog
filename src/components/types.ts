export type ContentImage = {
    id: string
    url: string
    description?: string
}

export type Container = {
    id?: string
    name: string
    coverImage?: string
    contentImages: ContentImage[]
    categoryId?: string
    order?: number
}

export type Category = {
    id?: string
    name: string
    order?: number
}

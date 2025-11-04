export type Container = {
    id: string
    name: string
    coverImage?: string
    contentImages: string[]
    categoryId?: string
    order?: number
}

export type Category = {
    id: string
    name: string
    order?: number
}

import { z } from "zod"

const configSchema = z.object({
    CLERK_PUBLISHABLE_KEY: z.string().min(1, "VITE_CLERK_PUBLISHABLE_KEY is required and must be a non-empty string"),
    SUPABASE_URL: z.string().min(1, "VITE_CLERK_PUBLISHABLE_KEY is required and must be a non-empty string"),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "VITE_CLERK_PUBLISHABLE_KEY is required and must be a non-empty string"),
})

type Config = z.infer<typeof configSchema>

let cachedConfig: Config | null = null

export function getConfig(): Config {
    if (cachedConfig) {
        return cachedConfig
    }

    const env = configSchema.parse({
        CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    })

    cachedConfig = env

    return cachedConfig
}

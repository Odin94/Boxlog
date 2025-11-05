import { createClient } from "@supabase/supabase-js"
import { getConfig } from "@/lib/config"
import { useSession } from "@clerk/clerk-react"
import { useMemo } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"

export type Status = "idle" | "loading" | "success" | "error"

export const useSupabaseClient = (): SupabaseClient | null => {
    const { session } = useSession()
    const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getConfig()

    return useMemo(() => {
        return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            async accessToken() {
                return (await session?.getToken()) ?? null
            },
        })
    }, [SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, session])
}

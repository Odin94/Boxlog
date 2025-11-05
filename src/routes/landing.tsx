import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { useEffect } from "react"

export const Route = createFileRoute("/landing")({
    component: LandingComponent,
})

function LandingComponent() {
    const navigate = useNavigate()
    const { isSignedIn, isLoaded } = useAuth()

    // Redirect to dashboard if already signed in
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            navigate({ to: "/" })
        }
    }, [isLoaded, isSignedIn, navigate])

    // Show loading while checking auth
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
            <div className="max-w-2xl w-full text-center space-y-8">
                <div className="flex justify-center items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-[1.2] pb-2">
                        BoxLog
                    </h1>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-semibold">Organize Your Life, One Box at a Time</h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Keep track of what's in your boxes with photos, categories, and smart organization. Never lose track of your
                        belongings again.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <div className="text-3xl mb-3">📸</div>
                        <h3 className="font-semibold mb-2">Photo Organization</h3>
                        <p className="text-sm text-muted-foreground">
                            Take photos of your boxes and their contents for easy visual reference
                        </p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <div className="text-3xl mb-3">📁</div>
                        <h3 className="font-semibold mb-2">Smart Categories</h3>
                        <p className="text-sm text-muted-foreground">Organize your boxes into categories for quick access</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <div className="text-3xl mb-3">🔍</div>
                        <h3 className="font-semibold mb-2">Easy Search</h3>
                        <p className="text-sm text-muted-foreground">Quickly find what you're looking for with our intuitive interface</p>
                    </div>
                </div>

                <SignedOut>
                    <div className="mt-12 space-y-4">
                        <SignInButton mode="modal">
                            <Button size="lg" className="text-lg px-8 py-6">
                                Get Started
                            </Button>
                        </SignInButton>
                        <p className="text-sm text-muted-foreground">Sign in to start organizing your boxes</p>
                    </div>
                </SignedOut>

                <SignedIn>
                    <div className="mt-12 space-y-4">
                        <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate({ to: "/" })}>
                            Go to Dashboard
                        </Button>
                    </div>
                </SignedIn>
            </div>
        </div>
    )
}

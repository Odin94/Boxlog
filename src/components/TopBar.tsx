import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

export function TopBar() {
    return (
        <header className="w-full border-b bg-white shadow-sm">
            <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
                <SignedIn>
                    <nav className="flex items-center gap-2">
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                <img src="/boxicons-package.svg" alt="BoxLog" className="w-4 h-4 mr-2" />
                                Containers
                            </Button>
                        </Link>
                        <Link to="/visual-inventory">
                            <Button variant="ghost" size="sm">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Visual Inventory
                            </Button>
                        </Link>
                    </nav>
                </SignedIn>
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </header>
    )
}

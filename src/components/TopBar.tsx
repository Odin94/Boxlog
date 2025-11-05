import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"

export function TopBar() {
    return (
        <header className="w-full border-b bg-white shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-end px-4">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </header>
    )
}

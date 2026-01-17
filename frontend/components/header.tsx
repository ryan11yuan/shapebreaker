import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          {/* Add logo */}
          <span className="font-[family-name:var(--font-display)] text-3xl tracking-wider text-foreground transition-colors group-hover:text-primary">
            SHAPE BREAKER
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden text-foreground hover:text-primary transition-colors md:inline-flex">
            <Link href="#">Log in</Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105">
            <Link href="#upload">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

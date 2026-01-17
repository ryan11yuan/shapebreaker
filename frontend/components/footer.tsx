import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-foreground mb-2">
              SHAPE BREAKER
            </h3>
            <p className="text-sm text-muted-foreground">
              AI-powered tactical analysis
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <Link href="#" className="text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-y-[-2px]">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-y-[-2px]">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-y-[-2px]">
              Support
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground tracking-wider">
            © 2026 Shape Breaker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

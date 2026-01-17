import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ErrorState({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-up">
      <div className="rounded-full bg-destructive/10 p-6 ring-4 ring-destructive/5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-16 w-16 text-destructive"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-editorial-md font-[family-name:var(--font-display)] font-bold text-foreground">
        Processing Failed
      </h2>
      <p className="text-body-editorial text-muted-foreground">{error || "An unknown error occurred"}</p>
      <Link href="/">
        <Button size="lg" className="transition-all duration-300 hover:scale-105">Try Again</Button>
      </Link>
    </div>
  )
}

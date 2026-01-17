import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  taskId: string | null
}

export function ActionButtons({ taskId }: ActionButtonsProps) {
  return (
    <div className="flex justify-center animate-fade-in-up animation-delay-800">
      <Link href="/">
        <Button 
          size="lg" 
          className="group relative px-12 py-6 text-lg font-[family-name:var(--font-display)] font-bold tracking-wide transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 bg-gradient-to-r from-primary to-primary/80"
        >
          <span className="relative z-10 flex items-center gap-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analyze Another Match
          </span>
          <div className="absolute inset-0 -z-1 rounded-lg bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 blur-xl transition-opacity duration-200 group-hover:opacity-100"></div>
        </Button>
      </Link>
    </div>
  )
}

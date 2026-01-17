export function LoadingState({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-up">
      <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
      <h2 className="text-editorial-md font-[family-name:var(--font-display)] font-bold text-foreground">
        {status === "queued" ? "Queued for processing..." : "Analyzing your match..."}
      </h2>
      <p className="text-body-editorial text-muted-foreground">This may take a few minutes</p>
    </div>
  )
}

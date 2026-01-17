export function FormationImage({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="w-full max-w-5xl mx-auto animate-scale-in animation-delay-200">
      <img
        src={imageUrl}
        alt="Formation Comparison Start"
        className="w-full rounded-2xl border-2 border-border/40 shadow-2xl shadow-primary/10 transition-all duration-300 hover:shadow-primary/20"
      />
    </div>
  )
}

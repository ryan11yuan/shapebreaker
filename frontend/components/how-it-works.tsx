export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Video",
      description: "Select a 30-second clip of match footage from your device.",
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our system analyzes player positions and identifies team formations.",
    },
    {
      number: "03",
      title: "Get Results",
      description: "Download tactical diagrams and detailed formation breakdown.",
    },
  ]

  return (
    <section id="how-it-works" className="border-b border-border/40 bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            How It Works
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Three simple steps to unlock tactical insights.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-4">
                <span className="text-5xl font-bold text-primary/30">{step.number}</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-foreground">{step.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

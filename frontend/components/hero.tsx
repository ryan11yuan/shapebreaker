"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function Hero() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const router = useRouter()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight))
      setScrollProgress(progress)
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile)
    }
  }

  const handleAnalyzeMatch = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("video", file)

      const response = await fetch("http://localhost:8000/upload-video", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      
      // Redirect to results page with task ID
      router.push(`/results?taskId=${data.task_id}`)
    } catch (error) {
      console.error("Error uploading video:", error)
      alert("Failed to upload video. Please try again.")
      setIsUploading(false)
    }
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Gradient Orbs with Parallax */}
        <div 
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" 
          style={{ 
            animation: 'shimmer 8s ease-in-out infinite',
            transform: `translateY(${scrollProgress * 100}px)`
          }}
        />
        <div 
          className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[100px]"
          style={{ 
            animation: 'shimmer 6s ease-in-out infinite 2s',
            transform: `translateY(${scrollProgress * -80}px)`
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animation: `float ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              transform: `translateY(${scrollProgress * (50 + i * 20)}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
        ))}
      </div>

      {/* Opening Statement - Full Screen */}
      <div className="relative min-h-screen flex items-center justify-center border-b border-border/40 px-4 py-32">
        {/* Radial Glow */}
        <div 
          className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"
          style={{ 
            opacity: scrollProgress < 0.1 ? 1 - scrollProgress * 10 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
        />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div 
              className="mb-8 inline-flex opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <span className="relative text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Where Champions Are Made
                </span>
              </div>
            </div>
            
            <h1 
              className="mb-12 text-editorial-xl font-[family-name:var(--font-display)] font-bold text-foreground leading-[0.9] opacity-0 animate-fade-in-up"
              style={{ 
                animationDelay: '0.4s', 
                animationFillMode: 'forwards',
                textShadow: '0 0 40px rgba(0,0,0,0.1)'
              }}
            >
              Expose weakness.
              <br />
              Exploit space.
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 blur-2xl opacity-30" />
                <span className="relative text-primary">Dominate.</span>
              </span>
            </h1>

            <p 
              className="mb-16 max-w-3xl mx-auto text-body-lg text-muted-foreground opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
            >
              Every match tells a story. Every formation reveals intent. 
              <br />
              Our AI decodes the narrative your opponents don't want you to see.
            </p>

            <div 
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
            >
              <div className="inline-flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
                  <div className="relative h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Scroll to discover
                </p>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                  <svg 
                    className="relative h-6 w-6 text-primary animate-bounce" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Story Section 1 - The Problem */}
      <div className="relative min-h-[80vh] flex items-center border-b border-border/40 px-4 py-24 overflow-hidden">
        {/* Section Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent"
          style={{ 
            opacity: scrollProgress > 0.15 && scrollProgress < 0.4 ? 1 : 0,
            transition: 'opacity 1s ease-out'
          }}
        />
        
        {/* Decorative Line */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
          style={{
            opacity: scrollProgress > 0.15 ? 1 : 0,
            transform: `scaleY(${Math.min(1, (scrollProgress - 0.15) * 3)})`,
            transformOrigin: 'top',
            transition: 'all 1s ease-out'
          }}
        />
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div 
              className="transition-all duration-1000 ease-out"
              style={{ 
                opacity: scrollProgress > 0.15 ? 1 : 0,
                transform: `translateX(${scrollProgress > 0.15 ? '0' : '-60px'}) translateY(${scrollProgress > 0.15 ? '0' : '20px'})`,
                filter: `blur(${scrollProgress > 0.15 ? '0px' : '10px'})`
              }}
            >
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-full" />
                <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  The Challenge
                </p>
              </div>
              <h2 className="mb-8 text-editorial-md font-[family-name:var(--font-display)] font-bold text-foreground">
                Most teams are playing blind
              </h2>
              
              <div className="space-y-6">
                <p className="text-body-editorial text-muted-foreground leading-relaxed relative pl-6">
                  <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-primary" />
                  Hours of footage. Countless replays. But you're still guessing at formations, 
                  missing tactical shifts, and overlooking the patterns that separate winners from the rest.
                </p>
                <p className="text-body-editorial text-muted-foreground leading-relaxed relative pl-6">
                  <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-primary" />
                  Traditional analysis is too slow. Too subjective. Too late.
                </p>
              </div>
            </div>

            <div 
              className="relative transition-all duration-1000 ease-out delay-200"
              style={{ 
                opacity: scrollProgress > 0.15 ? 1 : 0,
                transform: `translateX(${scrollProgress > 0.15 ? '0' : '60px'}) translateY(${scrollProgress > 0.15 ? '0' : '20px'}) scale(${scrollProgress > 0.15 ? '1' : '0.95'})`,
                filter: `blur(${scrollProgress > 0.15 ? '0px' : '10px'})`
              }}
            >
              <div className="relative aspect-[4/3] rounded-3xl border-2 border-border/60 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/50 p-8 shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Glow Inside Card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
                
                {/* Soccer field */}
                <div className="absolute inset-8 rounded-2xl border-2 border-primary/20 overflow-hidden">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0" />
                  <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/20" />
                  
                  {/* Corner Arcs */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/10 rounded-tl-full" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/10 rounded-tr-full" />
                </div>
                
                <div className="relative h-full">
                  {[
                    { top: "50%", left: "80%", isGoalkeeper: false, delay: 0 },
                    { top: "25%", left: "75%", isGoalkeeper: false, delay: 100 },
                    { top: "75%", left: "75%", isGoalkeeper: false, delay: 200 },
                    { top: "50%", left: "57%", isGoalkeeper: false, delay: 300 },
                    { top: "35%", left: "52%", isGoalkeeper: false, delay: 400 },
                    { top: "65%", left: "52%", isGoalkeeper: false, delay: 500 },
                    { top: "20%", left: "36%", isGoalkeeper: false, delay: 600 },
                    { top: "40%", left: "30%", isGoalkeeper: false, delay: 700 },
                    { top: "60%", left: "30%", isGoalkeeper: false, delay: 800 },
                    { top: "80%", left: "36%", isGoalkeeper: false, delay: 900 },
                    { top: "50%", left: "12%", isGoalkeeper: true, delay: 1000 },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ${
                        pos.isGoalkeeper
                          ? "border-2 border-foreground/70 bg-transparent ring-2 ring-primary/20"
                          : "bg-primary shadow-lg shadow-primary/50"
                      }`}
                      style={{ 
                        top: pos.top, 
                        left: pos.left,
                        opacity: scrollProgress > 0.18 ? 1 : 0,
                        transform: `translate(-50%, -50%) scale(${scrollProgress > 0.18 ? 1 : 0})`,
                        transitionDelay: `${pos.delay}ms`,
                        animation: pos.isGoalkeeper ? 'none' : 'pulse 2s ease-in-out infinite',
                        animationDelay: `${pos.delay}ms`
                      }}
                    />
                  ))}
                </div>

                <div 
                  className="absolute bottom-6 left-6 rounded-xl bg-background/90 px-4 py-3 border border-border/40 backdrop-blur-md shadow-xl transition-all duration-700"
                  style={{
                    opacity: scrollProgress > 0.2 ? 1 : 0,
                    transform: `translateY(${scrollProgress > 0.2 ? '0' : '20px'})`
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Live Detection</div>
                  <div className="text-base font-bold text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    4-3-3 Attacking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section 2 - The Solution */}
      <div className="relative min-h-[80vh] flex items-center border-b border-border/40 px-4 py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto text-center">
            <div 
              className="transition-all duration-1000"
              style={{ 
                opacity: scrollProgress > 0.4 ? 1 : 0,
                transform: `translateY(${scrollProgress > 0.4 ? '0' : '40px'})`
              }}
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                The Answer
              </p>
              <h2 className="mb-10 text-editorial-lg font-[family-name:var(--font-display)] font-bold text-foreground">
                AI-powered tactical intelligence in minutes, not hours
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                {[
                  {
                    number: "01",
                    title: "Upload footage",
                    desc: "Drop your match video and watch AI go to work"
                  },
                  {
                    number: "02",
                    title: "Instant analysis",
                    desc: "Formation detection, tactical patterns, weaknesses revealed"
                  },
                  {
                    number: "03",
                    title: "Take action",
                    desc: "Downloadable reports ready for your next training session"
                  }
                ].map((step, i) => (
                  <div
                    key={i}
                    className="transition-all duration-700"
                    style={{ 
                      opacity: scrollProgress > 0.4 ? 1 : 0,
                      transform: `translateY(${scrollProgress > 0.4 ? '0' : '30px'})`,
                      transitionDelay: `${i * 150}ms`
                    }}
                  >
                    <div className="text-6xl font-[family-name:var(--font-display)] font-bold text-primary/20 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA - Upload Section */}
      <div id="upload" className="relative min-h-screen flex items-center justify-center px-4 py-32">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div 
              className="text-center mb-12 transition-all duration-1000"
              style={{ 
                opacity: scrollProgress > 0.65 ? 1 : 0,
                transform: `translateY(${scrollProgress > 0.65 ? '0' : '30px'})`
              }}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Ready to start?
              </p>
              <h2 className="text-editorial-md font-[family-name:var(--font-display)] font-bold text-foreground mb-6">
                Your competitive edge starts here
              </h2>
              <p className="text-body-editorial text-muted-foreground">
                Upload your match footage and get tactical insights in minutes
              </p>
            </div>

            <div 
              className="transition-all duration-1000 delay-200"
              style={{ 
                opacity: scrollProgress > 0.65 ? 1 : 0,
                transform: `scale(${scrollProgress > 0.65 ? '1' : '0.95'})`
              }}
            >
              <div className="rounded-3xl border-2 border-dashed border-border/50 bg-card/30 p-10 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/50 hover:shadow-2xl hover:shadow-primary/10">
                <div className="mb-8 text-center">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="rounded-full bg-primary/10 p-5 ring-8 ring-primary/5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8 text-primary"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">Drop your match footage</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Drag and drop your video or click to browse
                    <br />
                    <span className="text-xs">Supports MP4, MOV, and AVI up to 2GB</span>
                  </p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('video-upload')?.click()}
                  className={`mb-8 rounded-2xl border-2 border-dashed p-24 text-center transition-all duration-300 cursor-pointer ${
                    isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                  }`}
                >
                  {!file ? (
                    <div className="space-y-4">
                      <div className="mx-auto h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">Drop your video here or click to browse</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-8 w-8 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button 
                  size="lg" 
                  className="mb-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base tracking-wide transition-all duration-300 hover:scale-[1.02] py-6" 
                  disabled={!file || isUploading}
                  onClick={handleAnalyzeMatch}
                >
                  {isUploading ? "UPLOADING..." : "ANALYZE MATCH"}
                </Button>

                <p className="text-center text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {isUploading ? "Processing your upload..." : file ? "Ready to analyze" : "Upload a video to continue"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

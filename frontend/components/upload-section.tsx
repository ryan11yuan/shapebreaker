"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleAnalyze = async () => {
    if (!file) return

    setIsProcessing(true)

    // TODO: Replace with actual API call to process video
    const formData = new FormData()
    formData.append("video", file)

    try {
      // Placeholder for actual processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In production, this would call your Python backend:
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const result = await response.json()

      alert("Video analysis complete! (Demo mode - integrate your Python backend here)")
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section id="upload" className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Try It Now
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Upload your soccer footage and see the magic happen.
            </p>
          </div>

          <Card className="border-border/40 bg-card p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border/60 bg-muted/30"
              }`}
            >
              <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                {!file ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-4 h-12 w-12 text-muted-foreground"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="mb-2 text-lg font-semibold text-foreground">
                      Drop your video here, or click to browse
                    </p>
                    <p className="mb-6 text-sm text-muted-foreground">Supports MP4, MOV, AVI (max 30 seconds)</p>
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <label htmlFor="video-upload" className="cursor-pointer">
                        Select Video
                      </label>
                    </Button>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="mb-4 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12 text-primary"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                    <p className="mb-2 text-lg font-semibold text-foreground">{file.name}</p>
                    <p className="mb-6 text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleAnalyze}
                        disabled={isProcessing}
                        className="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isProcessing ? "Analyzing..." : "Analyze Formation"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFile(null)}
                        disabled={isProcessing}
                        className="border-border/60"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-muted/40 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Note:</strong> For best results, ensure your video shows a clear
                overhead or broadcast-angle view of the field with all players visible. The analysis works best with
                30-second clips during active play.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

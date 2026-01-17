"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { LoadingState } from "@/components/results/LoadingState"
import { ErrorState } from "@/components/results/ErrorState"
import { FormationImage } from "@/components/results/FormationImage"
import { TacticalBreakdown } from "@/components/results/TacticalBreakdown"
import { OutputResults } from "@/components/results/OutputResults"
import { ActionButtons } from "@/components/results/ActionButtons"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("loading")
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!taskId) {
      setError("No task ID provided")
      setStatus("error")
      return
    }

    // Poll for results
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/status/${taskId}`)
        const data = await response.json()

        if (data.status === "completed") {
          clearInterval(pollInterval)
          // Set the image URL for formations_comparison_start.png
          setImageUrl(`http://localhost:8000/download/${taskId}/formations_comparison_start.png`)
          setStatus("completed")
          
          // Automatically fetch AI analysis
          fetchAnalysis()
        } else if (data.status === "failed") {
          clearInterval(pollInterval)
          setError(data.error || "Processing failed")
          setStatus("failed")
        } else {
          setStatus(data.status)
        }
      } catch (err) {
        console.error("Error polling status:", err)
        setError("Failed to check processing status")
        setStatus("error")
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [taskId])

  const fetchAnalysis = async () => {
    if (!taskId || isAnalyzing) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch(`http://localhost:8000/analyze/${taskId}`, {
        method: "POST"
      })
      
      if (!response.ok) {
        throw new Error("Analysis request failed")
      }
      
      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      console.error("Error fetching analysis:", err)
      setError("Failed to generate AI analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 md:py-24">
        {status === "loading" || status === "queued" || status === "processing" ? (
          <LoadingState status={status} />
        ) : status === "error" || status === "failed" ? (
          <ErrorState error={error} />
        ) : status === "completed" && imageUrl ? (
          <div className="space-y-12">
            <div className="text-center animate-fade-in-up">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Analysis Complete</p>
            </div>

            <TacticalBreakdown analysis={analysis || ""} isAnalyzing={isAnalyzing} />

            <OutputResults imageUrl={imageUrl} taskId={taskId || ""} />

            <ActionButtons taskId={taskId} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
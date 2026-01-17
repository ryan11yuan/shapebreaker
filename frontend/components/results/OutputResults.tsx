"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface OutputResultsProps {
  imageUrl: string
  taskId: string
}

export function OutputResults({ imageUrl, taskId }: OutputResultsProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  
  const baseUrl = `http://localhost:8000/download/${taskId}`
  const images = [
    { url: `${baseUrl}/formations_comparison_start.png`, label: "Start" },
    { url: `${baseUrl}/formations_comparison_middle.png`, label: "Middle" },
    { url: `${baseUrl}/formations_comparison_end.png`, label: "End" }
  ]
  
  return (
    <>
      <div className="w-full max-w-5xl mx-auto animate-fade-in-up animation-delay-600">
        <div className="text-center mb-8">
          <h2 className="text-editorial-md font-[family-name:var(--font-display)] font-bold text-foreground mb-3">
            Output Results
          </h2>
          <p className="text-body-editorial text-muted-foreground">
            Video scan results and processed frames
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formation Visual Card */}
          <div className="group relative rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-foreground mb-2">Formation Visual</h3>
                <p className="text-sm text-muted-foreground mb-4">Detected team formations at match start</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full transition-all duration-300 group-hover:bg-primary/10"
                  onClick={() => setShowImageModal(true)}
                >
                  View Full Image
                </Button>
              </div>
            </div>
          </div>

          {/* Download Results Card */}
          <div className="group relative rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-foreground mb-2">Download Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">Get the complete analysis package</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full transition-all duration-300 group-hover:bg-primary/10"
                  onClick={() => {
                    if (taskId) {
                      window.open(`http://localhost:8000/download/${taskId}/formations_comparison_start.png`, '_blank')
                    }
                  }}
                >
                  Download Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative w-full max-w-7xl max-h-[90vh] overflow-auto bg-card rounded-2xl border border-border/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="sticky top-4 right-4 float-right z-10 h-10 w-10 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <svg className="h-6 w-6 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Images Grid */}
            <div className="p-8 space-y-8">
              <h2 className="text-editorial-md font-[family-name:var(--font-display)] font-bold text-foreground text-center mb-8">
                Formation Comparison - All Phases
              </h2>
              
              {images.map((image, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-xl font-[family-name:var(--font-display)] font-bold text-foreground flex items-center gap-3">
                    <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm">
                      {index + 1}
                    </span>
                    Match {image.label}
                  </h3>
                  <img
                    src={image.url}
                    alt={`Formation comparison - ${image.label}`}
                    className="w-full rounded-xl border-2 border-border/40 shadow-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
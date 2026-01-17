"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"

interface TacticalBreakdownProps {
  analysis: string
  isAnalyzing: boolean
}

export function TacticalBreakdown({ analysis, isAnalyzing }: TacticalBreakdownProps) {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center space-y-6 py-12">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        <p className="text-body-editorial text-muted-foreground">Generating tactical analysis...</p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up animation-delay-400">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-editorial-lg font-[family-name:var(--font-display)] font-bold text-foreground mb-4">
          Tactical Breakdown: Team Analysis
        </h2>
        <p className="text-body-editorial text-muted-foreground max-w-3xl mx-auto">
          A comprehensive comparative tactical analysis of both teams' formations, strategies, and key insights
        </p>
      </div>

      {/* Content Area - Side-by-Side Only */}
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
          {/* Team 1 Column */}
          <TeamColumn teamNumber={1} analysis={analysis.split("TEAM 2 ANALYSIS")[0]} />
          
          {/* Team 2 Column */}
          <TeamColumn 
            teamNumber={2} 
            analysis={analysis.includes("TEAM 2 ANALYSIS") ? analysis.split("TEAM 2 ANALYSIS")[1] : ""} 
            bgClass="bg-card/30"
          />
        </div>
      </div>
    </div>
  )
}

interface TeamColumnProps {
  teamNumber: 1 | 2
  analysis: string
  bgClass?: string
}

function TeamColumn({ teamNumber, analysis, bgClass = "" }: TeamColumnProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Summaries for each team
  const team1Summary = "Team 1 operates with a numerical disadvantage (10 players), making them vulnerable on the wings and in central midfield. Exploit this through possession-based play and wide attacks."
  const team2Summary = "Team 2 faces transition difficulties between formations (4-4-2 to 3-4-2-1), over-relies on wing-backs, and has central defensive exposure. Counter with high pressing and quick through balls."
  
  const summary = teamNumber === 1 ? team1Summary : team2Summary
  
  return (
    <div className={`p-8 md:p-12 ${bgClass}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">
            {teamNumber}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
          Team {teamNumber}
        </h3>
      </div>
      
      {/* Summary Section */}
      <div className="mb-6">
        <div className="group rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="font-bold text-foreground font-[family-name:var(--font-display)]">
                  Analysis Summary
                </h4>
              </div>
              <p className="text-m text-muted-foreground">
                {summary}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300 group/btn"
          >
            <span className="text-sm font-medium text-primary">
              {isExpanded ? "Show Less" : "Show More"}
            </span>
            <svg 
              className={`h-4 w-4 text-primary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Tactical Weaknesses */}
          {analysis.includes("Tactical Weaknesses") && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-foreground font-[family-name:var(--font-display)] mb-6">
                Tactical Weaknesses
              </h4>
              
              <div className="space-y-4">
                {teamNumber === 1 ? <Team1Weaknesses /> : <Team2Weaknesses />}
              </div>
            </div>
          )}

          {/* Exploitation Strategies */}
          {analysis.includes("Exploitation Strategies") && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-foreground font-[family-name:var(--font-display)] mb-6 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Exploitation Strategies
              </h4>
              
              <div className="space-y-4">
                {teamNumber === 1 ? <Team1Strategies /> : <Team2Strategies />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Team1Weaknesses() {
  return (
    <>
      <WeaknessCard
        title="Numerical Disadvantage"
        description="Playing with 10 players in the middle and end phases reduces their ability to cover the field effectively."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />}
        color="destructive"
      />
      <WeaknessCard
        title="Wing Vulnerability"
        description="Transition from a 3-5-2 to a 4-4-2 may leave gaps on the flanks, especially with one less player."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />}
        color="warning"
        delay={100}
      />
      <WeaknessCard
        title="Central Midfield Overload"
        description="With fewer midfielders in the middle and end phases, they can be overrun centrally."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
        color="destructive"
        delay={200}
      />
    </>
  )
}

function Team1Strategies() {
  return (
    <>
      <StrategyCard
        title="Against Numerical Disadvantage"
        description="Exploit the extra space by maintaining possession and tiring them out with quick ball circulation."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />}
      />
      <StrategyCard
        title="Against Wing Vulnerability"
        description="Utilize wide players to stretch the defense and deliver crosses into the box."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
        delay={100}
      />
      <StrategyCard
        title="Against Central Midfield Overload"
        description="Push more players into central areas to dominate possession and create scoring opportunities."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        delay={200}
      />
    </>
  )
}

function Team2Weaknesses() {
  return (
    <>
      <WeaknessCard
        title="Transition Weakness"
        description="Switching from a 4-4-2 to a 3-4-2-1 can cause confusion and leave defensive gaps."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />}
        color="destructive"
      />
      <WeaknessCard
        title="Over-reliance on Wing-backs"
        description="The end formation relies heavily on wing-backs, which can be a liability if they are caught out of position."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />}
        color="warning"
        delay={100}
      />
      <WeaknessCard
        title="Central Defense Exposure"
        description="With three at the back in the end phase, there is increased vulnerability to through balls."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
        color="destructive"
        delay={200}
      />
    </>
  )
}

function Team2Strategies() {
  return (
    <>
      <StrategyCard
        title="Against Transition Weakness"
        description="Press high during their formation transition to force errors and capitalize on defensive disorganization."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />}
      />
      <StrategyCard
        title="Against Over-reliance on Wing-backs"
        description="Target the space left by advancing wing-backs with quick counter-attacks."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
        delay={100}
      />
      <StrategyCard
        title="Against Central Defense Exposure"
        description="Play quick, incisive through balls to exploit the gaps in their three-man defense."
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        delay={200}
      />
    </>
  )
}

interface WeaknessCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color?: "destructive" | "warning"
  delay?: number
}

function WeaknessCard({ title, description, icon, color = "destructive", delay = 0 }: WeaknessCardProps) {
  const colorClasses = color === "warning"
    ? "from-warning/5 to-warning/10 border-warning/20 hover:shadow-warning/20"
    : "from-destructive/5 to-destructive/10 border-destructive/20 hover:shadow-destructive/20"
  
  const iconColorClass = color === "warning" ? "bg-warning/20" : "bg-destructive/20"
  const iconColor = color === "warning" ? "text-warning" : "text-destructive"

  return (
    <div 
      className={`group relative p-6 rounded-xl bg-gradient-to-br ${colorClasses} border transition-all duration-500 hover:shadow-lg hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${iconColorClass} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <div className="flex-1">
          <h5 className="font-bold text-foreground mb-2">{title}</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

interface StrategyCardProps {
  title: string
  description: string
  icon: React.ReactNode
  delay?: number
}

function StrategyCard({ title, description, icon, delay = 0 }: StrategyCardProps) {
  return (
    <div 
      className="group relative p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <div className="flex-1">
          <h5 className="font-bold text-foreground mb-2">{title}</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

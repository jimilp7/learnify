"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"

interface GeneratingPlanProps {
  topic: string
  depth: string
  onBack: () => void
}

const cheekyMessages = [
  "Teaching AI to be your personal tutor",
  "Brewing the perfect blend of knowledge", 
  "Summoning the wisdom of the internet",
  "Making learning fun (the audacity!)",
  "Calculating the optimal brain expansion rate",
  "Consulting with digital professors",
  "Mixing curiosity with comprehension",
  "Loading your personalized learning adventure",
  "Optimizing for maximum 'aha!' moments",
  "Crafting bite-sized genius pills"
]

export default function GeneratingPlan({ topic, depth, onBack }: GeneratingPlanProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [dotCount, setDotCount] = useState(0)
  
  const getDepthLabel = (depth: string) => {
    switch (depth) {
      case 'simple': return 'Simple (ELI5)'
      case 'normal': return 'Normal (High School)'
      case 'advanced': return 'Advanced (PhD/Researcher)'
      default: return 'Normal (High School)'
    }
  }
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => {
        if (prev === 3) {
          // Reset dots and move to next message
          setCurrentMessageIndex(prevIndex => 
            (prevIndex + 1) % cheekyMessages.length
          )
          return 0
        } else {
          // Add another dot
          return prev + 1
        }
      })
    }, 1250) // Change every 1.25 seconds (5 seconds total per message)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-6">
        <button 
          onClick={onBack}
          className="mb-4 p-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Spinner */}
          <div className="w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Generating Lesson Plan
          </h1>
          
          {/* Topic and Depth - closer together and left aligned */}
          <div className="space-y-2 text-left">
            <div className="text-lg text-gray-700">
              <span className="mr-2">📚</span>
              <span className="font-medium">Topic:</span> {topic}
            </div>
            
            <div className="text-lg text-gray-600">
              <span className="mr-2">🎯</span>
              <span className="font-medium">Level:</span> {getDepthLabel(depth)}
            </div>
          </div>
          
          {/* Rotating Messages */}
          <div className="h-6 flex items-center justify-center">
            <p className="text-sm text-gray-500 italic transition-opacity duration-300 font-mono">
              {cheekyMessages[currentMessageIndex]}{".".repeat(dotCount)}{" ".repeat(3 - dotCount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
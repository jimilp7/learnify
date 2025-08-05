"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningStyleSelectionProps {
  topic: string
  depth: string
  onNext: (learningStyle: string) => void
  onBack: () => void
  error?: string
}

const learningStyleOptions = [
  {
    value: "visual",
    label: "Visual",
    emoji: "📊",
    description: "Charts, diagrams, and structured information",
    colorClass: "bg-purple-400",
    textColorClass: "text-purple-50"
  },
  {
    value: "auditory", 
    label: "Auditory",
    emoji: "🎧",
    description: "Stories, discussions, and verbal explanations",
    colorClass: "bg-purple-500",
    textColorClass: "text-purple-100"
  },
  {
    value: "kinesthetic",
    label: "Hands-on",
    emoji: "🛠️",
    description: "Practical examples and real-world applications",
    colorClass: "bg-purple-600",
    textColorClass: "text-purple-100"
  },
  {
    value: "analytical",
    label: "Analytical",
    emoji: "🧠",
    description: "Logical patterns and systematic breakdowns",
    colorClass: "bg-purple-700",
    textColorClass: "text-purple-100"
  }
]

export default function LearningStyleSelection({ topic, depth, onNext, onBack, error }: LearningStyleSelectionProps) {
  const [learningStyle, setLearningStyle] = useState("visual")

  const handleSubmit = () => {
    console.log('🎨 Learning style selected:', learningStyle)
    onNext(learningStyle)
  }

  const getDepthLabel = (depth: string) => {
    const labels: Record<string, string> = {
      simple: "Simple (ELI5)",
      normal: "Normal (High School)",
      advanced: "Advanced (PhD/Researcher)"
    }
    return labels[depth] || depth
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <button 
        onClick={onBack}
        className="mb-8 p-3 rounded-full hover:bg-gray-100 self-start transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="flex-1 flex flex-col items-center justify-center pb-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">
              Learning style?
            </h1>
            <p className="text-lg text-gray-600">
              {topic}
            </p>
            <p className="text-sm text-gray-500">
              {getDepthLabel(depth)}
            </p>
          </div>
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {learningStyleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLearningStyle(option.value)}
                className={`w-full p-6 rounded-2xl transition-all ${
                  learningStyle === option.value
                    ? `${option.colorClass} text-white scale-105`
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <div className="text-xl font-semibold">{option.label}</div>
                    <div className={`text-sm mt-1 ${
                      learningStyle === option.value ? option.textColorClass : "text-gray-500"
                    }`}>
                      {option.description}
                    </div>
                  </div>
                  <span className="text-3xl ml-4">{option.emoji}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            Generate Plan
          </Button>
        </div>
      </div>
    </div>
  )
}
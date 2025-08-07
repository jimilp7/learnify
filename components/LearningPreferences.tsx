"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningPreferencesProps {
  topic: string
  onNext: (preferences: string[]) => void
  onBack: () => void
}

const learningStyleOptions = [
  {
    id: "visual",
    label: "Visual Learner",
    emoji: "👁️",
    description: "I learn best with diagrams, charts, and visual examples",
    colorClass: "bg-blue-400",
    textColorClass: "text-blue-50"
  },
  {
    id: "auditory",
    label: "Auditory Learner", 
    emoji: "👂",
    description: "I prefer listening and verbal explanations",
    colorClass: "bg-purple-400",
    textColorClass: "text-purple-50"
  },
  {
    id: "kinesthetic",
    label: "Hands-On Learner",
    emoji: "🤲",
    description: "I learn by doing and practical examples",
    colorClass: "bg-orange-400",
    textColorClass: "text-orange-50"
  },
  {
    id: "reading",
    label: "Reading/Writing",
    emoji: "📖",
    description: "I prefer written content and taking notes",
    colorClass: "bg-green-400",
    textColorClass: "text-green-50"
  },
  {
    id: "logical",
    label: "Logical Thinker",
    emoji: "🧠",
    description: "I like step-by-step reasoning and patterns",
    colorClass: "bg-indigo-400",
    textColorClass: "text-indigo-50"
  },
  {
    id: "social",
    label: "Social Learner",
    emoji: "👥",
    description: "I learn through examples and real-world scenarios",
    colorClass: "bg-pink-400",
    textColorClass: "text-pink-50"
  }
]

export default function LearningPreferences({ topic, onNext, onBack }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (preferenceId: string) => {
    console.log('🎨 Toggling preference:', preferenceId)
    setSelectedPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    )
  }

  const handleSubmit = () => {
    console.log('🚀 Learning preferences submitted:', selectedPreferences)
    onNext(selectedPreferences)
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
              How do you learn best?
            </h1>
            <p className="text-lg text-gray-600">
              Learning: {topic}
            </p>
            <p className="text-sm text-gray-500">
              Select all that apply to personalize your lessons
            </p>
          </div>
          
          <div className="space-y-3">
            {learningStyleOptions.map((option) => {
              const isSelected = selectedPreferences.includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => togglePreference(option.id)}
                  className={`relative w-full p-4 rounded-2xl transition-all ${
                    isSelected
                      ? `${option.colorClass} text-white scale-105 shadow-lg`
                      : "bg-gray-50 hover:bg-gray-100 hover:scale-102"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-sm font-bold">✓</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <div className="text-lg font-semibold">{option.label}</div>
                      <div className={`text-sm mt-1 ${
                        isSelected ? option.textColorClass : "text-gray-500"
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    <span className="text-2xl ml-4">{option.emoji}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            disabled={selectedPreferences.length === 0}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Continue ({selectedPreferences.length} selected)
          </Button>
        </div>
      </div>
    </div>
  )
}
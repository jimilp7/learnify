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
    label: "Visual",
    emoji: "👁️",
    description: "Learn through images, diagrams, and visual aids",
    colorClass: "bg-blue-400",
    textColorClass: "text-blue-50"
  },
  {
    id: "auditory",
    label: "Auditory", 
    emoji: "🎧",
    description: "Learn through listening and verbal explanations",
    colorClass: "bg-purple-400",
    textColorClass: "text-purple-50"
  },
  {
    id: "kinesthetic",
    label: "Hands-on",
    emoji: "🤲",
    description: "Learn through practical examples and activities",
    colorClass: "bg-orange-400",
    textColorClass: "text-orange-50"
  },
  {
    id: "reading",
    label: "Reading/Writing",
    emoji: "📖",
    description: "Learn through text, notes, and written materials",
    colorClass: "bg-green-400",
    textColorClass: "text-green-50"
  },
  {
    id: "sequential",
    label: "Step-by-step",
    emoji: "📝",
    description: "Learn through logical, sequential progression",
    colorClass: "bg-red-400",
    textColorClass: "text-red-50"
  },
  {
    id: "global",
    label: "Big Picture",
    emoji: "🌍",
    description: "Learn by seeing the overall concept first",
    colorClass: "bg-teal-400",
    textColorClass: "text-teal-50"
  }
]

export default function LearningPreferences({ topic, onNext, onBack }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const handlePreferenceToggle = (preferenceId: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        console.log('🔽 Removing preference:', preferenceId)
        return prev.filter(id => id !== preferenceId)
      } else {
        console.log('🔼 Adding preference:', preferenceId)
        return [...prev, preferenceId]
      }
    })
  }

  const handleSubmit = () => {
    console.log('🎯 Learning preferences selected:', selectedPreferences)
    onNext(selectedPreferences)
  }

  const isSelected = (preferenceId: string) => selectedPreferences.includes(preferenceId)

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
              Select all that apply
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {learningStyleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePreferenceToggle(option.id)}
                className={`w-full p-6 rounded-2xl transition-all ${
                  isSelected(option.id)
                    ? `${option.colorClass} text-white scale-105 shadow-lg`
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-left flex-1">
                    <div className="text-xl font-semibold">{option.label}</div>
                    <div className={`text-sm mt-1 ${
                      isSelected(option.id) ? option.textColorClass : "text-gray-500"
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
            disabled={selectedPreferences.length === 0}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
          >
            Next {selectedPreferences.length > 0 && `(${selectedPreferences.length} selected)`}
          </Button>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningPreferencesProps {
  onNext: (preferences: string[]) => void
  onBack: () => void
}

const learningStyles = [
  {
    id: "visual",
    label: "Visual",
    emoji: "👁️",
    description: "I learn best with diagrams, charts, and images",
    colorClass: "bg-purple-400",
    textColorClass: "text-purple-50"
  },
  {
    id: "auditory", 
    label: "Auditory",
    emoji: "🎧",
    description: "I prefer listening and verbal explanations",
    colorClass: "bg-blue-400",
    textColorClass: "text-blue-50"
  },
  {
    id: "kinesthetic",
    label: "Hands-on",
    emoji: "🤲",
    description: "I learn by doing and practicing",
    colorClass: "bg-orange-400",
    textColorClass: "text-orange-50"
  },
  {
    id: "reading",
    label: "Reading/Writing",
    emoji: "📚",
    description: "I learn through text and written materials",
    colorClass: "bg-green-400",
    textColorClass: "text-green-50"
  },
  {
    id: "logical",
    label: "Logical",
    emoji: "🧮",
    description: "I prefer step-by-step reasoning and patterns",
    colorClass: "bg-indigo-400",
    textColorClass: "text-indigo-50"
  },
  {
    id: "social",
    label: "Social",
    emoji: "👥",
    description: "I learn better with examples from real life",
    colorClass: "bg-pink-400",
    textColorClass: "text-pink-50"
  }
]

export default function LearningPreferences({ onNext, onBack }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const handleTogglePreference = (preferenceId: string) => {
    console.log('🎨 Toggling preference:', preferenceId)
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        const updated = prev.filter(id => id !== preferenceId)
        console.log('➖ Removed preference. New selection:', updated)
        return updated
      } else {
        const updated = [...prev, preferenceId]
        console.log('➕ Added preference. New selection:', updated)
        return updated
      }
    })
  }

  const handleSubmit = () => {
    console.log('🚀 Learning preferences submitted:', selectedPreferences)
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
      
      <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">
              How do you learn best?
            </h1>
            <p className="text-lg text-gray-600">
              Select all that apply to personalize your experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 min-h-[320px]">
            {learningStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleTogglePreference(style.id)}
                className={`p-4 rounded-2xl transition-all ${
                  isSelected(style.id)
                    ? `${style.colorClass} text-white scale-105 shadow-lg`
                    : "bg-gray-50 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-2xl">{style.emoji}</span>
                  <div className="text-sm font-semibold">{style.label}</div>
                  <div className={`text-xs ${
                    isSelected(style.id) ? style.textColorClass : "text-gray-500"
                  }`}>
                    {style.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {selectedPreferences.length > 0 && (
            <div className="text-center text-sm text-gray-600">
              {selectedPreferences.length} preference{selectedPreferences.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            disabled={selectedPreferences.length === 0}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
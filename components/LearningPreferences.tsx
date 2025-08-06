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
    emoji: "👀",
    description: "I learn best with diagrams and examples",
    colorClass: "bg-purple-500",
    textColorClass: "text-purple-100"
  },
  {
    id: "auditory", 
    label: "Auditory Learner",
    emoji: "🎧",
    description: "I prefer listening and discussion",
    colorClass: "bg-blue-500",
    textColorClass: "text-blue-100"
  },
  {
    id: "kinesthetic",
    label: "Hands-On Learner", 
    emoji: "🔨",
    description: "I learn by doing and practicing",
    colorClass: "bg-orange-500",
    textColorClass: "text-orange-100"
  },
  {
    id: "reading",
    label: "Reading & Writing",
    emoji: "📚",
    description: "I prefer text-based learning",
    colorClass: "bg-green-500", 
    textColorClass: "text-green-100"
  },
  {
    id: "logical",
    label: "Logical Learner",
    emoji: "🧮",
    description: "I like step-by-step reasoning",
    colorClass: "bg-indigo-500",
    textColorClass: "text-indigo-100"
  },
  {
    id: "social",
    label: "Social Learner",
    emoji: "👥",
    description: "I learn better in group settings",
    colorClass: "bg-pink-500",
    textColorClass: "text-pink-100"
  },
  {
    id: "solitary",
    label: "Solo Learner", 
    emoji: "🧘",
    description: "I prefer learning on my own",
    colorClass: "bg-gray-500",
    textColorClass: "text-gray-100"
  },
  {
    id: "practical",
    label: "Practical Learner",
    emoji: "⚙️", 
    description: "I want real-world applications",
    colorClass: "bg-red-500",
    textColorClass: "text-red-100"
  }
]

export default function LearningPreferences({ topic, onNext, onBack }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (preferenceId: string) => {
    console.log('🎯 Toggling preference:', preferenceId)
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        const updated = prev.filter(id => id !== preferenceId)
        console.log('➖ Removed preference, current selection:', updated)
        return updated
      } else {
        const updated = [...prev, preferenceId]
        console.log('➕ Added preference, current selection:', updated)
        return updated
      }
    })
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
              Select all that apply (optional)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {learningStyleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => togglePreference(option.id)}
                className={`p-4 rounded-2xl transition-all ${
                  selectedPreferences.includes(option.id)
                    ? `${option.colorClass} text-white scale-105 shadow-lg`
                    : "bg-gray-50 hover:bg-gray-100 hover:scale-102"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className={`text-xs ${
                    selectedPreferences.includes(option.id) 
                      ? option.textColorClass 
                      : "text-gray-500"
                  }`}>
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedPreferences.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <p className="text-blue-700 text-center text-sm">
                Selected {selectedPreferences.length} learning preference{selectedPreferences.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            {selectedPreferences.length > 0 ? 'Continue' : 'Skip'}
          </Button>
        </div>
      </div>
    </div>
  )
}
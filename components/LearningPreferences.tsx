"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningPreferencesProps {
  onNext: (preferences: string[]) => void
  onBack: () => void
}

const learningStyleOptions = [
  {
    value: "visual",
    label: "Visual Learner",
    emoji: "👁️",
    description: "I learn best with diagrams, charts, and visual aids"
  },
  {
    value: "auditory", 
    label: "Auditory Learner",
    emoji: "👂",
    description: "I learn best by listening and discussing"
  },
  {
    value: "kinesthetic",
    label: "Hands-on Learner", 
    emoji: "✋",
    description: "I learn best by doing and practicing"
  },
  {
    value: "reading",
    label: "Reading/Writing",
    emoji: "📚",
    description: "I learn best through text and written materials"
  },
  {
    value: "social",
    label: "Social Learner",
    emoji: "👥",
    description: "I learn best in groups and through interaction"
  },
  {
    value: "solitary",
    label: "Independent Learner",
    emoji: "🧘",
    description: "I learn best alone and at my own pace"
  }
]

export default function LearningPreferences({ onNext, onBack }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (preference: string) => {
    console.log('🎯 Preference toggled:', preference)
    setSelectedPreferences(prev => {
      if (prev.includes(preference)) {
        const updated = prev.filter(p => p !== preference)
        console.log('📝 Preferences updated (removed):', updated)
        return updated
      } else {
        const updated = [...prev, preference]
        console.log('📝 Preferences updated (added):', updated)
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
              Select all that apply
            </p>
          </div>
          
          <div className="space-y-4">
            {learningStyleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => togglePreference(option.value)}
                className={`w-full p-6 rounded-2xl transition-all ${
                  selectedPreferences.includes(option.value)
                    ? "bg-blue-500 text-white scale-105"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <div className="text-xl font-semibold">{option.label}</div>
                    <div className={`text-sm mt-1 ${
                      selectedPreferences.includes(option.value) ? "text-blue-100" : "text-gray-500"
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
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
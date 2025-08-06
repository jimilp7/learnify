"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningPreferencesProps {
  topic: string
  onNext: (preferences: string[]) => void
  onBack: () => void
}

const preferenceOptions = [
  {
    value: "visual",
    label: "Visual",
    emoji: "👁️",
    description: "Learn through images and diagrams",
    colorClass: "bg-purple-500",
    textColorClass: "text-purple-100"
  },
  {
    value: "auditory", 
    label: "Auditory",
    emoji: "🎧",
    description: "Learn through listening and speaking",
    colorClass: "bg-blue-500",
    textColorClass: "text-blue-100"
  },
  {
    value: "kinesthetic",
    label: "Hands-on",
    emoji: "🤲",
    description: "Learn through doing and practice",
    colorClass: "bg-orange-500",
    textColorClass: "text-orange-100"
  },
  {
    value: "reading",
    label: "Reading/Writing",
    emoji: "📚",
    description: "Learn through text and notes",
    colorClass: "bg-emerald-500",
    textColorClass: "text-emerald-100"
  },
  {
    value: "social",
    label: "Social",
    emoji: "👥",
    description: "Learn through discussion and groups",
    colorClass: "bg-pink-500",
    textColorClass: "text-pink-100"
  },
  {
    value: "solitary",
    label: "Independent",
    emoji: "🧘",
    description: "Learn through self-study and reflection",
    colorClass: "bg-indigo-500",
    textColorClass: "text-indigo-100"
  }
]

export default function LearningPreferences({ topic, onNext, onBack }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const togglePreference = (value: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(value)) {
        return prev.filter(p => p !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const handleSubmit = () => {
    console.log('🎯 Learning preferences selected:', selectedPreferences)
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
              Select all that apply
            </p>
          </div>
          
          <div className="space-y-3">
            {preferenceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => togglePreference(option.value)}
                className={`w-full p-5 rounded-2xl transition-all ${
                  selectedPreferences.includes(option.value)
                    ? `${option.colorClass} text-white scale-[1.02] shadow-lg`
                    : "bg-gray-50 hover:bg-gray-100 hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-lg font-semibold">{option.label}</div>
                    <div className={`text-sm mt-1 ${
                      selectedPreferences.includes(option.value) 
                        ? option.textColorClass 
                        : "text-gray-500"
                    }`}>
                      {option.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{option.emoji}</span>
                    {selectedPreferences.includes(option.value) && (
                      <div className="w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
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
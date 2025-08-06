"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningPreferencesProps {
  topic: string
  onNext: (preferences: string[]) => void
  onBack: () => void
  initialPreferences?: string[]
}

const learningStyleOptions = [
  {
    value: "visual",
    label: "Visual",
    emoji: "👁️",
    description: "I learn best with diagrams, charts, and visual examples",
    colorClass: "bg-purple-500",
    textColorClass: "text-purple-50"
  },
  {
    value: "auditory", 
    label: "Auditory",
    emoji: "🎧",
    description: "I prefer listening and verbal explanations",
    colorClass: "bg-blue-500",
    textColorClass: "text-blue-50"
  },
  {
    value: "hands-on",
    label: "Hands-on",
    emoji: "🛠️",
    description: "I learn by doing and practical exercises",
    colorClass: "bg-orange-500",
    textColorClass: "text-orange-50"
  },
  {
    value: "reading",
    label: "Reading",
    emoji: "📚",
    description: "I like detailed text and written materials",
    colorClass: "bg-green-500",
    textColorClass: "text-green-50"
  },
  {
    value: "social",
    label: "Social",
    emoji: "👥",
    description: "I prefer group discussions and collaborative learning",
    colorClass: "bg-pink-500",
    textColorClass: "text-pink-50"
  },
  {
    value: "analytical",
    label: "Analytical",
    emoji: "🔬",
    description: "I like logical, step-by-step explanations",
    colorClass: "bg-indigo-500",
    textColorClass: "text-indigo-50"
  }
]

export default function LearningPreferences({ topic, onNext, onBack, initialPreferences = [] }: LearningPreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialPreferences)

  const handlePreferenceToggle = (preferenceValue: string) => {
    console.log('🎯 Preference toggled:', preferenceValue)
    setSelectedPreferences(prev => {
      const newPreferences = prev.includes(preferenceValue)
        ? prev.filter(p => p !== preferenceValue)
        : [...prev, preferenceValue]
      console.log('📝 Updated preferences:', newPreferences)
      return newPreferences
    })
  }

  const handleSubmit = () => {
    console.log('🚀 Learning preferences submitted:', selectedPreferences)
    onNext(selectedPreferences)
  }

  const getPreferenceOption = (value: string) => {
    return learningStyleOptions.find(option => option.value === value)
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
          
          <div className="space-y-4">
            {learningStyleOptions.map((option) => {
              const isSelected = selectedPreferences.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceToggle(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handlePreferenceToggle(option.value)
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${option.label} learning style: ${option.description}${isSelected ? ' (selected)' : ''}`}
                  className={`w-full p-6 rounded-2xl transition-all border-2 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                    isSelected
                      ? `${option.colorClass} text-white scale-105 border-transparent`
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-left flex-1">
                      <div className="text-xl font-semibold">{option.label}</div>
                      <div className={`text-sm mt-1 ${
                        isSelected ? option.textColorClass : "text-gray-500"
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    <div className="flex items-center ml-4 gap-2">
                      <span className="text-3xl">{option.emoji}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-current"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {selectedPreferences.length > 0 && (
            <div className="text-center p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <p className="text-blue-700 text-sm">
                {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {selectedPreferences.map(pref => {
                  const option = getPreferenceOption(pref)
                  return option ? (
                    <span key={pref} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </span>
                  ) : null
                })}
              </div>
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
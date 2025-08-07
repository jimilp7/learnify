"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LearningPreferencesProps {
  topic: string
  onNext: (preferences: LearningPreferences) => void
  onBack: () => void
}

export interface LearningPreferences {
  learningStyle: string
  pacePreference: string
  focusAreas: string[]
  timeAvailable: string
}

const learningStyleOptions = [
  {
    value: "visual",
    label: "Visual",
    emoji: "👁️",
    description: "I learn best with examples and demonstrations"
  },
  {
    value: "auditory", 
    label: "Auditory",
    emoji: "👂",
    description: "I prefer listening and verbal explanations"
  },
  {
    value: "kinesthetic",
    label: "Hands-on",
    emoji: "✋",
    description: "I like practical exercises and doing things"
  },
  {
    value: "reading",
    label: "Reading",
    emoji: "📚",
    description: "I prefer text-based learning materials"
  }
]

const paceOptions = [
  {
    value: "slow",
    label: "Take it slow",
    emoji: "🐌",
    description: "I want detailed explanations"
  },
  {
    value: "normal",
    label: "Normal pace",
    emoji: "🚶",
    description: "Balance between detail and efficiency"
  },
  {
    value: "fast",
    label: "Quick pace",
    emoji: "🏃",
    description: "Get to the point quickly"
  }
]

const focusOptions = [
  { value: "theory", label: "Theory & Concepts", emoji: "💡" },
  { value: "practical", label: "Practical Applications", emoji: "🔧" },
  { value: "examples", label: "Real-world Examples", emoji: "🌍" },
  { value: "stepbystep", label: "Step-by-step Guide", emoji: "📋" },
  { value: "tips", label: "Tips & Best Practices", emoji: "⭐" },
  { value: "common_mistakes", label: "Common Mistakes", emoji: "⚠️" }
]

const timeOptions = [
  {
    value: "5min",
    label: "5 minutes",
    emoji: "⏰",
    description: "Quick overview"
  },
  {
    value: "15min",
    label: "15 minutes", 
    emoji: "⏱️",
    description: "Standard learning session"
  },
  {
    value: "30min",
    label: "30+ minutes",
    emoji: "⏳",
    description: "Deep dive session"
  }
]

export default function LearningPreferences({ topic, onNext, onBack }: LearningPreferencesProps) {
  const [learningStyle, setLearningStyle] = useState("auditory")
  const [pacePreference, setPacePreference] = useState("normal")
  const [focusAreas, setFocusAreas] = useState<string[]>(["theory", "examples"])
  const [timeAvailable, setTimeAvailable] = useState("15min")

  const handleFocusToggle = (value: string) => {
    setFocusAreas(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const handleSubmit = () => {
    const preferences: LearningPreferences = {
      learningStyle,
      pacePreference,
      focusAreas,
      timeAvailable
    }
    console.log('🎯 Learning preferences submitted:', preferences)
    onNext(preferences)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <button 
        onClick={onBack}
        className="mb-8 p-3 rounded-full hover:bg-gray-100 self-start transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="flex-1 flex flex-col pb-24">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              How do you learn best?
            </h1>
            <p className="text-lg text-gray-600">
              Learning: {topic}
            </p>
          </div>
          
          {/* Learning Style */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Learning Style</h2>
            <div className="grid grid-cols-2 gap-3">
              {learningStyleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLearningStyle(option.value)}
                  className={`p-4 rounded-2xl transition-all ${
                    learningStyle === option.value
                      ? "bg-blue-500 text-white scale-105"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-xs mt-1 ${
                      learningStyle === option.value ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pace Preference */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Learning Pace</h2>
            <div className="space-y-3">
              {paceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPacePreference(option.value)}
                  className={`w-full p-4 rounded-2xl transition-all ${
                    pacePreference === option.value
                      ? "bg-green-500 text-white scale-105"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold">{option.label}</div>
                      <div className={`text-sm mt-1 ${
                        pacePreference === option.value ? "text-green-100" : "text-gray-500"
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    <span className="text-2xl">{option.emoji}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What interests you most?</h2>
            <p className="text-sm text-gray-600">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {focusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFocusToggle(option.value)}
                  className={`p-4 rounded-2xl transition-all ${
                    focusAreas.includes(option.value)
                      ? "bg-purple-500 text-white scale-105"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Available */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Time Available</h2>
            <div className="space-y-3">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeAvailable(option.value)}
                  className={`w-full p-4 rounded-2xl transition-all ${
                    timeAvailable === option.value
                      ? "bg-orange-500 text-white scale-105"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold">{option.label}</div>
                      <div className={`text-sm mt-1 ${
                        timeAvailable === option.value ? "text-orange-100" : "text-gray-500"
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    <span className="text-2xl">{option.emoji}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            disabled={focusAreas.length === 0}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
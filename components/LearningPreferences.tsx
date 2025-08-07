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
  pace: string
  interactivity: string
  examples: string
}

const learningStyleOptions = [
  {
    value: "visual",
    label: "Visual Learner",
    emoji: "👁️",
    description: "I learn best with diagrams, charts, and visual explanations",
    colorClass: "bg-purple-500",
    textColorClass: "text-purple-100"
  },
  {
    value: "auditory",
    label: "Auditory Learner", 
    emoji: "🎧",
    description: "I prefer listening and verbal explanations",
    colorClass: "bg-blue-500",
    textColorClass: "text-blue-100"
  },
  {
    value: "kinesthetic",
    label: "Hands-on Learner",
    emoji: "🔨", 
    description: "I learn by doing and practical examples",
    colorClass: "bg-orange-500",
    textColorClass: "text-orange-100"
  }
]

const paceOptions = [
  {
    value: "slow",
    label: "Take it slow",
    emoji: "🐌",
    description: "Give me time to absorb each concept",
    colorClass: "bg-green-500"
  },
  {
    value: "normal", 
    label: "Regular pace",
    emoji: "🚶",
    description: "Standard learning rhythm",
    colorClass: "bg-blue-500"
  },
  {
    value: "fast",
    label: "Move quickly", 
    emoji: "🏃",
    description: "I pick up concepts fast",
    colorClass: "bg-red-500"
  }
]

const interactivityOptions = [
  {
    value: "high",
    label: "Interactive",
    emoji: "🎯",
    description: "Ask me questions and engage me",
    colorClass: "bg-indigo-500"
  },
  {
    value: "medium",
    label: "Balanced",
    emoji: "⚖️", 
    description: "Some interaction, mostly listening",
    colorClass: "bg-violet-500"
  },
  {
    value: "low", 
    label: "Passive",
    emoji: "📺",
    description: "Just explain it to me",
    colorClass: "bg-slate-500"
  }
]

const exampleOptions = [
  {
    value: "many",
    label: "Lots of examples",
    emoji: "📚",
    description: "Show me multiple real-world examples",
    colorClass: "bg-emerald-500"
  },
  {
    value: "some",
    label: "Some examples", 
    emoji: "📖",
    description: "A few good examples work for me",
    colorClass: "bg-teal-500"
  },
  {
    value: "few",
    label: "Focus on theory",
    emoji: "🧠",
    description: "Less examples, more concepts",
    colorClass: "bg-cyan-500"
  }
]

export default function LearningPreferences({ topic, onNext, onBack }: LearningPreferencesProps) {
  const [learningStyle, setLearningStyle] = useState("auditory")
  const [pace, setPace] = useState("normal")
  const [interactivity, setInteractivity] = useState("medium")
  const [examples, setExamples] = useState("some")

  const handleSubmit = () => {
    console.log('🎯 Learning preferences submitted:', { learningStyle, pace, interactivity, examples })
    
    // Validation check (though defaults should prevent this)
    if (!learningStyle || !pace || !interactivity || !examples) {
      console.error('❌ Invalid preferences - missing required fields')
      return
    }
    
    const preferences: LearningPreferences = {
      learningStyle,
      pace,
      interactivity,
      examples
    }
    onNext(preferences)
  }

  const isFormValid = learningStyle && pace && interactivity && examples

  const OptionGroup = ({ 
    title, 
    options, 
    selected, 
    onSelect 
  }: {
    title: string
    options: Array<{ value: string; label: string; icon?: React.ReactNode; description?: string; colorClass?: string; emoji?: string }>
    selected: string
    onSelect: (value: string) => void
  }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-xl transition-all text-left ${
              selected === option.value
                ? `${option.colorClass} text-white scale-[1.02]`
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                <div className={`text-sm mt-1 ${
                  selected === option.value ? "text-white opacity-90" : "text-gray-500"
                }`}>
                  {option.description}
                </div>
              </div>
              <span className="text-xl ml-3">{option.emoji}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white">
      <button 
        onClick={onBack}
        className="mb-8 p-3 rounded-full hover:bg-gray-100 self-start transition-colors"
        aria-label="Go back"
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
            <p className="text-sm text-gray-500">
              Help us personalize your experience
            </p>
          </div>
          
          <div className="space-y-8">
            <OptionGroup
              title="Learning Style"
              options={learningStyleOptions}
              selected={learningStyle}
              onSelect={setLearningStyle}
            />
            
            <OptionGroup
              title="Learning Pace"
              options={paceOptions}
              selected={pace}
              onSelect={setPace}
            />
            
            <OptionGroup
              title="Interactivity"
              options={interactivityOptions}
              selected={interactivity}
              onSelect={setInteractivity}
            />
            
            <OptionGroup
              title="Examples"
              options={exampleOptions}
              selected={examples}
              onSelect={setExamples}
            />
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Continue to Depth Selection
          </Button>
        </div>
      </div>
    </div>
  )
}
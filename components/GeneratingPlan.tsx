"use client"

import { ArrowLeft, Loader2, Brain, Clock } from "lucide-react"

interface GeneratingPlanProps {
  topic: string
  depth: string
  onBack: () => void
}

export default function GeneratingPlan({ topic, depth, onBack }: GeneratingPlanProps) {
  const getDepthInfo = (depth: string) => {
    switch (depth) {
      case 'simple':
        return { label: 'Simple', emoji: '🌱', description: 'ELI5 level' }
      case 'normal':
        return { label: 'Normal', emoji: '🌿', description: 'High School level' }
      case 'advanced':
        return { label: 'Advanced', emoji: '🌳', description: 'PhD/Researcher level' }
      default:
        return { label: 'Normal', emoji: '🌿', description: 'High School level' }
    }
  }
  
  const depthInfo = getDepthInfo(depth)
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-6">
        <button 
          onClick={onBack}
          className="mb-4 p-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md mx-auto space-y-8">
          {/* AI Brain Animation */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-blue-500" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 Crafting Your Learning Journey
            </h1>
            
            {/* Topic Card */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">📚</span>
                <span className="font-medium">Topic</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 leading-relaxed">
                {topic}
              </p>
            </div>
            
            {/* Depth Card */}
            <div className="bg-green-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">🎯</span>
                <span className="font-medium">Learning Level</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{depthInfo.emoji}</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    {depthInfo.label}
                  </p>
                  <p className="text-gray-600">
                    {depthInfo.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Usually takes 10-30 seconds</span>
            </div>
            
            {/* Animated dots */}
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
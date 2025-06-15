"use client"

import { ArrowLeft, Loader2 } from "lucide-react"

interface GeneratingContentProps {
  lessonTitle: string
  onBack: () => void
}

export default function GeneratingContent({ lessonTitle, onBack }: GeneratingContentProps) {
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
        <div className="max-w-md mx-auto space-y-8 text-center">
          {/* Spinner */}
          <div className="w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Preparing Your Lesson
            </h1>
            <p className="text-lg text-gray-600">
              {lessonTitle}
            </p>
          </div>
          
          {/* Status */}
          <p className="text-sm text-gray-500">
            Generating lesson content and audio...
          </p>
        </div>
      </div>
    </div>
  )
}
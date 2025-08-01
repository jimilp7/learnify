"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PlayCircle, Clock, ChevronDown, ChevronUp } from "lucide-react"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number // in minutes
}

interface LessonPlanProps {
  topic: string
  depth: string
  lessons: Lesson[]
  onStart: () => void
  onBack: () => void
}


export default function LessonPlan({ topic, lessons, onStart, onBack }: LessonPlanProps) {
  const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-6 pb-0">
        <button 
          onClick={onBack}
          className="mb-4 p-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Learning Path</h1>
          <p className="text-gray-600">{topic}</p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-2">
            <Clock className="w-4 h-4" />
            {totalDuration} minutes total
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="max-w-md mx-auto space-y-3">
          {lessons.map((lesson, index) => {
            const isExpanded = expandedLessons.has(lesson.id)
            return (
              <button
                key={lesson.id} 
                onClick={() => toggleLesson(lesson.id)}
                className="w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-lg">{lesson.title}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-500 text-sm">{lesson.duration}m</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`text-sm text-gray-600 mt-1 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                      {lesson.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={onStart}
            className="w-full h-16 text-xl rounded-2xl bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
          >
            <PlayCircle className="w-6 h-6" />
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  )
}
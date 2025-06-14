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
  onStart: () => void
  onBack: () => void
}

// Mock data for lessons with descriptions
const mockLessons: Lesson[] = [
  { 
    id: "1", 
    title: "Introduction", 
    description: "We'll start with a gentle introduction to the topic, setting the foundation for everything that follows. This lesson covers the basic terminology, key concepts, and why this topic matters in today's world.",
    duration: 3 
  },
  { 
    id: "2", 
    title: "Core Concepts", 
    description: "Dive deep into the fundamental principles that govern this subject. We'll explore the essential theories, models, and frameworks that experts use to understand and work with these ideas.",
    duration: 5 
  },
  { 
    id: "3", 
    title: "Real Examples", 
    description: "See how these concepts apply in real-world scenarios through practical examples and case studies. You'll understand how professionals use this knowledge to solve actual problems.",
    duration: 4 
  },
  { 
    id: "4", 
    title: "Common Mistakes", 
    description: "Learn about the most frequent errors people make when learning this topic and how to avoid them. We'll clarify common misconceptions and provide clear guidance on the right approach.",
    duration: 3 
  },
  { 
    id: "5", 
    title: "Advanced Tips", 
    description: "Take your understanding to the next level with sophisticated techniques and expert strategies. This lesson covers nuanced approaches that separate beginners from advanced practitioners.",
    duration: 5 
  },
  { 
    id: "6", 
    title: "History & Context", 
    description: "Understand how this field evolved over time and the key figures who shaped it. We'll explore the historical context that led to current practices and future directions.",
    duration: 4 
  },
  { 
    id: "7", 
    title: "Future Trends", 
    description: "Look ahead to emerging developments and where this field is heading. We'll discuss cutting-edge research, upcoming technologies, and how to stay current with rapid changes.",
    duration: 3 
  },
  { 
    id: "8", 
    title: "Practice Time", 
    description: "Apply what you've learned through interactive exercises and thought experiments. This hands-on session helps reinforce your understanding and build practical skills.",
    duration: 5 
  },
  { 
    id: "9", 
    title: "Expert Insights", 
    description: "Gain wisdom from leading professionals in the field through curated insights and best practices. Learn the tips and tricks that only come from years of experience.",
    duration: 4 
  },
  { 
    id: "10", 
    title: "Summary", 
    description: "Review the key takeaways from your learning journey and get guidance on next steps. We'll consolidate your knowledge and provide resources for continued learning.",
    duration: 3 
  }
]

export default function LessonPlan({ topic, depth, onStart, onBack }: LessonPlanProps) {
  const totalDuration = mockLessons.reduce((sum, lesson) => sum + lesson.duration, 0)
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
          {mockLessons.map((lesson, index) => {
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
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-3"
          >
            <PlayCircle className="w-6 h-6" />
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  )
}
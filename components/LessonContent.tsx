"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import AudioPlayer from "./AudioPlayer"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number
}

interface LessonContentProps {
  lessons: Lesson[]
  currentLessonIndex: number
  topic: string
  depth: string
  onBack: () => void
}

export default function LessonContent({ 
  lessons, 
  currentLessonIndex, 
  topic, 
  depth, 
  onBack 
}: LessonContentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [lessonContent, setLessonContent] = useState<string>("")
  const [isGeneratingContent, setIsGeneratingContent] = useState(true)
  const [contentError, setContentError] = useState("")
  
  const currentLesson = lessons[currentLessonIndex]
  const duration = currentLesson?.duration * 60 || 0 // Convert minutes to seconds
  
  const handlePlayPause = () => {
    console.log('🎵 Play/Pause toggled:', !isPlaying)
    setIsPlaying(!isPlaying)
  }
  
  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      console.log('⏮️ Previous lesson:', currentLessonIndex - 1)
      // TODO: Navigate to previous lesson
    }
  }
  
  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      console.log('⏭️ Next lesson:', currentLessonIndex + 1)
      // TODO: Navigate to next lesson
    }
  }
  
  const handleSeek = (time: number) => {
    console.log('🎯 Seeking to:', time)
    setCurrentTime(time)
  }
  
  const generateLessonContent = async () => {
    console.log('📝 Generating content for lesson:', currentLesson.title)
    setIsGeneratingContent(true)
    setContentError("")
    
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          depth,
          lessonTitle: currentLesson.title,
          lessonDescription: currentLesson.description,
          duration: currentLesson.duration
        }),
      })
      
      console.log('📡 Content API response status:', response.status)
      
      if (!response.ok) {
        throw new Error("Failed to generate lesson content")
      }
      
      const data = await response.json()
      console.log('✅ Received lesson content:', data.content.substring(0, 100) + '...')
      
      setLessonContent(data.content)
      setIsGeneratingContent(false)
    } catch (err) {
      console.error('💥 Error generating lesson content:', err)
      setContentError("Failed to generate lesson content. Please try again.")
      setIsGeneratingContent(false)
    }
  }
  
  useEffect(() => {
    if (currentLesson) {
      generateLessonContent()
    }
  }, [currentLessonIndex])
  
  // Mock audio playback progress (will be replaced with actual audio)
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }
          return prev + 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isPlaying, duration])
  
  if (!currentLesson) {
    return <div>No lesson found</div>
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white pb-32">
      <div className="p-6">
        <button 
          onClick={onBack}
          className="mb-4 p-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="max-w-md mx-auto space-y-6">
          {/* Lesson Header */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500">
              Lesson {currentLessonIndex + 1} of {lessons.length}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentLesson.title}
            </h1>
          </div>
          
          {/* Lesson Description */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-2">What you'll learn:</h2>
            <p className="text-gray-700 leading-relaxed">
              {currentLesson.description}
            </p>
          </div>
          
          {/* Lesson Content */}
          <div className="space-y-4">
            {isGeneratingContent ? (
              <div className="flex items-center justify-center py-8 space-x-3">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-gray-600">Generating lesson content...</span>
              </div>
            ) : contentError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-600 text-center">{contentError}</p>
                <button 
                  onClick={generateLessonContent}
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-6">
                <div className="prose prose-sm max-w-none">
                  {lessonContent.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Audio Player */}
      <AudioPlayer
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onPrevious={handlePrevious}
        onNext={handleNext}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        canGoPrev={currentLessonIndex > 0}
        canGoNext={currentLessonIndex < lessons.length - 1}
        hasAudio={false}
      />
    </div>
  )
}
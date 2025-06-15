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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  
  const currentLesson = lessons[currentLessonIndex]
  
  const handlePlayPause = () => {
    if (!audioElement) return
    
    console.log('🎵 Play/Pause toggled:', !isPlaying)
    
    if (isPlaying) {
      audioElement.pause()
    } else {
      audioElement.play()
    }
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
    if (!audioElement) return
    
    console.log('🎯 Seeking to:', time)
    audioElement.currentTime = time
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
      
      // Start generating audio once content is ready
      generateLessonAudio(data.content)
    } catch (err) {
      console.error('💥 Error generating lesson content:', err)
      setContentError("Failed to generate lesson content. Please try again.")
      setIsGeneratingContent(false)
    }
  }
  
  const generateLessonAudio = async (content: string) => {
    console.log('🎤 Generating audio for lesson content...')
    setIsGeneratingAudio(true)
    
    try {
      const response = await fetch("/api/generate-lesson-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          sampleRate: "22050"
        }),
      })
      
      console.log('📡 Audio API response status:', response.status)
      
      if (!response.ok) {
        throw new Error("Failed to generate audio")
      }
      
      // Get the audio blob
      const audioBlob = await response.blob()
      console.log('✅ Received audio blob:', audioBlob.size, 'bytes')
      
      // Create object URL for the audio
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioUrl(audioUrl)
      
      // Create and setup audio element
      const audio = new Audio(audioUrl)
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log('🎵 Audio loaded, duration:', audio.duration, 'seconds')
        setIsGeneratingAudio(false)
      })
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
      
      audio.addEventListener('play', () => {
        setIsPlaying(true)
      })
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false)
      })
      
      setAudioElement(audio)
      
    } catch (err) {
      console.error('💥 Error generating audio:', err)
      setIsGeneratingAudio(false)
    }
  }
  
  useEffect(() => {
    if (currentLesson) {
      // Reset audio state for new lesson
      setAudioUrl("")
      setAudioElement(null)
      setCurrentTime(0)
      setIsPlaying(false)
      setIsGeneratingAudio(false)
      
      generateLessonContent()
    }
  }, [currentLessonIndex])
  
  // Cleanup audio URL when component unmounts or lesson changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])
  
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
        duration={audioElement?.duration || 0}
        onSeek={handleSeek}
        canGoPrev={currentLessonIndex > 0}
        canGoNext={currentLessonIndex < lessons.length - 1}
        hasAudio={!!audioElement}
        isGeneratingAudio={isGeneratingAudio}
      />
    </div>
  )
}
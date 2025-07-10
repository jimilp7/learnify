"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import AudioPlayer from "./AudioPlayer"
import logger from "@/lib/logger"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number
}

interface LessonContentProps {
  lessons: Lesson[]
  currentLessonIndex: number
  lessonContent: string
  onBack: () => void
  onNext: () => void
  onPrevious: () => void
  onSelectLesson?: (index: number) => void
  onStartOver: () => void
}

export default function LessonContent({ 
  lessons, 
  currentLessonIndex,
  lessonContent,
  onBack,
  onNext,
  onPrevious,
  onSelectLesson,
  onStartOver
}: LessonContentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(true)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const [, setAudioElements] = useState<HTMLAudioElement[]>([])
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null)
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [generatedParagraphCount, setGeneratedParagraphCount] = useState(0)
  
  const currentLesson = lessons[currentLessonIndex]
  
  const handlePlayPause = () => {
    if (!currentAudioElement) return
    
    logger.info('🎵 Play/Pause toggled:', { isPlaying: !isPlaying })
    
    if (isPlaying) {
      currentAudioElement.pause()
    } else {
      currentAudioElement.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleStartOver = () => {
    logger.info('🔁 Starting over - going back to topic selection')
    // Stop current audio
    if (currentAudioElement) {
      currentAudioElement.pause()
      setIsPlaying(false)
    }
    // Clean up audio URLs
    audioUrls.forEach(url => URL.revokeObjectURL(url))
    // Navigate back to topic selection
    onStartOver()
  }
  
  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      logger.info('⏮️ Previous lesson:', { prevLessonIndex: currentLessonIndex - 1 })
      // Stop current audio
      if (currentAudioElement) {
        currentAudioElement.pause()
        setIsPlaying(false)
      }
      // Clean up audio URLs
      audioUrls.forEach(url => URL.revokeObjectURL(url))
      // Navigate to previous lesson
      onPrevious()
    }
  }
  
  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      logger.info('⏭️ Next lesson:', { nextLessonIndex: currentLessonIndex + 1 })
      // Stop current audio
      if (currentAudioElement) {
        currentAudioElement.pause()
        setIsPlaying(false)
      }
      // Clean up audio URLs
      audioUrls.forEach(url => URL.revokeObjectURL(url))
      // Navigate to next lesson
      onNext()
    }
  }
  
  
  
  const generateParagraphAudio = useCallback(async (paragraphs: string[]) => {
    logger.info('🎤 Generating audio for paragraphs:', { paragraphCount: paragraphs.length })
    setIsGeneratingAudio(true)
    
    const newAudioUrls: string[] = []
    const newAudioElements: HTMLAudioElement[] = []
    let currentPlayingIndex = 0
    
    const playNextSegment = () => {
      currentPlayingIndex++
      if (currentPlayingIndex < newAudioElements.length) {
        logger.info('🎵 Playing audio segment:', { current: currentPlayingIndex + 1, total: newAudioElements.length })
        setCurrentAudioIndex(currentPlayingIndex)
        setCurrentAudioElement(newAudioElements[currentPlayingIndex])
        newAudioElements[currentPlayingIndex].play().catch(err => {
          logger.error('⚠️ Failed to play next audio:', { error: err })
        })
      } else {
        logger.info('🎵 All audio segments completed')
        setIsPlaying(false)
      }
    }
    
    try {
      for (let i = 0; i < paragraphs.length; i++) {
        logger.info('🎤 Generating audio for paragraph:', { current: i + 1, total: paragraphs.length })
        
        const response = await fetch("/api/generate-lesson-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: paragraphs[i],
            sampleRate: "22050"
          }),
        })
        
        logger.info('📡 Audio API response status for paragraph:', { paragraphIndex: i + 1, status: response.status })
        
        if (!response.ok) {
          throw new Error(`Failed to generate audio for paragraph ${i + 1}`)
        }
        
        // Get the audio blob
        const audioBlob = await response.blob()
        logger.info('✅ Received audio blob for paragraph:', { paragraphIndex: i + 1, size: audioBlob.size })
        
        // Create object URL for the audio
        const audioUrl = URL.createObjectURL(audioBlob)
        newAudioUrls.push(audioUrl)
        
        // Create audio element
        const audio = new Audio(audioUrl)
        
        // Set up event listeners
        audio.addEventListener('ended', () => {
          logger.info('🎵 Audio segment ended:', { segmentIndex: i + 1 })
          playNextSegment()
        })
        
        audio.addEventListener('play', () => {
          setIsPlaying(true)
        })
        
        audio.addEventListener('pause', () => {
          setIsPlaying(false)
        })
        
        newAudioElements.push(audio)
        
        // Update generated count
        setGeneratedParagraphCount(i + 1)
        
        // For the first audio, set it as current
        if (i === 0) {
          setCurrentAudioElement(audio)
          setCurrentAudioIndex(0) // Ensure first paragraph is highlighted
          
          audio.addEventListener('loadedmetadata', () => {
            logger.info('🎵 First audio loaded:', { duration: audio.duration })
          })
          
          // Continue generating remaining audio in background
          if (paragraphs.length > 1) {
            setIsGeneratingAudio(false) // Hide generating status after first audio
          }
        }
      }
      
      // Update state with all generated audio
      setAudioUrls(newAudioUrls)
      setAudioElements(newAudioElements)
      
      logger.info('✅ All paragraph audio generated successfully')
      setIsGeneratingAudio(false)
      
    } catch (err) {
      logger.error('💥 Error generating paragraph audio:', { error: err })
      setIsGeneratingAudio(false)
    }
  }, [])
  
  
  useEffect(() => {
    if (currentLesson && lessonContent) {
      // Clean up previous audio
      if (currentAudioElement) {
        currentAudioElement.pause()
      }
      audioUrls.forEach(url => URL.revokeObjectURL(url))
      
      // Reset audio state
      setAudioUrls([])
      setAudioElements([])
      setCurrentAudioElement(null)
      setCurrentAudioIndex(0)
      setIsPlaying(false)
      setGeneratedParagraphCount(0)
      setIsGeneratingAudio(true)
      
      // Split content into paragraphs and start generating audio
      const contentParagraphs = lessonContent
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      logger.info('📝 Split content into paragraphs:', { paragraphCount: contentParagraphs.length })
      setParagraphs(contentParagraphs)
      
      // Start generating audio for all paragraphs
      generateParagraphAudio(contentParagraphs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex, lessonContent, currentLesson, generateParagraphAudio])
  
  // Cleanup audio URLs when component unmounts or lesson changes
  useEffect(() => {
    return () => {
      audioUrls.forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [audioUrls])
  
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
            <h2 className="font-semibold text-gray-900 mb-2">What you&apos;ll learn:</h2>
            <p className="text-gray-700 leading-relaxed">
              {currentLesson.description}
            </p>
          </div>
          
          {/* Generating Audio Status */}
          {isGeneratingAudio && (
            <div className="flex items-center justify-center py-2">
              <span className="text-sm text-gray-500">Generating audio...</span>
            </div>
          )}
          
          {/* Lesson Content */}
          <div className="-mt-2">
            <div className="rounded-2xl p-6">
              <div className="prose prose-sm max-w-none">
                {paragraphs.map((paragraph, index) => (
                  <p 
                    key={index} 
                    className={`mb-4 leading-relaxed transition-all duration-300 ${
                      index === currentAudioIndex && isPlaying
                        ? 'text-gray-900 font-medium bg-blue-50 -mx-3 px-3 py-2 rounded-lg'
                        : index < generatedParagraphCount
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Player */}
      <AudioPlayer
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onStartOver={handleStartOver}
        canGoPrev={currentLessonIndex > 0}
        canGoNext={currentLessonIndex < lessons.length - 1}
        hasAudio={!!currentAudioElement}
        lessons={lessons}
        currentLessonIndex={currentLessonIndex}
        onSelectLesson={onSelectLesson}
      />
    </div>
  )
}
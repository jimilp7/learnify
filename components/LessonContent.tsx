"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
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
  const [audioError, setAudioError] = useState<string>("")
  const [retryCount, setRetryCount] = useState(0)
  const [skipAudio, setSkipAudio] = useState(false)
  
  const currentLesson = lessons[currentLessonIndex]
  
  const handlePlayPause = () => {
    if (!currentAudioElement) return
    
    console.log('🎵 Play/Pause toggled:', !isPlaying)
    
    if (isPlaying) {
      currentAudioElement.pause()
    } else {
      currentAudioElement.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleStartOver = () => {
    console.log('🔁 Starting over - going back to topic selection')
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
      console.log('⏮️ Previous lesson:', currentLessonIndex - 1)
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
      console.log('⏭️ Next lesson:', currentLessonIndex + 1)
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
  
  
  
  const generateParagraphAudio = useCallback(async (paragraphs: string[], isRetry: boolean = false) => {
    console.log('🎤 Generating audio for', paragraphs.length, 'paragraphs...')
    setIsGeneratingAudio(true)
    setAudioError("")
    
    if (!isRetry) {
      setRetryCount(0)
    }
    
    const newAudioUrls: string[] = []
    const newAudioElements: HTMLAudioElement[] = []
    let currentPlayingIndex = 0
    
    const playNextSegment = () => {
      currentPlayingIndex++
      if (currentPlayingIndex < newAudioElements.length) {
        console.log(`🎵 Playing audio segment ${currentPlayingIndex + 1}/${newAudioElements.length}`)
        setCurrentAudioIndex(currentPlayingIndex)
        setCurrentAudioElement(newAudioElements[currentPlayingIndex])
        newAudioElements[currentPlayingIndex].play().catch(err => {
          console.error('⚠️ Failed to play next audio:', err)
        })
      } else {
        console.log('🎵 All audio segments completed')
        setIsPlaying(false)
      }
    }
    
    try {
      for (let i = 0; i < paragraphs.length; i++) {
        console.log(`🎤 Generating audio for paragraph ${i + 1}/${paragraphs.length}`)
        
        let retryAttempt = 0
        const maxRetries = 3
        let success = false
        
        while (!success && retryAttempt < maxRetries) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
            
            const response = await fetch("/api/generate-lesson-audio", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: paragraphs[i],
                sampleRate: "22050"
              }),
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            console.log(`📡 Audio API response status for paragraph ${i + 1}:`, response.status)
            
            if (!response.ok) {
              throw new Error(`Audio generation failed with status ${response.status}`)
            }
            
            // Get the audio blob
            const audioBlob = await response.blob()
            
            if (audioBlob.size === 0) {
              throw new Error('Empty audio blob received')
            }
            
            console.log(`✅ Received audio blob for paragraph ${i + 1}:`, audioBlob.size, 'bytes')
            
            // Create object URL for the audio
            const audioUrl = URL.createObjectURL(audioBlob)
            newAudioUrls.push(audioUrl)
            
            // Create audio element
            const audio = new Audio(audioUrl)
            
            // Set up event listeners with error handling
            audio.addEventListener('ended', () => {
              console.log(`🎵 Audio segment ${i + 1} ended`)
              playNextSegment()
            })
            
            audio.addEventListener('play', () => {
              setIsPlaying(true)
            })
            
            audio.addEventListener('pause', () => {
              setIsPlaying(false)
            })
            
            audio.addEventListener('error', (e) => {
              console.error(`🔴 Audio playback error for segment ${i + 1}:`, e)
              setAudioError(`Audio playback failed for segment ${i + 1}`)
            })
            
            newAudioElements.push(audio)
            success = true
            
            // Update generated count
            setGeneratedParagraphCount(i + 1)
            
            // For the first audio, set it as current
            if (i === 0) {
              setCurrentAudioElement(audio)
              setCurrentAudioIndex(0)
              
              audio.addEventListener('loadedmetadata', () => {
                console.log('🎵 First audio loaded, duration:', audio.duration, 'seconds')
              })
              
              // Continue generating remaining audio in background
              if (paragraphs.length > 1) {
                setIsGeneratingAudio(false)
              }
            }
            
          } catch (fetchError: unknown) {
            retryAttempt++
            console.warn(`⚠️ Attempt ${retryAttempt}/${maxRetries} failed for paragraph ${i + 1}:`, (fetchError as Error).message)
            
            if (retryAttempt < maxRetries) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryAttempt) * 1000))
            } else {
              // All retries failed, throw error
              throw new Error(`Failed to generate audio after ${maxRetries} attempts: ${(fetchError as Error).message}`)
            }
          }
        }
      }
      
      // Update state with all generated audio
      setAudioUrls(newAudioUrls)
      setAudioElements(newAudioElements)
      
      console.log('✅ All paragraph audio generated successfully')
      setIsGeneratingAudio(false)
      setAudioError("")
      
    } catch (err: unknown) {
      console.error('💥 Error generating paragraph audio:', err)
      setIsGeneratingAudio(false)
      setAudioError((err as Error).message || 'Audio generation failed')
    }
  }, [])
  
  const handleRetryAudio = () => {
    console.log('🔄 Retrying audio generation...')
    setRetryCount(prev => prev + 1)
    if (paragraphs.length > 0) {
      generateParagraphAudio(paragraphs, true)
    }
  }
  
  const handleSkipAudio = () => {
    console.log('⏭️ Skipping audio generation...')
    setSkipAudio(true)
    setIsGeneratingAudio(false)
    setAudioError("")
    // Set all paragraphs as "generated" for visual purposes
    setGeneratedParagraphCount(paragraphs.length)
  }
  
  useEffect(() => {
    if (currentLesson && lessonContent && !skipAudio) {
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
      setAudioError("")
      setSkipAudio(false)
      
      // Split content into paragraphs and start generating audio
      const contentParagraphs = lessonContent
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      console.log('📝 Split content into', contentParagraphs.length, 'paragraphs')
      setParagraphs(contentParagraphs)
      
      // Start generating audio for all paragraphs
      generateParagraphAudio(contentParagraphs)
    } else if (currentLesson && lessonContent && skipAudio) {
      // Just display content without audio
      const contentParagraphs = lessonContent
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      setParagraphs(contentParagraphs)
      setGeneratedParagraphCount(contentParagraphs.length)
      setIsGeneratingAudio(false)
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
          {isGeneratingAudio && !audioError && (
            <div className="flex items-center justify-center py-2">
              <span className="text-sm text-gray-500">Generating audio...</span>
            </div>
          )}
          
          {/* Audio Error State */}
          {audioError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    Audio Generation Failed
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    {audioError}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleRetryAudio}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      disabled={isGeneratingAudio}
                    >
                      {isGeneratingAudio ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount + 1})` : ''}`}
                    </button>
                    <button
                      onClick={handleSkipAudio}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Continue Reading
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Skip Audio Notice */}
          {skipAudio && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <p className="text-sm text-blue-700">
                  Reading mode - Audio playback is disabled for this lesson.
                </p>
              </div>
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
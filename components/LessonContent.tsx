"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import AudioPlayer from "./AudioPlayer"
import ErrorBoundary from "./ErrorBoundary"

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

interface AudioError {
  type: 'network' | 'api' | 'unknown'
  message: string
  paragraphIndex?: number
  retryable: boolean
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
  const [audioError, setAudioError] = useState<AudioError | null>(null)
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
  
  const generateParagraphAudio = useCallback(async (paragraphs: string[], isRetry = false) => {
    console.log('🎤 Generating audio for', paragraphs.length, 'paragraphs...', isRetry ? '(retry)' : '')
    setIsGeneratingAudio(true)
    setAudioError(null)
    
    if (skipAudio) {
      console.log('⏭️ Skipping audio generation as requested by user')
      setIsGeneratingAudio(false)
      return
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
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        try {
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
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate audio`)
          }
          
          // Get the audio blob
          const audioBlob = await response.blob()
          console.log(`✅ Received audio blob for paragraph ${i + 1}:`, audioBlob.size, 'bytes')
          
          // Validate audio blob
          if (audioBlob.size === 0) {
            throw new Error('Received empty audio response')
          }
          
          // Create object URL for the audio
          const audioUrl = URL.createObjectURL(audioBlob)
          newAudioUrls.push(audioUrl)
          
          // Create audio element
          const audio = new Audio(audioUrl)
          
          // Set up event listeners
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
            console.error(`🚫 Audio element error for paragraph ${i + 1}:`, e)
          })
          
          newAudioElements.push(audio)
          
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
          clearTimeout(timeoutId)
          
          // Determine error type
          let errorType: AudioError['type'] = 'unknown'
          let retryable = true
          let errorMessage = 'Failed to generate audio'
          
          if (fetchError instanceof Error) {
            errorMessage = fetchError.message
            if (fetchError.name === 'AbortError') {
              errorType = 'network'
              errorMessage = 'Request timed out. Please check your connection.'
            } else if (fetchError.message.includes('fetch')) {
              errorType = 'network'
            } else if (fetchError.message.includes('HTTP')) {
              errorType = 'api'
              retryable = !fetchError.message.includes('400') && !fetchError.message.includes('401')
            }
          }
          
          throw {
            type: errorType,
            message: errorMessage,
            paragraphIndex: i,
            retryable
          } as AudioError
        }
      }
      
      // Update state with all generated audio
      setAudioUrls(newAudioUrls)
      setAudioElements(newAudioElements)
      
      console.log('✅ All paragraph audio generated successfully')
      setIsGeneratingAudio(false)
      setRetryCount(0) // Reset retry count on success
      
    } catch (err: unknown) {
      console.error('💥 Error generating paragraph audio:', err)
      setIsGeneratingAudio(false)
      
      // Set appropriate error state
      const audioError: AudioError = (err && typeof err === 'object' && 'type' in err) ? err as AudioError : {
        type: 'unknown',
        message: (err instanceof Error ? err.message : 'An unexpected error occurred while generating audio'),
        retryable: true
      }
      
      setAudioError(audioError)
      
      // Clean up any partial audio URLs
      newAudioUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [skipAudio])
  
  const handleRetryAudio = () => {
    console.log('🔄 Retrying audio generation...')
    setRetryCount(prev => prev + 1)
    setAudioError(null)
    generateParagraphAudio(paragraphs, true)
  }
  
  const handleSkipAudio = () => {
    console.log('⏭️ User chose to skip audio generation')
    setSkipAudio(true)
    setAudioError(null)
    setIsGeneratingAudio(false)
  }
  
  const handleResetAudio = () => {
    console.log('🔄 Resetting audio state and retrying...')
    setSkipAudio(false)
    setRetryCount(0)
    setAudioError(null)
    
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
    
    // Retry audio generation
    generateParagraphAudio(paragraphs, true)
  }
  
  useEffect(() => {
    if (currentLesson && lessonContent) {
      // Clean up previous audio
      if (currentAudioElement) {
        currentAudioElement.pause()
      }
      audioUrls.forEach(url => URL.revokeObjectURL(url))
      
      // Reset all audio and error state
      setAudioUrls([])
      setAudioElements([])
      setCurrentAudioElement(null)
      setCurrentAudioIndex(0)
      setIsPlaying(false)
      setGeneratedParagraphCount(0)
      setIsGeneratingAudio(true)
      setAudioError(null)
      setRetryCount(0)
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
          
          {/* Audio Generation Status & Errors */}
          {isGeneratingAudio && !audioError && (
            <div className="flex items-center justify-center py-2">
              <span className="text-sm text-gray-500">Generating audio...</span>
            </div>
          )}
          
          {audioError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-medium text-red-900">
                    {audioError.type === 'network' ? 'Connection Problem' : 
                     audioError.type === 'api' ? 'Audio Service Error' : 
                     'Audio Generation Failed'}
                  </h3>
                  <p className="text-sm text-red-700">
                    {audioError.message}
                  </p>
                  {audioError.paragraphIndex !== undefined && (
                    <p className="text-xs text-red-600">
                      Error occurred at paragraph {audioError.paragraphIndex + 1}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-1">
                {audioError.retryable && retryCount < 3 && (
                  <button
                    onClick={handleRetryAudio}
                    className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry ({3 - retryCount} left)
                  </button>
                )}
                <button
                  onClick={handleSkipAudio}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Skip Audio
                </button>
                <button
                  onClick={handleResetAudio}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          
          {skipAudio && !audioError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Audio skipped</span>
                </div>
                <button
                  onClick={handleResetAudio}
                  className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors"
                >
                  Enable Audio
                </button>
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
      
      {/* Audio Player with Error Boundary */}
      <ErrorBoundary
        fallback={
          <div className="fixed bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 p-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Audio player error</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        }
      >
        <AudioPlayer
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onStartOver={handleStartOver}
          canGoPrev={currentLessonIndex > 0}
          canGoNext={currentLessonIndex < lessons.length - 1}
          hasAudio={!!currentAudioElement && !skipAudio}
          lessons={lessons}
          currentLessonIndex={currentLessonIndex}
          onSelectLesson={onSelectLesson}
        />
      </ErrorBoundary>
    </div>
  )
}
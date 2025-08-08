"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, AlertCircle, RefreshCw, SkipForward } from "lucide-react"
import AudioPlayer from "./AudioPlayer"
import { useAudioApiWithRetry } from "@/lib/useApiWithRetry"

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
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const [, setAudioElements] = useState<HTMLAudioElement[]>([])
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null)
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [generatedParagraphCount, setGeneratedParagraphCount] = useState(0)
  const [audioSkipped, setAudioSkipped] = useState(false)
  const [failedParagraphs, setFailedParagraphs] = useState<Set<number>>(new Set())
  
  const audioApi = useAudioApiWithRetry()
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
  
  
  
  const handleRetryAudio = useCallback(() => {
    console.log('🔄 Retrying audio generation...')
    audioApi.reset()
    setFailedParagraphs(new Set())
    setAudioSkipped(false)
    generateParagraphAudio(paragraphs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphs, audioApi])

  const handleSkipAudio = useCallback(() => {
    console.log('⏭️ Skipping audio generation')
    setAudioSkipped(true)
    audioApi.reset()
  }, [audioApi])

  const generateParagraphAudio = useCallback(async (paragraphs: string[]) => {
    if (paragraphs.length === 0) return
    
    console.log('🎤 Generating audio for', paragraphs.length, 'paragraphs...')
    
    const newAudioUrls: string[] = []
    const newAudioElements: HTMLAudioElement[] = []
    const newFailedParagraphs = new Set<number>()
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
    
    for (let i = 0; i < paragraphs.length; i++) {
      try {
        console.log(`🎤 Generating audio for paragraph ${i + 1}/${paragraphs.length}`)
        
        const audioBlob = await audioApi.generateAudio(paragraphs[i], "22050", {
          maxRetries: 2,
          baseDelay: 1500,
          maxDelay: 6000
        })
        
        console.log(`✅ Received audio blob for paragraph ${i + 1}:`, audioBlob.size, 'bytes')
        
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
        }
        
      } catch (err) {
        console.error(`💥 Failed to generate audio for paragraph ${i + 1}:`, err)
        newFailedParagraphs.add(i)
        
        // Add a placeholder for failed audio to maintain indexing
        newAudioUrls.push('')
        newAudioElements.push(new Audio()) // Empty audio element
      }
    }
    
    // Update state with generated audio
    setAudioUrls(newAudioUrls)
    setAudioElements(newAudioElements)
    setFailedParagraphs(newFailedParagraphs)
    
    const successCount = paragraphs.length - newFailedParagraphs.size
    console.log(`✅ Audio generation completed: ${successCount}/${paragraphs.length} paragraphs successful`)
    
  }, [audioApi])
  
  
  useEffect(() => {
    if (currentLesson && lessonContent) {
      // Clean up previous audio
      if (currentAudioElement) {
        currentAudioElement.pause()
      }
      audioUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
      
      // Reset audio state
      setAudioUrls([])
      setAudioElements([])
      setCurrentAudioElement(null)
      setCurrentAudioIndex(0)
      setIsPlaying(false)
      setGeneratedParagraphCount(0)
      setAudioSkipped(false)
      setFailedParagraphs(new Set())
      audioApi.reset()
      
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
  }, [currentLessonIndex, lessonContent, currentLesson])
  
  // Cleanup audio URLs when component unmounts or lesson changes
  useEffect(() => {
    return () => {
      audioUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
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
          
          {/* Audio Status and Error Handling */}
          {audioApi.isLoading && !audioSkipped && (
            <div className="flex items-center justify-center py-4">
              <div className="text-center space-y-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <div className="text-sm text-gray-600">
                  {audioApi.isRetrying 
                    ? `Retrying audio generation... (attempt ${audioApi.retryCount + 1})`
                    : 'Generating audio...'
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Audio Generation Error */}
          {audioApi.error && !audioSkipped && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-1">Audio Generation Failed</h3>
                  <p className="text-sm text-red-700 mb-3">
                    {audioApi.error.error || 'Failed to generate audio for this lesson.'}
                  </p>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleRetryAudio}
                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                    <button
                      onClick={handleSkipAudio}
                      className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Skip Audio & Read</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Audio Skipped Notice */}
          {audioSkipped && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <SkipForward className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-1">Audio Skipped</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    You can still read the lesson content below. Audio can be retried anytime.
                  </p>
                  <button
                    onClick={handleRetryAudio}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Audio Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Lesson Content */}
          <div className="-mt-2">
            <div className="rounded-2xl p-6">
              <div className="prose prose-sm max-w-none">
                {paragraphs.map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    <p 
                      className={`leading-relaxed transition-all duration-300 ${
                        index === currentAudioIndex && isPlaying
                          ? 'text-gray-900 font-medium bg-blue-50 -mx-3 px-3 py-2 rounded-lg'
                          : failedParagraphs.has(index)
                          ? 'text-gray-700 bg-orange-50 -mx-3 px-3 py-2 rounded-lg border-l-4 border-orange-400'
                          : audioSkipped || index < generatedParagraphCount
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {paragraph}
                    </p>
                    {failedParagraphs.has(index) && (
                      <div className="text-xs text-orange-600 mt-1 ml-3">
                        ⚠️ Audio generation failed for this paragraph
                      </div>
                    )}
                  </div>
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
        hasAudio={!!currentAudioElement && !audioSkipped && !audioApi.error}
        lessons={lessons}
        currentLessonIndex={currentLessonIndex}
        onSelectLesson={onSelectLesson}
      />
    </div>
  )
}
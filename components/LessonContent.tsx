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
  const [paragraphGenerationStatus, setParagraphGenerationStatus] = useState<Record<number, 'pending' | 'generating' | 'ready' | 'error'>>({})
  
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
  
  
  
  const generateSingleParagraphAudio = useCallback(async (
    paragraphText: string,
    paragraphIndex: number,
    audioUrls: string[],
    audioElements: HTMLAudioElement[]
  ): Promise<{ audioUrl: string; audioElement: HTMLAudioElement }> => {
    console.log(`🎤 Generating audio for paragraph ${paragraphIndex + 1}`)
    
    // Update status to generating
    setParagraphGenerationStatus(prev => ({ ...prev, [paragraphIndex]: 'generating' }))
    
    const response = await fetch("/api/generate-lesson-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: paragraphText,
        sampleRate: "22050"
      }),
    })
    
    console.log(`📡 Audio API response status for paragraph ${paragraphIndex + 1}:`, response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to generate audio for paragraph ${paragraphIndex + 1}`)
    }
    
    // Get the audio blob
    const audioBlob = await response.blob()
    console.log(`✅ Received audio blob for paragraph ${paragraphIndex + 1}:`, audioBlob.size, 'bytes')
    
    // Create object URL for the audio
    const audioUrl = URL.createObjectURL(audioBlob)
    
    // Create audio element
    const audio = new Audio(audioUrl)
    
    // Update status to ready
    setParagraphGenerationStatus(prev => ({ ...prev, [paragraphIndex]: 'ready' }))
    
    return { audioUrl, audioElement: audio }
  }, [])

  const generateParagraphAudio = useCallback(async (paragraphs: string[]) => {
    console.log('🎤 Starting audio generation for', paragraphs.length, 'paragraphs...')
    setIsGeneratingAudio(true)
    
    // Initialize status for all paragraphs
    const initialStatus: Record<number, 'pending' | 'generating' | 'ready'> = {}
    paragraphs.forEach((_, index) => {
      initialStatus[index] = 'pending'
    })
    setParagraphGenerationStatus(initialStatus)
    
    const newAudioUrls: string[] = new Array(paragraphs.length)
    const newAudioElements: HTMLAudioElement[] = new Array(paragraphs.length)
    let currentPlayingIndex = 0
    
    const playNextSegment = () => {
      currentPlayingIndex++
      if (currentPlayingIndex < newAudioElements.length && newAudioElements[currentPlayingIndex]) {
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
      // Generate first paragraph audio immediately
      console.log('🚀 Generating first paragraph audio for immediate playback')
      const firstResult = await generateSingleParagraphAudio(paragraphs[0], 0, newAudioUrls, newAudioElements)
      
      newAudioUrls[0] = firstResult.audioUrl
      newAudioElements[0] = firstResult.audioElement
      
      // Set up event listeners for first audio
      firstResult.audioElement.addEventListener('ended', playNextSegment)
      firstResult.audioElement.addEventListener('play', () => setIsPlaying(true))
      firstResult.audioElement.addEventListener('pause', () => setIsPlaying(false))
      
      // Set as current audio element
      setCurrentAudioElement(firstResult.audioElement)
      setCurrentAudioIndex(0)
      setGeneratedParagraphCount(1)
      
      // Update state with first audio
      setAudioUrls([...newAudioUrls])
      setAudioElements([...newAudioElements])
      
      console.log('✅ First paragraph audio ready - user can now start listening!')
      setIsGeneratingAudio(false) // Allow user interaction
      
      // Generate remaining paragraphs in background
      if (paragraphs.length > 1) {
        console.log('🔄 Starting background generation for remaining', paragraphs.length - 1, 'paragraphs')
        
        // Generate remaining paragraphs in background (sequential to avoid API overload)
        const backgroundGeneration = async () => {
          for (let i = 1; i < paragraphs.length; i++) {
            try {
              const result = await generateSingleParagraphAudio(paragraphs[i], i, newAudioUrls, newAudioElements)
              
              newAudioUrls[i] = result.audioUrl
              newAudioElements[i] = result.audioElement
              
              // Set up event listeners
              result.audioElement.addEventListener('ended', playNextSegment)
              result.audioElement.addEventListener('play', () => setIsPlaying(true))
              result.audioElement.addEventListener('pause', () => setIsPlaying(false))
              
              // Update state
              setGeneratedParagraphCount(i + 1)
              setAudioUrls([...newAudioUrls])
              setAudioElements([...newAudioElements])
              
              console.log(`✅ Background audio generation complete for paragraph ${i + 1}`)
              
              // Small delay to prevent API overwhelming
              await new Promise(resolve => setTimeout(resolve, 500))
              
            } catch (err) {
              console.error(`💥 Failed to generate audio for paragraph ${i + 1}:`, err)
              setParagraphGenerationStatus(prev => ({ ...prev, [i]: 'error' }))
            }
          }
          
          console.log('🎉 All background audio generation completed!')
        }
        
        // Start background generation (non-blocking)
        backgroundGeneration()
      }
      
    } catch (err) {
      console.error('💥 Error generating first paragraph audio:', err)
      setIsGeneratingAudio(false)
    }
  }, [generateSingleParagraphAudio])

  const retryParagraphGeneration = useCallback(async (paragraphIndex: number) => {
    if (paragraphIndex >= paragraphs.length) return
    
    console.log(`🔄 Retrying audio generation for paragraph ${paragraphIndex + 1}`)
    
    try {
      const result = await generateSingleParagraphAudio(
        paragraphs[paragraphIndex], 
        paragraphIndex, 
        audioUrls, 
        []
      )
      
      // Update the audio arrays
      const newAudioUrls = [...audioUrls]
      newAudioUrls[paragraphIndex] = result.audioUrl
      
      // Set up event listeners for audio sequencing
      result.audioElement.addEventListener('ended', () => {
        const nextIndex = paragraphIndex + 1
        if (nextIndex < audioUrls.length && audioUrls[nextIndex]) {
          setCurrentAudioIndex(nextIndex)
          setCurrentAudioElement(result.audioElement)
        }
      })
      
      result.audioElement.addEventListener('play', () => setIsPlaying(true))
      result.audioElement.addEventListener('pause', () => setIsPlaying(false))
      
      // Update state
      setAudioUrls(newAudioUrls)
      setGeneratedParagraphCount(prev => Math.max(prev, paragraphIndex + 1))
      
      console.log(`✅ Retry successful for paragraph ${paragraphIndex + 1}`)
    } catch (err) {
      console.error(`💥 Retry failed for paragraph ${paragraphIndex + 1}:`, err)
      setParagraphGenerationStatus(prev => ({ ...prev, [paragraphIndex]: 'error' }))
    }
  }, [paragraphs, audioUrls, generateSingleParagraphAudio])
  
  
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
      setParagraphGenerationStatus({})
      
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
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
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
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-gray-500">Preparing first audio segment...</span>
              </div>
            </div>
          )}
          
          {/* Background Generation Progress */}
          {!isGeneratingAudio && generatedParagraphCount < paragraphs.length && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse rounded-full h-3 w-3 bg-blue-500"></div>
                <span className="text-xs text-gray-400">
                  Generating audio {generatedParagraphCount}/{paragraphs.length}
                </span>
              </div>
            </div>
          )}
          
          {/* Lesson Content */}
          <div className="-mt-2">
            <div className="rounded-2xl p-6">
              <div className="prose prose-sm max-w-none">
                {paragraphs.map((paragraph, index) => {
                  const status = paragraphGenerationStatus[index] || 'pending'
                  const isCurrentlyPlaying = index === currentAudioIndex && isPlaying
                  const isReady = status === 'ready'
                  const isGenerating = status === 'generating'
                  const hasError = status === 'error'
                  
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex items-start space-x-3">
                        {/* Status Indicator */}
                        <div className="flex-shrink-0 mt-1">
                          {isCurrentlyPlaying ? (
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          ) : isReady ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          ) : isGenerating ? (
                            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : hasError ? (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          )}
                        </div>
                        
                        {/* Paragraph Content */}
                        <div className="flex-1">
                          <p 
                            className={`leading-relaxed transition-all duration-300 ${
                              isCurrentlyPlaying
                                ? 'text-gray-900 font-medium bg-blue-50 -mx-3 px-3 py-2 rounded-lg'
                                : isReady
                                ? 'text-gray-700'
                                : isGenerating
                                ? 'text-gray-600'
                                : hasError
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {paragraph}
                          </p>
                          
                          {/* Status overlays */}
                          {isGenerating && (
                            <div className="mt-2">
                              <span className="text-xs text-blue-600 inline-flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
                                generating audio...
                              </span>
                            </div>
                          )}
                          
                          {hasError && (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="text-xs text-red-600 flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                                audio generation failed
                              </span>
                              <button
                                onClick={() => retryParagraphGeneration(index)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                retry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
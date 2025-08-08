"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  const [generatedParagraphCount, setGeneratedParagraphCount] = useState(0)
  const [paragraphGenerationStatus, setParagraphGenerationStatus] = useState<Record<number, 'pending' | 'generating' | 'completed' | 'error'>>({})
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map())
  
  const currentLesson = lessons[currentLessonIndex]
  
  // Optimize paragraph splitting with useMemo
  const paragraphs = useMemo(() => {
    if (!lessonContent) return []
    return lessonContent
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }, [lessonContent])
  
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
    // Clean up cached URLs
    audioCache.forEach(url => URL.revokeObjectURL(url))
    setAudioCache(new Map())
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
      // Clean up cached URLs
      audioCache.forEach(url => URL.revokeObjectURL(url))
      setAudioCache(new Map())
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
      // Clean up cached URLs
      audioCache.forEach(url => URL.revokeObjectURL(url))
      setAudioCache(new Map())
      // Navigate to next lesson
      onNext()
    }
  }
  
  // Generate a cache key for a paragraph
  const getCacheKey = useCallback((lessonId: string, paragraphIndex: number): string => {
    return `${lessonId}-${paragraphIndex}`
  }, [])
  
  // Generate audio for a single paragraph
  const generateSingleParagraphAudio = useCallback(async (paragraphText: string, paragraphIndex: number, lessonId: string) => {
    const cacheKey = getCacheKey(lessonId, paragraphIndex)
    
    // Check cache first
    if (audioCache.has(cacheKey)) {
      console.log(`📦 Using cached audio for paragraph ${paragraphIndex + 1}`)
      return audioCache.get(cacheKey)!
    }
    
    console.log(`🎤 Generating audio for paragraph ${paragraphIndex + 1}...`)
    
    try {
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
      
      if (!response.ok) {
        throw new Error(`Failed to generate audio for paragraph ${paragraphIndex + 1}`)
      }
      
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Cache the audio URL
      setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl))
      
      return audioUrl
    } catch (error) {
      console.error(`💥 Error generating audio for paragraph ${paragraphIndex + 1}:`, error)
      throw error
    }
  }, [audioCache, getCacheKey])
  
  // Progressive audio generation - starts with first paragraph, then generates others in background
  const generateParagraphAudio = useCallback(async (paragraphs: string[], lessonId: string) => {
    console.log('🎤 Starting progressive audio generation for', paragraphs.length, 'paragraphs...')
    setIsGeneratingAudio(true)
    
    const newAudioUrls: string[] = []
    const newAudioElements: HTMLAudioElement[] = []
    let currentPlayingIndex = 0
    let isMounted = true
    
    // Initialize generation status for all paragraphs
    const initialStatus: Record<number, 'pending' | 'generating' | 'completed' | 'error'> = {}
    paragraphs.forEach((_, index) => {
      initialStatus[index] = index === 0 ? 'generating' : 'pending'
    })
    setParagraphGenerationStatus(initialStatus)
    
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
        console.log('🎵 All available audio segments completed')
        setIsPlaying(false)
      }
    }
    
    try {
      // Step 1: Generate ONLY the first paragraph audio initially
      console.log('🎯 Step 1: Generating first paragraph audio for immediate playback...')
      const firstAudioUrl = await generateSingleParagraphAudio(paragraphs[0], 0, lessonId)
      
      // Create first audio element immediately
      const firstAudio = new Audio(firstAudioUrl)
      newAudioUrls[0] = firstAudioUrl
      newAudioElements[0] = firstAudio
      
      // Set up event listeners for first audio
      firstAudio.addEventListener('ended', () => {
        console.log('🎵 Audio segment 1 ended')
        playNextSegment()
      })
      
      firstAudio.addEventListener('play', () => {
        setIsPlaying(true)
      })
      
      firstAudio.addEventListener('pause', () => {
        setIsPlaying(false)
      })
      
      // Set first audio as current and ready to play
      if (isMounted) {
        setCurrentAudioElement(firstAudio)
        setCurrentAudioIndex(0)
        setGeneratedParagraphCount(1)
        setIsGeneratingAudio(false) // User can now interact!
        
        // Update status for first paragraph
        setParagraphGenerationStatus(prev => ({ ...prev, 0: 'completed' }))
      }
      
      console.log('✅ First paragraph audio ready! User can now start listening.')
      
      // Step 2: Generate remaining paragraphs in background
      if (paragraphs.length > 1) {
        console.log('🔄 Step 2: Generating remaining paragraphs in background...')
        
        // Generate remaining paragraphs in background
        const backgroundGeneration = async () => {
          for (let i = 1; i < paragraphs.length; i++) {
            if (!isMounted) break // Stop if component unmounted
            
            try {
              // Update status to generating
              if (isMounted) {
                setParagraphGenerationStatus(prev => ({ ...prev, [i]: 'generating' }))
              }
              
              const audioUrl = await generateSingleParagraphAudio(paragraphs[i], i, lessonId)
              
              if (!isMounted) break // Stop if component unmounted during generation
              
              // Create audio element
              const audio = new Audio(audioUrl)
              newAudioUrls[i] = audioUrl
              newAudioElements[i] = audio
              
              // Set up event listeners
              audio.addEventListener('ended', () => {
                console.log(`🎵 Audio segment ${i + 1} ended`)
                playNextSegment()
              })
              
              audio.addEventListener('play', () => {
                if (isMounted) setIsPlaying(true)
              })
              
              audio.addEventListener('pause', () => {
                if (isMounted) setIsPlaying(false)
              })
              
              // Update state
              if (isMounted) {
                setGeneratedParagraphCount(i + 1)
                setParagraphGenerationStatus(prev => ({ ...prev, [i]: 'completed' }))
              }
              
              console.log(`✅ Background generation completed for paragraph ${i + 1}/${paragraphs.length}`)
            } catch (error) {
              console.error(`💥 Background generation failed for paragraph ${i + 1}:`, error)
              if (isMounted) {
                setParagraphGenerationStatus(prev => ({ ...prev, [i]: 'error' }))
              }
            }
          }
          
          console.log('✅ All background paragraph audio generation completed')
        }
        
        // Start background generation (non-blocking)
        backgroundGeneration()
      }
      
      // Update state with initial audio
      if (isMounted) {
        setAudioUrls(newAudioUrls)
        setAudioElements(newAudioElements)
      }
      
      // Return cleanup function
      return () => { isMounted = false }
      
    } catch (err) {
      console.error('💥 Error generating first paragraph audio:', err)
      if (isMounted) {
        setParagraphGenerationStatus(prev => ({ ...prev, 0: 'error' }))
        setIsGeneratingAudio(false)
      }
    }
  }, [generateSingleParagraphAudio])
  
  // Retry failed paragraph generation
  const retryParagraphGeneration = useCallback(async (paragraphIndex: number) => {
    if (paragraphIndex >= paragraphs.length || !currentLesson) return
    
    console.log(`🔄 Retrying generation for paragraph ${paragraphIndex + 1}`)
    setParagraphGenerationStatus(prev => ({ ...prev, [paragraphIndex]: 'generating' }))
    
    try {
      const audioUrl = await generateSingleParagraphAudio(paragraphs[paragraphIndex], paragraphIndex, currentLesson.id)
      
      // Create audio element
      const audio = new Audio(audioUrl)
      
      // Update state
      setAudioUrls(prev => {
        const newUrls = [...prev]
        newUrls[paragraphIndex] = audioUrl
        return newUrls
      })
      
      setAudioElements(prev => {
        const newElements = [...prev]
        newElements[paragraphIndex] = audio
        return newElements
      })
      
      setGeneratedParagraphCount(prev => Math.max(prev, paragraphIndex + 1))
      setParagraphGenerationStatus(prev => ({ ...prev, [paragraphIndex]: 'completed' }))
      
      console.log(`✅ Retry successful for paragraph ${paragraphIndex + 1}`)
    } catch (error) {
      console.error(`💥 Retry failed for paragraph ${paragraphIndex + 1}:`, error)
      setParagraphGenerationStatus(prev => ({ ...prev, [paragraphIndex]: 'error' }))
    }
  }, [paragraphs, currentLesson, generateSingleParagraphAudio])
  
  useEffect(() => {
    if (currentLesson && lessonContent && paragraphs.length > 0) {
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
      
      console.log('📝 Using', paragraphs.length, 'paragraphs for audio generation')
      
      // Start progressive audio generation (first paragraph immediately, others in background)
      const cleanupAudio = generateParagraphAudio(paragraphs, currentLesson.id)
      
      return cleanupAudio
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex, lessonContent, currentLesson, paragraphs, generateParagraphAudio])
  
  // Cleanup audio URLs when component unmounts or lesson changes
  useEffect(() => {
    return () => {
      audioUrls.forEach(url => {
        URL.revokeObjectURL(url)
      })
      audioCache.forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [audioUrls, audioCache])
  
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
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-500">Generating first audio segment...</span>
              </div>
            </div>
          )}
          
          {/* Background Generation Progress */}
          {!isGeneratingAudio && generatedParagraphCount < paragraphs.length && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">
                  Generating remaining audio in background ({generatedParagraphCount}/{paragraphs.length} ready)
                </span>
              </div>
            </div>
          )}
          
          {/* Lesson Content */}
          <div className="-mt-2">
            <div className="rounded-2xl p-6">
              <div className="prose prose-sm max-w-none">
                {paragraphs.map((paragraph, index) => {
                  const status = paragraphGenerationStatus[index]
                  const isCurrentPlaying = index === currentAudioIndex && isPlaying
                  const isGenerated = index < generatedParagraphCount
                  const isGenerating = status === 'generating'
                  const hasError = status === 'error'
                  
                  return (
                    <div key={index} className="mb-4">
                      {/* Paragraph with status indicators */}
                      <div className="relative">
                        <p className={`leading-relaxed transition-all duration-300 ${
                          isCurrentPlaying
                            ? 'text-gray-900 font-medium bg-blue-50 -mx-3 px-3 py-2 rounded-lg'
                            : isGenerated
                            ? 'text-gray-700'
                            : isGenerating
                            ? 'text-gray-500'
                            : hasError
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}>
                          {paragraph}
                        </p>
                        
                        {/* Status indicator */}
                        {isGenerating && (
                          <div className="absolute -right-2 top-2">
                            <div className="animate-spin h-3 w-3 border border-blue-400 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                        
                        {hasError && (
                          <div className="absolute -right-2 top-2">
                            <button
                              onClick={() => retryParagraphGeneration(index)}
                              className="h-6 w-6 bg-red-400 rounded-full animate-pulse hover:bg-red-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors"
                              title={`Retry audio generation for paragraph ${index + 1}`}
                            >
                              ↻
                            </button>
                          </div>
                        )}
                        
                        {isGenerated && !isCurrentPlaying && (
                          <div className="absolute -right-2 top-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Skeleton loader for generating paragraphs */}
                      {!isGenerated && !hasError && (
                        <div className="mt-2 space-y-1">
                          <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                      )}
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
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
  audioCache?: Map<string, string[]>
  setAudioCache?: (cache: Map<string, string[]>) => void
}

export default function LessonContent({ 
  lessons, 
  currentLessonIndex,
  lessonContent,
  onBack,
  onNext,
  onPrevious,
  onSelectLesson,
  onStartOver,
  audioCache = new Map(),
  setAudioCache
}: LessonContentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(true)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const [, setAudioElements] = useState<HTMLAudioElement[]>([])
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null)
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [generatedParagraphCount, setGeneratedParagraphCount] = useState(0)
  const [paragraphGenerationStatus, setParagraphGenerationStatus] = useState<('pending' | 'generating' | 'completed' | 'error')[]>([])
  const [isGeneratingInBackground, setIsGeneratingInBackground] = useState(false)
  
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
  
  
  
  const generateSingleParagraphAudio = useCallback(async (text: string, index: number): Promise<string | null> => {
    try {
      console.log(`🎤 Generating audio for paragraph ${index + 1}...`)
      
      const response = await fetch("/api/generate-lesson-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          sampleRate: "22050"
        }),
      })
      
      console.log(`📡 Audio API response status for paragraph ${index + 1}:`, response.status)
      
      if (!response.ok) {
        throw new Error(`Failed to generate audio for paragraph ${index + 1}`)
      }
      
      const audioBlob = await response.blob()
      console.log(`✅ Received audio blob for paragraph ${index + 1}:`, audioBlob.size, 'bytes')
      
      const audioUrl = URL.createObjectURL(audioBlob)
      return audioUrl
      
    } catch (err) {
      console.error(`💥 Error generating audio for paragraph ${index + 1}:`, err)
      return null
    }
  }, [])
  
  const generateProgressiveAudio = useCallback(async (paragraphs: string[]) => {
    console.log('🎤 Starting progressive audio generation for', paragraphs.length, 'paragraphs...')
    
    const cacheKey = `${currentLessonIndex}-${lessonContent?.slice(0, 100)}` // Use lesson index and content snippet as cache key
    
    const newAudioUrls: string[] = new Array(paragraphs.length)
    const newAudioElements: HTMLAudioElement[] = new Array(paragraphs.length)
    let currentPlayingIndex = 0
    
    const playNextSegment = (fromIndex: number) => {
      if (fromIndex === currentPlayingIndex) {
        currentPlayingIndex++
        if (currentPlayingIndex < newAudioElements.length && newAudioElements[currentPlayingIndex]) {
          console.log(`🎵 Playing audio segment ${currentPlayingIndex + 1}/${paragraphs.length}`)
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
    }
    
    // Check if audio is already cached
    if (audioCache.has(cacheKey)) {
      console.log('📦 Loading audio from cache')
      const cachedUrls = audioCache.get(cacheKey)!
      cachedUrls.forEach((url, index) => {
        if (url) {
          newAudioUrls[index] = url
          const audio = new Audio(url)
          audio.addEventListener('ended', () => playNextSegment(index))
          audio.addEventListener('play', () => setIsPlaying(true))
          audio.addEventListener('pause', () => setIsPlaying(false))
          newAudioElements[index] = audio
        }
      })
      
      setAudioUrls(newAudioUrls.filter(url => url))
      setAudioElements(newAudioElements.filter(element => element))
      setCurrentAudioElement(newAudioElements[0])
      setCurrentAudioIndex(0)
      setGeneratedParagraphCount(paragraphs.length)
      setParagraphGenerationStatus(new Array(paragraphs.length).fill('completed'))
      setIsGeneratingAudio(false)
      return
    }
    
    // Initialize generation status
    const initialStatus: ('pending' | 'generating' | 'completed' | 'error')[] = new Array(paragraphs.length).fill('pending')
    initialStatus[0] = 'generating' // First paragraph is generating
    setParagraphGenerationStatus(initialStatus)
    
    try {
      // Generate first paragraph audio immediately
      setIsGeneratingAudio(true)
      const firstAudioUrl = await generateSingleParagraphAudio(paragraphs[0], 0)
      
      if (firstAudioUrl) {
        newAudioUrls[0] = firstAudioUrl
        const firstAudio = new Audio(firstAudioUrl)
        
        firstAudio.addEventListener('ended', () => {
          console.log('🎵 First audio segment ended')
          playNextSegment(0)
        })
        
        firstAudio.addEventListener('play', () => setIsPlaying(true))
        firstAudio.addEventListener('pause', () => setIsPlaying(false))
        
        newAudioElements[0] = firstAudio
        setCurrentAudioElement(firstAudio)
        setCurrentAudioIndex(0)
        setGeneratedParagraphCount(1)
        
        // Update first paragraph status
        const updatedStatus = [...initialStatus]
        updatedStatus[0] = 'completed'
        setParagraphGenerationStatus(updatedStatus)
        
        console.log('✅ First paragraph audio ready, allowing user to start listening')
        setIsGeneratingAudio(false)
        
        // Start generating remaining paragraphs in background
        if (paragraphs.length > 1) {
          setIsGeneratingInBackground(true)
          
          // Generate remaining paragraphs in background
          for (let i = 1; i < paragraphs.length; i++) {
            // Update status to generating
            setParagraphGenerationStatus(prev => {
              const updated = [...prev]
              updated[i] = 'generating'
              return updated
            })
            
            const audioUrl = await generateSingleParagraphAudio(paragraphs[i], i)
            
            if (audioUrl) {
              newAudioUrls[i] = audioUrl
              const audio = new Audio(audioUrl)
              
              audio.addEventListener('ended', () => {
                console.log(`🎵 Audio segment ${i + 1} ended`)
                playNextSegment(i)
              })
              
              audio.addEventListener('play', () => setIsPlaying(true))
              audio.addEventListener('pause', () => setIsPlaying(false))
              
              newAudioElements[i] = audio
              
              // Update generated count and status
              setGeneratedParagraphCount(i + 1)
              setParagraphGenerationStatus(prev => {
                const updated = [...prev]
                updated[i] = 'completed'
                return updated
              })
              
              console.log(`✅ Background generation completed for paragraph ${i + 1}`)
            } else {
              // Mark as error
              setParagraphGenerationStatus(prev => {
                const updated = [...prev]
                updated[i] = 'error'
                return updated
              })
            }
          }
          
          // Cache the complete audio URLs
          if (setAudioCache) {
            const newCache = new Map(audioCache)
            newCache.set(cacheKey, newAudioUrls.filter(url => url !== undefined))
            setAudioCache(newCache)
          }
          
          setIsGeneratingInBackground(false)
          console.log('✅ All background audio generation completed')
        }
        
        // Update final state
        setAudioUrls(newAudioUrls.filter(url => url !== undefined))
        setAudioElements(newAudioElements.filter(element => element !== undefined))
        
      } else {
        throw new Error('Failed to generate first paragraph audio')
      }
      
    } catch (err) {
      console.error('💥 Error in progressive audio generation:', err)
      setIsGeneratingAudio(false)
      setIsGeneratingInBackground(false)
      setParagraphGenerationStatus(prev => prev.map(() => 'error'))
    }
  }, [audioCache, setAudioCache, currentLessonIndex, lessonContent, generateSingleParagraphAudio])
  
  
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
      
      console.log('📝 Split content into', contentParagraphs.length, 'paragraphs')
      setParagraphs(contentParagraphs)
      
      // Start progressive audio generation
      generateProgressiveAudio(contentParagraphs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex, lessonContent, currentLesson, generateProgressiveAudio])
  
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
          
          {/* Audio Generation Status */}
          {isGeneratingAudio && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Preparing first audio...</span>
              </div>
            </div>
          )}
          
          {isGeneratingInBackground && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-400">Generating remaining audio in background...</span>
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
                  const isReady = status === 'completed'
                  const isGenerating = status === 'generating'
                  const hasError = status === 'error'
                  
                  return (
                    <div key={index} className="mb-4 relative">
                      {/* Audio Generation Status Indicator */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center space-x-2 text-xs">
                          {isGenerating && (
                            <>
                              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-blue-600">Generating audio...</span>
                            </>
                          )}
                          {isReady && (
                            <>
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-green-600">Audio ready</span>
                            </>
                          )}
                          {hasError && (
                            <>
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-red-600">Audio generation failed</span>
                            </>
                          )}
                          {status === 'pending' && index > 0 && (
                            <>
                              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                              <span className="text-gray-500">Waiting...</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Paragraph Content */}
                      <p className={`leading-relaxed transition-all duration-300 ${
                        isCurrentlyPlaying
                          ? 'text-gray-900 font-medium bg-blue-50 -mx-3 px-3 py-2 rounded-lg border-l-4 border-blue-500'
                          : isReady
                          ? 'text-gray-700'
                          : isGenerating
                          ? 'text-gray-500 animate-pulse'
                          : hasError
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}>
                        {isGenerating && index > 0 ? (
                          // Skeleton loader for generating paragraphs
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                          </div>
                        ) : (
                          paragraph
                        )}
                      </p>
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
        hasAudio={!!currentAudioElement && !isGeneratingAudio}
        lessons={lessons}
        currentLessonIndex={currentLessonIndex}
        onSelectLesson={onSelectLesson}
      />
    </div>
  )
}
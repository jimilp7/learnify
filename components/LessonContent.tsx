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
  
  
  
  const generateParagraphAudio = useCallback(async (paragraphs: string[], retryAttempt = 0) => {
    console.log('🎤 Generating audio for', paragraphs.length, 'paragraphs... (attempt:', retryAttempt + 1, ')')
    setIsGeneratingAudio(true)
    setAudioError("")
    
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
        
        let attempts = 0
        const maxAttempts = 3
        let success = false
        let audioBlob: Blob | null = null
        
        while (attempts < maxAttempts && !success) {
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
            })
            
            console.log(`📡 Audio API response status for paragraph ${i + 1} (attempt ${attempts + 1}):`, response.status)
            
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Audio API error: ${response.status} - ${errorText}`)
            }
            
            audioBlob = await response.blob()
            if (audioBlob.size === 0) {
              throw new Error('Received empty audio blob')
            }
            
            console.log(`✅ Received audio blob for paragraph ${i + 1}:`, audioBlob.size, 'bytes')
            success = true
            
          } catch (error) {
            attempts++
            console.error(`❌ Audio generation attempt ${attempts} failed for paragraph ${i + 1}:`, error)
            
            if (attempts < maxAttempts) {
              console.log(`🔄 Retrying paragraph ${i + 1} in 1 second...`)
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
        
        if (!success || !audioBlob) {
          throw new Error(`Failed to generate audio for paragraph ${i + 1} after ${maxAttempts} attempts`)
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
          console.error(`🎵 Audio playback error for segment ${i + 1}:`, e)
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
          
          if (paragraphs.length > 1) {
            setIsGeneratingAudio(false)
          }
        }
      }
      
      // Update state with all generated audio
      setAudioUrls(newAudioUrls)
      setAudioElements(newAudioElements)
      
      console.log('✅ All paragraph audio generated successfully')
      setIsGeneratingAudio(false)
      setRetryCount(0) // Reset retry count on success
      
    } catch (err) {
      console.error('💥 Error generating paragraph audio:', err)
      setIsGeneratingAudio(false)
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown audio generation error'
      setAudioError(errorMessage)
      
      // Don't auto-retry if user has chosen to skip audio
      if (skipAudio) {
        console.log('⏭️ User chose to skip audio, not retrying')
        return
      }
      
      // Auto-retry for the first few failures
      if (retryAttempt < 2) {
        console.log(`🔄 Auto-retrying audio generation (${retryAttempt + 1}/2)...`)
        setRetryCount(retryAttempt + 1)
        setTimeout(() => {
          generateParagraphAudio(paragraphs, retryAttempt + 1)
        }, 2000)
      } else {
        console.log('❌ Max auto-retries reached, requiring user action')
      }
    }
  }, [skipAudio])
  
  
  const handleRetryAudio = () => {
    console.log('🔄 User requested audio retry')
    setAudioError("")
    setRetryCount(0)
    setSkipAudio(false)
    generateParagraphAudio(paragraphs, 0)
  }
  
  const handleSkipAudio = () => {
    console.log('⏭️ User chose to skip audio')
    setSkipAudio(true)
    setAudioError("")
    setIsGeneratingAudio(false)
  }

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
      setAudioError("")
      setRetryCount(0)
      setSkipAudio(false)
      
      // Split content into paragraphs and start generating audio
      const contentParagraphs = lessonContent
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      console.log('📝 Split content into', contentParagraphs.length, 'paragraphs')
      setParagraphs(contentParagraphs)
      
      // Start generating audio for all paragraphs (unless user has skipped)
      if (!skipAudio) {
        generateParagraphAudio(contentParagraphs)
      }
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
              <span className="text-sm text-gray-500">
                Generating audio...{retryCount > 0 && ` (Retry ${retryCount}/2)`}
              </span>
            </div>
          )}
          
          {/* Audio Error State */}
          {audioError && !skipAudio && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Audio Generation Failed</h3>
                  <p className="text-sm text-red-700 mb-3">
                    We're having trouble generating audio for this lesson. You can try again or continue reading without audio.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRetryAudio}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleSkipAudio}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      Skip Audio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Audio Skipped State */}
          {skipAudio && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">Reading Mode</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Audio has been skipped. You can read the lesson content below or try generating audio again.
                  </p>
                  <button
                    onClick={handleRetryAudio}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    Enable Audio
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
        hasAudio={!!currentAudioElement && !skipAudio}
        lessons={lessons}
        currentLessonIndex={currentLessonIndex}
        onSelectLesson={onSelectLesson}
      />
    </div>
  )
}
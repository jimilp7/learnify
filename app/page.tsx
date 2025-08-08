"use client"

import { useState } from "react"
import TopicSelection from "@/components/TopicSelection"
import LearningPreferences, { LearningPreferences as LearningPreferencesType } from "@/components/LearningPreferences"
import DepthSelection from "@/components/DepthSelection"
import LessonPlan from "@/components/LessonPlan"
import GeneratingPlan from "@/components/GeneratingPlan"
import LessonContent from "@/components/LessonContent"
import GeneratingContent from "@/components/GeneratingContent"
import { ErrorBoundary } from "@/components/ErrorBoundary"

type Screen = "topic" | "preferences" | "depth" | "generating" | "plan" | "generatingContent" | "player"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("topic")
  const [topic, setTopic] = useState("")
  const [preferences, setPreferences] = useState<LearningPreferencesType | null>(null)
  const [depth, setDepth] = useState("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [error, setError] = useState("")
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [lessonContent, setLessonContent] = useState<string>("")
  const [lessonContents, setLessonContents] = useState<Record<number, string>>({})

  const handleTopicNext = (selectedTopic: string) => {
    console.log('🎯 Topic selected:', selectedTopic)
    setTopic(selectedTopic)
    setCurrentScreen("preferences")
    console.log('📱 Screen changed to: preferences')
  }

  const handlePreferencesNext = (selectedPreferences: LearningPreferencesType) => {
    console.log('🎨 Preferences selected:', selectedPreferences)
    setPreferences(selectedPreferences)
    setCurrentScreen("depth")
    console.log('📱 Screen changed to: depth')
  }

  const handleDepthNext = async (selectedDepth: string) => {
    console.log('🎓 Depth selected:', selectedDepth)
    setDepth(selectedDepth)
    setCurrentScreen("generating")
    console.log('📱 Screen changed to: generating')
    setError("")
    
    const requestPayload = {
      topic,
      depth: selectedDepth,
      preferences,
    }
    console.log('🚀 Starting API call to generate lesson plan with payload:', requestPayload)
    
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout
        
        const response = await fetch("/api/generate-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        console.log('📡 API response status:', response.status, response.statusText)
        
        if (!response.ok) {
          console.error('❌ API request failed with status:', response.status)
          
          // Handle specific error status codes
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment and try again.")
          } else if (response.status >= 500) {
            throw new Error("Server error. Please try again in a moment.")
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please check your API configuration.")
          } else {
            throw new Error(`Failed to generate lesson plan (Error ${response.status})`)
          }
        }
        
        const data = await response.json()
        console.log('✅ Received lesson plan data:', data)
        console.log('📚 Number of lessons generated:', data.lessons?.length || 0)
        
        if (!data.lessons || data.lessons.length === 0) {
          throw new Error("No lessons were generated. Please try a different topic or approach.")
        }
        
        setLessons(data.lessons)
        setCurrentScreen("plan")
        console.log('📱 Screen changed to: plan')
        return // Success, exit retry loop
        
      } catch (err: unknown) {
        console.error('💥 Error in handleDepthNext:', err)
        retryCount++
        
        if (retryCount <= maxRetries) {
          console.log(`🔄 Retrying API call... (${retryCount}/${maxRetries})`)
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        } else {
          // All retries exhausted
          const errorMessage = (err as Error).name === 'AbortError' 
            ? "Request timed out. Please check your internet connection and try again."
            : (err as Error).message || "Failed to generate lesson plan. Please try again."
          
          setError(errorMessage)
          setCurrentScreen("depth")
          console.log('📱 Screen reverted to: depth due to error')
        }
      }
    }
  }

  const handleStart = async () => {
    console.log('🎬 Starting learning journey with:')
    console.log('  - Topic:', topic)
    console.log('  - Depth:', depth)
    console.log('  - Current lesson:', lessons[0].title)
    
    setCurrentLessonIndex(0)
    await generateLessonContent(0)
  }
  
  const generateLessonContent = async (lessonIndex: number) => {
    // Check if we already have content for this lesson
    if (lessonContents[lessonIndex]) {
      console.log('📦 Using cached content for lesson', lessonIndex)
      setLessonContent(lessonContents[lessonIndex])
      setCurrentScreen("player")
      return
    }
    
    setCurrentScreen("generatingContent")
    console.log('📱 Screen changed to: generatingContent')
    
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout
        
        const response = await fetch("/api/generate-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            depth,
            lessonTitle: lessons[lessonIndex].title,
            lessonDescription: lessons[lessonIndex].description,
            duration: lessons[lessonIndex].duration
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        console.log('📡 Content API response status:', response.status)
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment and try again.")
          } else if (response.status >= 500) {
            throw new Error("Server error. Please try again in a moment.")
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please check your API configuration.")
          } else {
            throw new Error(`Failed to generate lesson content (Error ${response.status})`)
          }
        }
        
        const data = await response.json()
        console.log('✅ Received lesson content for lesson', lessonIndex)
        
        if (!data.content || data.content.trim().length === 0) {
          throw new Error("Empty lesson content received. Please try again.")
        }
        
        // Cache the content
        setLessonContents(prev => ({ ...prev, [lessonIndex]: data.content }))
        setLessonContent(data.content)
        setCurrentScreen("player")
        console.log('📱 Screen changed to: player')
        return // Success, exit retry loop
        
      } catch (err: unknown) {
        console.error('💥 Error generating lesson content:', err)
        retryCount++
        
        if (retryCount <= maxRetries) {
          console.log(`🔄 Retrying content generation... (${retryCount}/${maxRetries})`)
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        } else {
          // All retries exhausted
          const errorMessage = (err as Error).name === 'AbortError' 
            ? "Request timed out. Please check your internet connection and try again."
            : (err as Error).message || "Failed to generate lesson content. Please try again."
          
          setError(errorMessage)
          setCurrentScreen("plan")
        }
      }
    }
  }

  const handleBackToTopic = () => {
    console.log('⬅️ Navigating back to topic selection')
    setCurrentScreen("topic")
  }

  const handleBackToPreferences = () => {
    console.log('⬅️ Navigating back to preferences selection')
    setCurrentScreen("preferences")
  }

  const handleBackToDepth = () => {
    console.log('⬅️ Navigating back to depth selection')
    setCurrentScreen("depth")
  }
  
  const handleBackFromGenerating = () => {
    console.log('⬅️ Navigating back from generating screen to depth selection')
    setCurrentScreen("depth")
  }
  
  const handleBackFromPlayer = () => {
    console.log('⬅️ Navigating back from player to lesson plan')
    setCurrentScreen("plan")
  }
  
  const handleBackFromGeneratingContent = () => {
    console.log('⬅️ Navigating back from generating content to lesson plan')
    setCurrentScreen("plan")
  }
  
  const handleNextLesson = async () => {
    const nextIndex = currentLessonIndex + 1
    if (nextIndex < lessons.length) {
      console.log('⏭️ Moving to next lesson:', nextIndex)
      setCurrentLessonIndex(nextIndex)
      await generateLessonContent(nextIndex)
    }
  }
  
  const handlePreviousLesson = async () => {
    const prevIndex = currentLessonIndex - 1
    if (prevIndex >= 0) {
      console.log('⏮️ Moving to previous lesson:', prevIndex)
      setCurrentLessonIndex(prevIndex)
      await generateLessonContent(prevIndex)
    }
  }
  
  const handleSelectLesson = async (lessonIndex: number) => {
    if (lessonIndex !== currentLessonIndex && lessonIndex >= 0 && lessonIndex < lessons.length) {
      console.log('🎨 Jumping to lesson:', lessonIndex)
      setCurrentLessonIndex(lessonIndex)
      await generateLessonContent(lessonIndex)
    }
  }
  
  const handleStartOver = () => {
    console.log('🔁 Starting over - resetting everything')
    // Reset all state
    setCurrentScreen("topic")
    setTopic("")
    setPreferences(null)
    setDepth("")
    setLessons([])
    setLessonContent("")
    setLessonContents({})
    setCurrentLessonIndex(0)
    setError("")
  }

  return (
    <>
      {currentScreen === "topic" && (
        <ErrorBoundary onReset={handleStartOver}>
          <TopicSelection onNext={handleTopicNext} />
        </ErrorBoundary>
      )}
      {currentScreen === "preferences" && (
        <ErrorBoundary onReset={handleStartOver}>
          <LearningPreferences
            topic={topic}
            onNext={handlePreferencesNext}
            onBack={handleBackToTopic}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "depth" && (
        <ErrorBoundary onReset={handleStartOver}>
          <DepthSelection 
            topic={topic} 
            onNext={handleDepthNext} 
            onBack={handleBackToPreferences}
            error={error}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "generating" && (
        <ErrorBoundary 
          onReset={handleStartOver}
          onRetry={() => setCurrentScreen("depth")}
        >
          <GeneratingPlan 
            topic={topic}
            depth={depth}
            onBack={handleBackFromGenerating}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "plan" && (
        <ErrorBoundary onReset={handleStartOver}>
          <LessonPlan 
            topic={topic}
            depth={depth}
            lessons={lessons}
            onStart={handleStart}
            onBack={handleBackToDepth}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "generatingContent" && (
        <ErrorBoundary 
          onReset={handleStartOver}
          onRetry={() => setCurrentScreen("plan")}
        >
          <GeneratingContent
            lessonTitle={lessons[currentLessonIndex]?.title || ""}
            onBack={handleBackFromGeneratingContent}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "player" && (
        <ErrorBoundary 
          onReset={handleStartOver}
          onRetry={() => setCurrentScreen("plan")}
        >
          <LessonContent 
            lessons={lessons}
            currentLessonIndex={currentLessonIndex}
            lessonContent={lessonContent}
            onBack={handleBackFromPlayer}
            onNext={handleNextLesson}
            onPrevious={handlePreviousLesson}
            onSelectLesson={handleSelectLesson}
            onStartOver={handleStartOver}
          />
        </ErrorBoundary>
      )}
    </>
  )
}
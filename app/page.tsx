"use client"

import { useState } from "react"
import TopicSelection from "@/components/TopicSelection"
import LearningPreferences, { LearningPreferences as LearningPreferencesType } from "@/components/LearningPreferences"
import DepthSelection from "@/components/DepthSelection"
import LessonPlan from "@/components/LessonPlan"
import GeneratingPlan from "@/components/GeneratingPlan"
import LessonContent from "@/components/LessonContent"
import GeneratingContent from "@/components/GeneratingContent"
import ErrorBoundary from "@/components/ErrorBoundary"

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
    
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })
      
      console.log('📡 API response status:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('❌ API request failed with status:', response.status)
        throw new Error("Failed to generate lesson plan")
      }
      
      const data = await response.json()
      console.log('✅ Received lesson plan data:', data)
      console.log('📚 Number of lessons generated:', data.lessons?.length || 0)
      
      setLessons(data.lessons)
      setCurrentScreen("plan")
      console.log('📱 Screen changed to: plan')
    } catch (err: unknown) {
      console.error('💥 Error in handleDepthNext:', err)
      
      // Provide more specific error messages based on error type
      let errorMessage = "Failed to generate lesson plan. Please try again."
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = "Request timed out. Please check your connection and try again."
        } else if (err.message.includes('fetch')) {
          errorMessage = "Connection error. Please check your internet connection."
        } else if (err.message.includes('500')) {
          errorMessage = "Server error. Please try again in a moment."
        } else if (err.message.includes('429')) {
          errorMessage = "Too many requests. Please wait a moment and try again."
        }
      }
      
      setError(errorMessage)
      setCurrentScreen("depth")
      console.log('📱 Screen reverted to: depth due to error')
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
    
    try {
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
      })
      
      console.log('📡 Content API response status:', response.status)
      
      if (!response.ok) {
        throw new Error("Failed to generate lesson content")
      }
      
      const data = await response.json()
      console.log('✅ Received lesson content for lesson', lessonIndex)
      
      // Cache the content
      setLessonContents(prev => ({ ...prev, [lessonIndex]: data.content }))
      setLessonContent(data.content)
      setCurrentScreen("player")
      console.log('📱 Screen changed to: player')
    } catch (err: unknown) {
      console.error('💥 Error generating lesson content:', err)
      
      // Provide more specific error messages based on error type
      let errorMessage = "Failed to generate lesson content. Please try again."
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = "Request timed out. Please check your connection and try again."
        } else if (err.message.includes('fetch')) {
          errorMessage = "Connection error. Please check your internet connection."
        } else if (err.message.includes('500')) {
          errorMessage = "Server error. Please try again in a moment."
        } else if (err.message.includes('429')) {
          errorMessage = "Too many requests. Please wait a moment and try again."
        }
      }
      
      setError(errorMessage)
      setCurrentScreen("plan")
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

  const handleErrorReset = () => {
    console.log('🔄 Error boundary reset requested')
    // Clear error state and return to safe screen
    setError("")
    setCurrentScreen("topic")
  }

  return (
    <>
      {currentScreen === "topic" && (
        <ErrorBoundary onReset={handleErrorReset}>
          <TopicSelection onNext={handleTopicNext} />
        </ErrorBoundary>
      )}
      {currentScreen === "preferences" && (
        <ErrorBoundary onReset={handleErrorReset}>
          <LearningPreferences
            topic={topic}
            onNext={handlePreferencesNext}
            onBack={handleBackToTopic}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "depth" && (
        <ErrorBoundary onReset={handleErrorReset}>
          <DepthSelection 
            topic={topic} 
            onNext={handleDepthNext} 
            onBack={handleBackToPreferences}
            error={error}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "generating" && (
        <ErrorBoundary onReset={handleErrorReset}>
          <GeneratingPlan 
            topic={topic}
            depth={depth}
            onBack={handleBackFromGenerating}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "plan" && (
        <ErrorBoundary onReset={handleErrorReset}>
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
        <ErrorBoundary onReset={handleErrorReset}>
          <GeneratingContent
            lessonTitle={lessons[currentLessonIndex]?.title || ""}
            onBack={handleBackFromGeneratingContent}
          />
        </ErrorBoundary>
      )}
      {currentScreen === "player" && (
        <ErrorBoundary onReset={handleErrorReset}>
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
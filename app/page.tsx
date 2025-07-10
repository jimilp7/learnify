"use client"

import { useState } from "react"
import TopicSelection from "@/components/TopicSelection"
import DepthSelection from "@/components/DepthSelection"
import LessonPlan from "@/components/LessonPlan"
import GeneratingPlan from "@/components/GeneratingPlan"
import LessonContent from "@/components/LessonContent"
import GeneratingContent from "@/components/GeneratingContent"
import logger from "@/lib/logger"

type Screen = "topic" | "depth" | "generating" | "plan" | "generatingContent" | "player"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("topic")
  const [topic, setTopic] = useState("")
  const [depth, setDepth] = useState("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [error, setError] = useState("")
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [lessonContent, setLessonContent] = useState<string>("")
  const [lessonContents, setLessonContents] = useState<Record<number, string>>({})

  const handleTopicNext = (selectedTopic: string) => {
    logger.info('🎯 Topic selected:', { selectedTopic })
    setTopic(selectedTopic)
    setCurrentScreen("depth")
    logger.info('📱 Screen changed to: depth')
  }

  const handleDepthNext = async (selectedDepth: string) => {
    logger.info('🎓 Depth selected:', { selectedDepth })
    setDepth(selectedDepth)
    setCurrentScreen("generating")
    logger.info('📱 Screen changed to: generating')
    setError("")
    
    const requestPayload = {
      topic,
      depth: selectedDepth,
    }
    logger.info('🚀 Starting API call to generate lesson plan with payload:', { requestPayload })
    
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })
      
      logger.info('📡 API response status:', { status: response.status, statusText: response.statusText })
      
      if (!response.ok) {
        logger.error('❌ API request failed with status:', { status: response.status })
        throw new Error("Failed to generate lesson plan")
      }
      
      const data = await response.json()
      logger.info('✅ Received lesson plan data:', { data })
      logger.info('📚 Number of lessons generated:', { lessonsCount: data.lessons?.length || 0 })
      
      setLessons(data.lessons)
      setCurrentScreen("plan")
      logger.info('📱 Screen changed to: plan')
    } catch (err) {
      logger.error('💥 Error in handleDepthNext:', { error: err })
      setError("Failed to generate lesson plan. Please try again.")
      setCurrentScreen("depth")
      logger.info('📱 Screen reverted to: depth due to error')
    }
  }

  const handleStart = async () => {
    logger.info('🎬 Starting learning journey with:', {
      topic,
      depth,
      currentLesson: lessons[0].title
    })
    
    setCurrentLessonIndex(0)
    await generateLessonContent(0)
  }
  
  const generateLessonContent = async (lessonIndex: number) => {
    // Check if we already have content for this lesson
    if (lessonContents[lessonIndex]) {
      logger.info('📦 Using cached content for lesson:', { lessonIndex })
      setLessonContent(lessonContents[lessonIndex])
      setCurrentScreen("player")
      return
    }
    
    setCurrentScreen("generatingContent")
    logger.info('📱 Screen changed to: generatingContent')
    
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
      
      logger.info('📡 Content API response status:', { status: response.status })
      
      if (!response.ok) {
        throw new Error("Failed to generate lesson content")
      }
      
      const data = await response.json()
      logger.info('✅ Received lesson content for lesson:', { lessonIndex })
      
      // Cache the content
      setLessonContents(prev => ({ ...prev, [lessonIndex]: data.content }))
      setLessonContent(data.content)
      setCurrentScreen("player")
      logger.info('📱 Screen changed to: player')
    } catch (err) {
      logger.error('💥 Error generating lesson content:', { error: err })
      setError("Failed to generate lesson content. Please try again.")
      setCurrentScreen("plan")
    }
  }

  const handleBackToTopic = () => {
    logger.info('⬅️ Navigating back to topic selection')
    setCurrentScreen("topic")
  }

  const handleBackToDepth = () => {
    logger.info('⬅️ Navigating back to depth selection')
    setCurrentScreen("depth")
  }
  
  const handleBackFromGenerating = () => {
    logger.info('⬅️ Navigating back from generating screen to depth selection')
    setCurrentScreen("depth")
  }
  
  const handleBackFromPlayer = () => {
    logger.info('⬅️ Navigating back from player to lesson plan')
    setCurrentScreen("plan")
  }
  
  const handleBackFromGeneratingContent = () => {
    logger.info('⬅️ Navigating back from generating content to lesson plan')
    setCurrentScreen("plan")
  }
  
  const handleNextLesson = async () => {
    const nextIndex = currentLessonIndex + 1
    if (nextIndex < lessons.length) {
      logger.info('⏭️ Moving to next lesson:', { nextIndex })
      setCurrentLessonIndex(nextIndex)
      await generateLessonContent(nextIndex)
    }
  }
  
  const handlePreviousLesson = async () => {
    const prevIndex = currentLessonIndex - 1
    if (prevIndex >= 0) {
      logger.info('⏮️ Moving to previous lesson:', { prevIndex })
      setCurrentLessonIndex(prevIndex)
      await generateLessonContent(prevIndex)
    }
  }
  
  const handleSelectLesson = async (lessonIndex: number) => {
    if (lessonIndex !== currentLessonIndex && lessonIndex >= 0 && lessonIndex < lessons.length) {
      logger.info('🎨 Jumping to lesson:', { lessonIndex })
      setCurrentLessonIndex(lessonIndex)
      await generateLessonContent(lessonIndex)
    }
  }
  
  const handleStartOver = () => {
    logger.info('🔁 Starting over - resetting everything')
    // Reset all state
    setCurrentScreen("topic")
    setTopic("")
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
        <TopicSelection onNext={handleTopicNext} />
      )}
      {currentScreen === "depth" && (
        <DepthSelection 
          topic={topic} 
          onNext={handleDepthNext} 
          onBack={handleBackToTopic}
          error={error}
        />
      )}
      {currentScreen === "generating" && (
        <GeneratingPlan 
          topic={topic}
          depth={depth}
          onBack={handleBackFromGenerating}
        />
      )}
      {currentScreen === "plan" && (
        <LessonPlan 
          topic={topic}
          depth={depth}
          lessons={lessons}
          onStart={handleStart}
          onBack={handleBackToDepth}
        />
      )}
      {currentScreen === "generatingContent" && (
        <GeneratingContent
          lessonTitle={lessons[currentLessonIndex]?.title || ""}
          onBack={handleBackFromGeneratingContent}
        />
      )}
      {currentScreen === "player" && (
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
      )}
    </>
  )
}
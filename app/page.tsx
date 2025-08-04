"use client"

import { useState } from "react"
import TopicSelection from "@/components/TopicSelection"
import DepthSelection from "@/components/DepthSelection"
import LearningStyleSelection from "@/components/LearningStyleSelection"
import LessonPlan from "@/components/LessonPlan"
import GeneratingPlan from "@/components/GeneratingPlan"
import LessonContent from "@/components/LessonContent"
import GeneratingContent from "@/components/GeneratingContent"

// Conditional logging that only logs in development
const devLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args)
  }
}

type Screen = "topic" | "depth" | "learningStyle" | "generating" | "plan" | "generatingContent" | "player"

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
  const [learningStyle, setLearningStyle] = useState("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [error, setError] = useState("")
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [lessonContent, setLessonContent] = useState<string>("")
  const [lessonContents, setLessonContents] = useState<Record<number, string>>({})

  const handleTopicNext = (selectedTopic: string) => {
    devLog('🎯 Topic selected:', selectedTopic)
    setTopic(selectedTopic)
    setCurrentScreen("depth")
    devLog('📱 Screen changed to: depth')
  }

  const handleDepthNext = (selectedDepth: string) => {
    devLog('🎓 Depth selected:', selectedDepth)
    setDepth(selectedDepth)
    setCurrentScreen("learningStyle")
    devLog('📱 Screen changed to: learningStyle')
  }

  const handleLearningStyleNext = async (selectedLearningStyle: string) => {
    devLog('🎨 Learning style selected:', selectedLearningStyle)
    setLearningStyle(selectedLearningStyle)
    setCurrentScreen("generating")
    devLog('📱 Screen changed to: generating')
    setError("")
    
    const requestPayload = {
      topic,
      depth,
      learningStyle: selectedLearningStyle,
    }
    devLog('🚀 Starting API call to generate lesson plan with payload:', requestPayload)
    
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })
      
      devLog('📡 API response status:', response.status, response.statusText)
      
      if (!response.ok) {
        devLog('❌ API request failed with status:', response.status)
        throw new Error("Failed to generate lesson plan")
      }
      
      const data = await response.json()
      devLog('✅ Received lesson plan data:', data)
      devLog('📚 Number of lessons generated:', data.lessons?.length || 0)
      
      setLessons(data.lessons)
      setCurrentScreen("plan")
      devLog('📱 Screen changed to: plan')
    } catch (err) {
      devLog('💥 Error in handleLearningStyleNext:', err)
      setError("Failed to generate lesson plan. Please try again.")
      setCurrentScreen("learningStyle")
      devLog('📱 Screen reverted to: learningStyle due to error')
    }
  }

  const handleStart = async () => {
    devLog('🎬 Starting learning journey with:')
    devLog('  - Topic:', topic)
    devLog('  - Depth:', depth)
    devLog('  - Current lesson:', lessons[0].title)
    
    setCurrentLessonIndex(0)
    await generateLessonContent(0)
  }
  
  const generateLessonContent = async (lessonIndex: number) => {
    // Check if we already have content for this lesson
    if (lessonContents[lessonIndex]) {
      devLog('📦 Using cached content for lesson', lessonIndex)
      setLessonContent(lessonContents[lessonIndex])
      setCurrentScreen("player")
      return
    }
    
    setCurrentScreen("generatingContent")
    devLog('📱 Screen changed to: generatingContent')
    
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          depth,
          learningStyle,
          lessonTitle: lessons[lessonIndex].title,
          lessonDescription: lessons[lessonIndex].description,
          duration: lessons[lessonIndex].duration
        }),
      })
      
      devLog('📡 Content API response status:', response.status)
      
      if (!response.ok) {
        throw new Error("Failed to generate lesson content")
      }
      
      const data = await response.json()
      devLog('✅ Received lesson content for lesson', lessonIndex)
      
      // Cache the content
      setLessonContents(prev => ({ ...prev, [lessonIndex]: data.content }))
      setLessonContent(data.content)
      setCurrentScreen("player")
      devLog('📱 Screen changed to: player')
    } catch (err) {
      devLog('💥 Error generating lesson content:', err)
      setError("Failed to generate lesson content. Please try again.")
      setCurrentScreen("plan")
    }
  }

  const handleBackToTopic = () => {
    devLog('⬅️ Navigating back to topic selection')
    setCurrentScreen("topic")
  }

  const handleBackToDepth = () => {
    devLog('⬅️ Navigating back to depth selection')
    setCurrentScreen("depth")
  }

  const handleBackToLearningStyle = () => {
    devLog('⬅️ Navigating back to learning style selection')
    setCurrentScreen("learningStyle")
  }
  
  const handleBackFromGenerating = () => {
    devLog('⬅️ Navigating back from generating screen to learning style selection')
    setCurrentScreen("learningStyle")
  }
  
  const handleBackFromPlayer = () => {
    devLog('⬅️ Navigating back from player to lesson plan')
    setCurrentScreen("plan")
  }
  
  const handleBackFromGeneratingContent = () => {
    devLog('⬅️ Navigating back from generating content to lesson plan')
    setCurrentScreen("plan")
  }
  
  const handleNextLesson = async () => {
    const nextIndex = currentLessonIndex + 1
    if (nextIndex < lessons.length) {
      devLog('⏭️ Moving to next lesson:', nextIndex)
      setCurrentLessonIndex(nextIndex)
      await generateLessonContent(nextIndex)
    }
  }
  
  const handlePreviousLesson = async () => {
    const prevIndex = currentLessonIndex - 1
    if (prevIndex >= 0) {
      devLog('⏮️ Moving to previous lesson:', prevIndex)
      setCurrentLessonIndex(prevIndex)
      await generateLessonContent(prevIndex)
    }
  }
  
  const handleSelectLesson = async (lessonIndex: number) => {
    if (lessonIndex !== currentLessonIndex && lessonIndex >= 0 && lessonIndex < lessons.length) {
      devLog('🎨 Jumping to lesson:', lessonIndex)
      setCurrentLessonIndex(lessonIndex)
      await generateLessonContent(lessonIndex)
    }
  }
  
  const handleStartOver = () => {
    devLog('🔁 Starting over - resetting everything')
    // Reset all state
    setCurrentScreen("topic")
    setTopic("")
    setDepth("")
    setLearningStyle("")
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
      {currentScreen === "learningStyle" && (
        <LearningStyleSelection 
          topic={topic}
          depth={depth}
          onNext={handleLearningStyleNext} 
          onBack={handleBackToDepth}
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
          onBack={handleBackToLearningStyle}
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
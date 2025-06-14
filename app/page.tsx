"use client"

import { useState } from "react"
import TopicSelection from "@/components/TopicSelection"
import DepthSelection from "@/components/DepthSelection"
import LessonPlan from "@/components/LessonPlan"
import GeneratingPlan from "@/components/GeneratingPlan"

type Screen = "topic" | "depth" | "generating" | "plan"

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

  const handleTopicNext = (selectedTopic: string) => {
    console.log('🎯 Topic selected:', selectedTopic)
    setTopic(selectedTopic)
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
    } catch (err) {
      console.error('💥 Error in handleDepthNext:', err)
      setError("Failed to generate lesson plan. Please try again.")
      setCurrentScreen("depth")
      console.log('📱 Screen reverted to: depth due to error')
    }
  }

  const handleStart = () => {
    // TODO: Navigate to learning screen
    console.log('🎬 Starting learning journey with:')
    console.log('  - Topic:', topic)
    console.log('  - Depth:', depth)
    console.log('  - Number of lessons:', lessons.length)
    console.log('  - Total duration:', lessons.reduce((sum, lesson) => sum + lesson.duration, 0), 'minutes')
  }

  const handleBackToTopic = () => {
    console.log('⬅️ Navigating back to topic selection')
    setCurrentScreen("topic")
  }

  const handleBackToDepth = () => {
    console.log('⬅️ Navigating back to depth selection')
    setCurrentScreen("depth")
  }
  
  const handleBackFromGenerating = () => {
    console.log('⬅️ Navigating back from generating screen to depth selection')
    setCurrentScreen("depth")
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
    </>
  )
}
"use client"

import { useState } from "react"
import TopicSelection from "@/components/TopicSelection"
import DepthSelection from "@/components/DepthSelection"
import LessonPlan from "@/components/LessonPlan"

type Screen = "topic" | "depth" | "plan"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("topic")
  const [topic, setTopic] = useState("")
  const [depth, setDepth] = useState("")

  const handleTopicNext = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setCurrentScreen("depth")
  }

  const handleDepthNext = (selectedDepth: string) => {
    setDepth(selectedDepth)
    setCurrentScreen("plan")
  }

  const handleStart = () => {
    // TODO: Navigate to learning screen
    console.log("Starting learning journey:", { topic, depth })
  }

  const handleBackToTopic = () => {
    setCurrentScreen("topic")
  }

  const handleBackToDepth = () => {
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
        />
      )}
      {currentScreen === "plan" && (
        <LessonPlan 
          topic={topic}
          depth={depth}
          onStart={handleStart}
          onBack={handleBackToDepth}
        />
      )}
    </>
  )
}
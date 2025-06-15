"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

interface AudioPlayerProps {
  isPlaying: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  canGoPrev: boolean
  canGoNext: boolean
  hasAudio: boolean
  isGeneratingAudio?: boolean
}

export default function AudioPlayer({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  currentTime,
  duration,
  onSeek,
  canGoPrev,
  canGoNext,
  hasAudio,
  isGeneratingAudio = false
}: AudioPlayerProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const formatTime = (seconds: number) => {
    if (!hasAudio) return "-:--"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    onSeek(newTime)
  }
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-md mx-auto space-y-3">
        {/* Seek Bar */}
        <div className="space-y-1">
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeekChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              disabled={!hasAudio}
              className={`w-full h-1 bg-gray-200 rounded-lg appearance-none slider ${
                hasAudio ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              style={{
                background: hasAudio 
                  ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                  : '#e5e7eb'
              }}
            />
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>-:--</span>
          </div>
        </div>
        
        {/* Generating Audio Status */}
        {isGeneratingAudio && (
          <div className="flex items-center justify-center py-2">
            <span className="text-xs text-gray-500">Generating audio...</span>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onPrevious}
            disabled={!canGoPrev}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={onPlayPause}
            disabled={!hasAudio}
            className={`p-3 rounded-full transition-colors ${
              hasAudio 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>
          
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
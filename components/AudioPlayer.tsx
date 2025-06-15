"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ListMusic } from "lucide-react"

interface AudioPlayerProps {
  isPlaying: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onStartOver: () => void
  canGoPrev: boolean
  canGoNext: boolean
  hasAudio: boolean
  lessons?: Array<{ id: string; title: string }>
  currentLessonIndex?: number
  onSelectLesson?: (index: number) => void
}

export default function AudioPlayer({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onStartOver,
  canGoPrev,
  canGoNext,
  hasAudio,
  lessons,
  currentLessonIndex = 0,
  onSelectLesson
}: AudioPlayerProps) {
  const [showPlaylist, setShowPlaylist] = useState(false)
  const playlistRef = useRef<HTMLDivElement>(null)
  
  // Close playlist when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(event.target as Node)) {
        setShowPlaylist(false)
      }
    }
    
    if (showPlaylist) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPlaylist])
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-md mx-auto">
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Start Over */}
          <button
            onClick={onStartOver}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Start Over"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
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
          
          {/* Playlist */}
          <div className="relative" ref={playlistRef}>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Playlist"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            
            {/* Playlist Dropdown */}
            {showPlaylist && lessons && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-700 px-3 py-2">Lessons</h3>
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (onSelectLesson) {
                          onSelectLesson(index)
                          setShowPlaylist(false)
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm ${
                        index === currentLessonIndex
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{index + 1}.</span>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
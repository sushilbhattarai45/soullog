"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { SongContext } from "@/components/context/songContext"

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

type Track = {
  id: number
  title: string
  artist: string
  youtube_url: string
}

export function RecommendationsPanel() {
  const { song } = useContext(SongContext) // dynamic songs
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<any>(null)
  const apiLoadedRef = useRef(false)

  const getVideoId = (url: string) => {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/)
    return match ? match[1] : ""
  }

  useEffect(() => {
    if (apiLoadedRef.current) return
    apiLoadedRef.current = true

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      if (currentIndex !== null && song.length > 0) {
        initPlayer(getVideoId(song[currentIndex].youtube_url))
      }
    }
  }, [song])

  const initPlayer = (videoId: string) => {
    if (!window.YT || !window.YT.Player) return

    if (!playerRef.current) {
      playerRef.current = new window.YT.Player("yt-player", {
        height: "0",
        width: "0",
        videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          controls: 0,
        },
        events: {
          onReady: () => setIsPlaying(true),
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) handleNext()
          },
        },
      })
    } else {
      playerRef.current.loadVideoById(videoId)
      setIsPlaying(true)
    }
  }

  const handlePlayPause = (index: number) => {
    if (currentIndex !== index) {
      setCurrentIndex(index)
      initPlayer(getVideoId(song[index].youtube_url))
    } else if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
        setIsPlaying(false)
      } else {
        playerRef.current.playVideo()
        setIsPlaying(true)
      }
    }
  }

  const handleNext = () => {
    if (currentIndex === null) return
    const nextIndex = (currentIndex + 1) % song.length
    setCurrentIndex(nextIndex)
    initPlayer(getVideoId(song[nextIndex].youtube_url))
  }

  const handlePrevious = () => {
    if (currentIndex === null) return
    const prevIndex = (currentIndex - 1 + song.length) % song.length
    setCurrentIndex(prevIndex)
    initPlayer(getVideoId(song[prevIndex].youtube_url))
  }

  return (
    <div className="h-full mt-2 bg-white flex flex-col relative">
      {/* Hidden YouTube Iframe */}
      <div className="absolute w-0 h-0 overflow-hidden">
        <div id="yt-player" />
      </div>

      <div className="h-[100%] border-b overflow-hidden flex flex-col">
        <div className="p-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Mood Playlist</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {song.map((track, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white border hover:shadow-lg transition-shadow duration-200 group">
                <CardContent className="p-2.5 flex flex-col gap-2">
                  <div className="flex items-start gap-2.5 mb-1.5">
                    <div className="h-9 w-9 rounded-lg bg-chart-3 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Music className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </div>

                  {/* Inline controls */}
                  {currentIndex === index ? (
                    <div className="flex items-center justify-between mt-2 gap-1">
                      <Button size="sm" onClick={handlePrevious} className="flex-1 h-8 border hover:border-primary/50">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePlayPause(index)}
                        className="flex-1 h-8 border hover:border-primary/50"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" onClick={handleNext} className="flex-1 h-8 border hover:border-primary/50">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full mt-2 h-8 bg-primary/10 hover:bg-primary/20 text-primary border-0 text-xs"
                      onClick={() => handlePlayPause(index)}
                    >
                      <Play className="h-4 w-3 mr-1" /> Play
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

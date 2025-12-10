"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

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
  youtubeId: string
}

const musicRecommendations: Track[] = [
  { id: 1, title: "Golden Hour", artist: "JVKE", youtubeId: "hDKCxebp88A" },
  { id: 2, title: "Sunflower", artist: "Post Malone", youtubeId: "chn_GHs_Hy8" },
  { id: 3, title: "Let's Go Home Together", artist: "Ella Henderson", youtubeId: "Rzp19Fpmuc" },
  { id: 4, title: "Good Days", artist: "SZA", youtubeId: "hDKCxebp88A" },
  { id: 5, title: "Blinding Lights", artist: "The Weeknd", youtubeId: "uB_jU0gGrSY" },
]

export function RecommendationsPanel() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<any>(null)
  const apiLoadedRef = useRef(false)

  // Load YouTube API once
  useEffect(() => {
    if (apiLoadedRef.current) return
    apiLoadedRef.current = true

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      console.log("YT API Ready")
      if (currentIndex !== null) initPlayer(musicRecommendations[currentIndex].youtubeId)
    }
  }, [])

  // Initialize or load new video
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
          onReady: (event: any) => {
            event.target.playVideo()
            setIsPlaying(true)
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNext()
            }
          },
        },
      })
    } else {
      playerRef.current.loadVideoById(videoId)
      setIsPlaying(true)
    }
  }

  const handlePlayPause = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
    } else {
      playerRef.current.playVideo()
      setIsPlaying(true)
    }
  }

  const handleTrack = (index: number) => {
    setCurrentIndex(index)
    initPlayer(musicRecommendations[index].youtubeId)
  }

  const handleNext = () => {
    if (currentIndex === null) return
    const nextIndex = (currentIndex + 1) % musicRecommendations.length
    handleTrack(nextIndex)
  }

  const handlePrevious = () => {
    if (currentIndex === null) return
    const prevIndex =
      (currentIndex - 1 + musicRecommendations.length) % musicRecommendations.length
    handleTrack(prevIndex)
  }

  return (
    <div className="h-full mt-2 bg-white flex flex-col relative">
      {/* Hidden YouTube Iframe */}
      <div className="absolute w-0 h-0 overflow-hidden">
        <div id="yt-player" />
      </div>

      {/* Panel Content */}
      <div className="h-[100%] border-b overflow-hidden flex flex-col">
        <div className="p-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Mood Playlist</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {musicRecommendations.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="bg-white border hover:shadow-md transition-all duration-200 hover:border-primary/30 group">
                <CardContent className="p-2.5">
                  <div className="flex items-start gap-2.5 mb-1.5">
                    <div className="h-9 w-9 rounded-lg bg-chart-3 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Music className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate mb-0.5">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 bg-primary/10 hover:bg-primary/20 text-primary border-0 text-xs"
                      onClick={() => handleTrack(index)}
                    >
                      <Play className="h-4 w-3 mr-1" />
                      Play
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Playback Controls */}
        {currentIndex !== null && (
          <div className="p-3 border-t flex items-center justify-between space-x-2">
            <Button size="sm" onClick={handlePrevious}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={handleNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <p className="text-xs truncate">
              Now Playing: {musicRecommendations[currentIndex].title} -{" "}
              {musicRecommendations[currentIndex].artist}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

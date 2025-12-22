"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SongContext } from "@/components/context/songContext";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function RecommendationsPanel() {
  const { song } = useContext(SongContext); // dynamic songs
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const apiLoadedRef = useRef(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100);
  const [muted, setMuted] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(false);

  const getVideoId = (url: string) => {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : "";
  };

  useEffect(() => {
    if (apiLoadedRef.current) return;
    apiLoadedRef.current = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      // if a track was already selected before API loaded, initialize it
      if (playingVideoId) {
        initPlayer(playingVideoId);
        currentVideoIdRef.current = playingVideoId;
      } else if (currentIndex !== null && song.length > 0) {
        const vid = getVideoId(song[currentIndex].youtube_url);
        initPlayer(vid);
        currentVideoIdRef.current = vid;
      }
    };

    return () => {
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      } catch (e) {}
    };
  }, []);

  const initPlayer = (videoId: string) => {
    if (!window.YT || !window.YT.Player) return;

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
            if (event.data === window.YT.PlayerState.ENDED) handleNext();
          },
        },
      });
      currentVideoIdRef.current = videoId;
    } else {
      playerRef.current.loadVideoById(videoId);
      setIsPlaying(true);
    }
  };
  // Poll player time/duration and sync volume state
  useEffect(() => {
    let interval: any = null;
    const tick = () => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration
            ? playerRef.current.getDuration()
            : 0;
          setCurrentTime(typeof t === "number" ? t : 0);
          setDuration(typeof d === "number" ? d : 0);
        }
        if (playerRef.current && playerRef.current.getVolume) {
          const v = playerRef.current.getVolume();
          setVolume(typeof v === "number" ? v : 100);
        }
        if (playerRef.current && playerRef.current.isMuted) {
          setMuted(!!playerRef.current.isMuted());
        }
      } catch (e) {}
    };

    interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleSeek = (value: number) => {
    try {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(value, true);
        setCurrentTime(value);
      }
    } catch (e) {}
  };

  const handleVolume = (v: number) => {
    try {
      if (playerRef.current && playerRef.current.setVolume) {
        playerRef.current.setVolume(v);
        setVolume(v);
      }
    } catch (e) {}
  };

  const toggleMute = () => {
    try {
      if (!playerRef.current) return;
      if (playerRef.current.isMuted && playerRef.current.isMuted()) {
        playerRef.current.unMute();
        setMuted(false);
      } else {
        playerRef.current.mute();
        setMuted(true);
      }
    } catch (e) {}
  };

  const handlePlayPause = (index: number) => {
    const vid = getVideoId(song[index].youtube_url);
    if (currentIndex !== index) {
      setCurrentIndex(index);
      setPlayingVideoId(vid);
      initPlayer(vid);
    } else if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        setPlayingVideoId(null);
      } else {
        if (!playingVideoId) setPlayingVideoId(vid);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % song.length;
    const vid = getVideoId(song[nextIndex].youtube_url);
    setCurrentIndex(nextIndex);
    setPlayingVideoId(vid);
    initPlayer(vid);
  };

  const handlePrevious = () => {
    if (currentIndex === null) return;
    const prevIndex = (currentIndex - 1 + song.length) % song.length;
    const vid = getVideoId(song[prevIndex].youtube_url);
    setCurrentIndex(prevIndex);
    setPlayingVideoId(vid);
    initPlayer(vid);
  };

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
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Mood Playlist
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {song.map((track, index) => (
            <motion.div
              key={track.youtube_url || index}
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
                      <p className="font-medium text-xs truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Inline controls */}
                  {currentIndex === index ? (
                    <div className="flex items-center justify-between mt-2 gap-1">
                      <Button
                        size="sm"
                        onClick={handlePrevious}
                        className="flex-1 h-8 border hover:border-primary/50"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePlayPause(index)}
                        className="flex-1 h-8 border hover:border-primary/50"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleNext}
                        className="flex-1 h-8 border hover:border-primary/50"
                      >
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

      {/* Bottom centered controller */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="max-w-2xl min-w-2xl w-full mx-auto bg-white/80 backdrop-blur-sm border shadow-sm rounded-md p-3 h-20">
          <div className="flex items-center gap-4 h-full">
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                  }}
                  className="h-9 w-9  bg-muted-foreground/10 flex items-center justify-center"
                >
                  <Music className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-muted-foreground">
                    {currentIndex !== null && song[currentIndex]
                      ? song[currentIndex].title
                      : playingVideoId
                      ? song.find(
                          (t) => getVideoId(t.youtube_url) === playingVideoId
                        )?.title
                      : "No track playing"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentIndex !== null && song[currentIndex]
                      ? song[currentIndex].artist
                      : playingVideoId
                      ? song.find(
                          (t) => getVideoId(t.youtube_url) === playingVideoId
                        )?.artist
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 w-2/5">
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(duration, 0)}
                    value={Math.min(currentTime, Math.max(duration, 0))}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handlePrevious}
                  className="h-7 w-8 rounded border text-muted-foreground bg-white/0 hover:bg-muted/5 flex items-center justify-center"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (playerRef.current) {
                      if (isPlaying) {
                        playerRef.current.pauseVideo();
                        setIsPlaying(false);
                      } else {
                        playerRef.current.playVideo();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className="h-8 w-8 rounded border text-muted-foreground bg-white/0 hover:bg-muted/5 flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="h-7 w-8 rounded border text-muted-foreground bg-white/0 hover:bg-muted/5 flex items-center justify-center"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center w-36">
              <button
                onClick={() => setShowVolume((s) => !s)}
                className="p-2 rounded hover:bg-muted/5 text-muted-foreground"
                aria-label="toggle-volume-popover"
              >
                <Volume2 className="h-5 w-5" />
              </button>

              {showVolume && (
                <div className="absolute bottom-full mb-2 right-0 bg-white border rounded-md p-2 shadow-sm w-36">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => handleVolume(Number(e.target.value))}
                      className="w-full"
                      aria-label="volume-slider"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

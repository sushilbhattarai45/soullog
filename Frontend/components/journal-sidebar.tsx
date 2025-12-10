"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, BookOpen, Flame } from "lucide-react"
import { EmotionBadge, type EmotionKey } from "./emotion-badge"
import { QuoteRotator } from "./quote-rotator"

export interface JournalEntry {
 id: string
  content: string
  emotion: string
  aiReview: string
  timestamp: number
  userId?: string
}

interface JournalSidebarProps {
  data: JournalEntry[]
  onNewJournal: () => void
  onSelectEntry: (entry: JournalEntry) => void
  selectedEntryId?: string
}

export function JournalSidebar({ data, onNewJournal, onSelectEntry, selectedEntryId }: JournalSidebarProps) {
 let sortedData = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

 console.log(sortedData)
  const calculateStreak = () => {
    if (data.length === 0) return 0

    const sorteddata = [...data].sort((a, b) => b.timestamp - a.timestamp)
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sorteddata) {
      const entryDate = new Date(entry.timestamp)
      entryDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  return (
    <div className="h-full mt-2 flex flex-col bg-white">
      <div className="p-3 border-b flex-shrink-0">
        <Button
          onClick={onNewJournal}
          className="w-full bg-primary hover:bg-primary/90 text-white h-10 font-medium transition-all"
          size="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <div className="flex-shrink-0 ">
        <QuoteRotator />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 space-y-2">
          <h3 className="text-xs font-semibold text-foreground px-2 mb-3 uppercase tracking-wider">Past Journals</h3>

          {data.length === 0 ? (
            <Card className="p-6 text-center border-dashed bg-muted/30">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start writing to see your history</p>
            </Card>
          ) : (
 sortedData.map
            ((entry, index) => (
              <div key={entry.id}>
                <Card
                  className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedEntryId === entry.id
                      ? "border-primary shadow-md bg-primary/5 border-l-4"
                      : "bg-white hover:border-gray-300"
                  }`}
                  onClick={() => onSelectEntry(entry)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-normal line-clamp-2 flex-1 leading-relaxed text-foreground">
                      {entry.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <EmotionBadge emotion={entry.emotion} size="sm" />
                    <p className="text-xs text-muted-foreground font-medium">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Card>
                {index < data.length - 1 && <div className="h-px bg-gray-100 my-1.5" />}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3 border-t bg-gradient-to-br from-orange-50 to-red-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Streak</p>
              <p className="text-xs text-gray-600">Keep it going!</p>
            </div>
          </div>
          <div className="text-xl font-bold text-orange-600">{streak}</div>
        </div>
      </div>
    </div>
  )
}

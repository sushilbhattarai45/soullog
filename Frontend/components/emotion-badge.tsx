import { Badge } from "@/components/ui/badge"

export const emotions = {
  'happy': { emoji: "😊", color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Happy" },
  'sad': { emoji: "😔", color: "bg-blue-50 text-blue-700 border-blue-200", label: "Sad" },
  'angry': { emoji: "😡", color: "bg-red-50 text-red-700 border-red-200", label: "Angry" },
  'anxious': { emoji: "😰", color: "bg-purple-50 text-purple-700 border-purple-200", label: "Anxious" },
  'excited': { emoji: "🤩", color: "bg-pink-50 text-pink-700 border-pink-200", label: "Excited" },
  'calm': { emoji: "😌", color: "bg-green-50 text-green-700 border-green-200", label: "Calm" },
  'neutral': { emoji: "😐", color: "bg-gray-50 text-gray-700 border-gray-200", label: "Neutral" },
  'mixed' : { emoji: "😕", color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Mixed" },
}

export type EmotionKey = keyof typeof emotions

interface EmotionBadgeProps {
  emotion: EmotionKey
  size?: "sm" | "md" | "lg"
}

export function EmotionBadge({ emotion, size = "md" }: EmotionBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  return (
    <Badge className={`${emotions[emotion].color} border ${sizeClasses[size]}`}>
      <span className="mr-1.5">{emotions[emotion].emoji}</span>
      {emotions[emotion].label}
    </Badge>
  )
}

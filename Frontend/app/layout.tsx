import type React from "react"
import type { Metadata } from "next"
import { Poppins, Geist_Mono, Dancing_Script } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { JournalContextProvider } from "@/components/context/journalContext"
import { Toaster } from "@/components/ui/sonner"
import { AuthContextProvider } from "@/components/context/authContext"
import { SongContextProvider } from "@/components/context/songContext"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cursive",
})

export const metadata: Metadata = {
  title: "FeelDiary - Write. Reflect. Feel.",
  description: "Your private journaling space with AI emotion analysis",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${dancingScript.variable} font-sans antialiased`}>
        <AuthContextProvider>
          <SongContextProvider>
        <JournalContextProvider>
                  <Toaster />

          {children}
        </JournalContextProvider>
        </SongContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  )
}

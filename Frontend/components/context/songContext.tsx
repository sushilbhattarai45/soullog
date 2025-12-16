'use client'

import { createContext, useContext,useState,useEffect } from "react"
import axios from "axios"
type SongContextType = {
  song: [{
    title: string
    artist: string
    youtube_url: string
  }],
  setSong: (song: [{
    title: string
    artist: string
    youtube_url: string
  }]) => void
}

export const SongContext = createContext<SongContextType>({
  setSong: () => {},
  song :[{
    title: "",
    artist: "",
    youtube_url: ""
  }]
})



export const SongContextProvider = ({ children }: { children: React.ReactNode }) => {


  const [song, setSong] = useState<SongContextType["song"]>([
    {
        title: "",
        artist: "",
        youtube_url: ""
    }
  ])

  const [ispreload, setIsPreload] = useState<boolean>(true);
  let getPreload = async () => {
    const response = await axios.get('http://localhost:5000/api/preloadMusic')
     setSong(response.data)
      setIsPreload(false)
  }
  useEffect(() => {
    getPreload()
  },[ispreload])


  return (
    <SongContext.Provider value={{ song, setSong }}>
      {children}
    </SongContext.Provider>
  )
}
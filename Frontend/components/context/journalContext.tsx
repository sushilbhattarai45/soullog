'use client'
import {createContext, useState, ReactNode,useContext, useEffect } from "react"
import { UserContext } from "./authContext"
import axios from "axios"
interface JournalEntry {
  id: string
  content: string
  emotion: string
  aiReview: string
  timestamp: number
  
}

interface JournalContextType{
    entries: JournalEntry[]
    setEntries: (entries: JournalEntry[]) => void
    getEntries: () => void
}


export const JournalEntryContext = createContext<JournalContextType>({
    entries:[],
    setEntries: () => {},
    getEntries: () => {}
})

export const JournalContextProvider =({children}:{children:ReactNode})=>{
    const {isloggedIn,data} = useContext(UserContext)
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const getEntries = async () => {
        if(data?.id){
      const response = await axios.post('http://localhost:5000/api/journal/getOneUserEntries',{
     id : data?.id
    }
    );
     
    setEntries(response.data);
        }
    }
    useEffect(() => {
        getEntries();
    }, [data?.id]);

    return (
        <JournalEntryContext.Provider value={{entries, setEntries, getEntries}}>
            {children}
        </JournalEntryContext.Provider>
    )
}
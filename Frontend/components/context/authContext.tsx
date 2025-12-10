'use client'

import {createContext, useState, ReactNode} from 'react'


interface User{
    id:string
    username:string,
}
interface UserContextType{
    data: User | null
    setUser : (data:User)=>void
    getUser :()=>void
    isloggedIn: boolean
    setIsloggedIn: (isloggedIn:boolean)=>void
}

export const UserContext = createContext<UserContextType>({
    data:null,
    setUser:()=>{},
    getUser: () => {},
     isloggedIn: false
    , setIsloggedIn: () => {}
})


export const AuthContextProvider= ({children}:{children:ReactNode})=>
{
  let  userData =  localStorage.getItem("userData")
 const [ isloggedIn, setIsloggedIn] = useState(!!userData)
    const [data, setData] = useState<User |null>(userData ? JSON.parse(userData) : null)
    const setUser=(user:User)=>{
    setData(user)
    }
    const getUser=()=>{
    }
    return(
        <UserContext.Provider value={{data,setUser, getUser, isloggedIn, setIsloggedIn}}>
            {children}
        </UserContext.Provider>
    )

}

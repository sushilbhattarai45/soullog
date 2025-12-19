"use client"

import { useState, useEffect,CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useContext } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, PenLine, EyeOff, LogIn, UserPlus, BookOpen } from "lucide-react"
import { Header } from "@/components/header"
import { JournalSidebar, type JournalEntry } from "@/components/journal-sidebar"
import { JournalEditor } from "@/components/journal-editor"
import { RecommendationsPanel } from "@/components/recommendations-panel"
import type { EmotionKey } from "@/components/emotion-badge"
import axios from "axios"
import { JournalEntryContext } from "@/components/context/journalContext"
import { toast, Toaster } from "sonner"
import { UserContext } from "@/components/context/authContext"
import { SongContext } from "@/components/context/songContext"
interface MusicRecommendation{
  title: string
  artist: string
  url: string
}
import { ClipLoader, DotLoader, RotateLoader } from "react-spinners";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export default function FeelDiary() {
  let {entries, setEntries,getEntries} = useContext (JournalEntryContext);
  let {
    data,
    setUser,
    getUser,
    isloggedIn,
  } = useContext (UserContext);
const {song, setSong} = useContext(SongContext);
  const [loggedIn, setLoggedIn] = useState(true)
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">(isloggedIn ? "dashboard" : "landing")
  const [myEntries, setMyEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const [signInMode, setSignInMode] = useState<"regular" | "anonymous">("regular")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
const [musicRecommendation, setMusicRecommendation] = useState<MusicRecommendation>({title:"",artist:"", url:""})


  useEffect(() => {
   if (entries.length > 0)
   {
    setMyEntries(entries);
   }

  }, [entries])




function Spinner() {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");

  return (
    <div className="sweet-loading">
      <button onClick={() => setLoading(!loading)}>Toggle Loader</button>
      <input
        value={color}
        onChange={(input) => setColor(input.target.value)}
        placeholder="Color of the loader"
      />

      <RotateLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}

  const handleSignIn =async () => {
    if (!username.trim() || !password.trim()) return
    // localStorage.setItem("feelDiaryUser", JSON.stringify({ username, isAnonymous: signInMode === "anonymous" }))
try{
    let response = await axios.post ('http://localhost:5000/api/auth/login', 
  {username,
  password
   });    
if(response.status===200 )
{

toast(
  "Login Successful",
  { 
    description: "Welcome back! You have successfully logged in.",
    position: "top-center",
    duration: 4000,
    type: "success",
  } 
) 
getEntries();
setUser({id: response.data.user._id, username: response.data.user.username})
setLoggedIn(true);
localStorage.setItem("userData", JSON.stringify({
  id: response.data.user,
  username: username
}));
getEntries()
setLoggedIn(true);
setCurrentView("dashboard")
}
 }
  catch (error){
toast(
  "Login Failed",
  { 
    description: "Please check your credentials and try again.",
    
    position: "top-center",
    duration: 4000,
    type: "error",
  }
)
 
  }
    // setCurrentView("dashboard")
    setShowSignIn(false)
    }

useEffect(() => {
  if (!isloggedIn)
  {
    setCurrentView("landing")

  }
  
}, [isloggedIn]);

  const handleSaveEntry = async (content: string, emotion: EmotionKey, aiReview: string, isAnonymous: boolean) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      content,
      emotion,
      aiReview,
      timestamp: Date.now(),
      userId : data?.id,

        }
        toast(
  "Handling Entry Save",
  { 
    description: "Saving your journal entry...",
    
    position: "top-center",
    duration: 10000,
    type: "info",
  }

)
    setSelectedEntry(null)
    let postData = await axios.post ('http://localhost:5000/api/journal/post', newEntry);
    console.log(JSON.stringify(postData?.data.entryData.aiReview));

 setEntries([
   {

    ...postData?.data?.entryData,
    aiReview: postData?.data?.entryData?.aiReview,
    emotion: postData?.data?.entryData?.emotion,

  }
  ,
  ...entries,
 
]);
setMyEntries([
  {

   ...postData?.data?.entryData,
   aiReview: postData?.data?.entryData?.aiReview,
   emotion: postData?.data?.entryData?.emotion,

 }
 ,
 ...myEntries,

]);
newEntry.aiReview = postData?.data?.entryData.aiReview;
    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    console.log("Journal Entries after adding new entry:");
console.log(updatedEntries);

// cm
console.log(song)
console.log("New Entry Saved:" );
setSong([
    ...postData?.data?.song
,
  ...song,
])
console.log("Songs Recommendation:");
console.log (song)



if (postData?.data?.song)
{
  toast(
    "Journal Saved!",
    { 
      description: "Your journal entry has been saved successfully.",
      
      position: "top-center",
      duration: 4000,
      type: "success",
    }
  
  ) 
}
setSelectedEntry(newEntry);
setMusicRecommendation(postData?.data?.song);
  }

  const handleNewJournal = () => {
    setSelectedEntry(null)
  }


  const handleSignUp = async() => {
    if (!username.trim() || !password.trim()) return
    // localStorage.setItem("feelDiaryUser", JSON.stringify({ username, isAnonymous: signInMode === "anonymous" }))
    // setCurrentView("dashboard")
    // setShowSignIn(false)


    const register= await axios.post ('http://localhost:5000/api/auth/register', 
    {username,
    password
     });
toast(
  "Registration Successful",
  { 
    description: "Your account has been created. Please log in.",
    
    position: "top-center",
    duration: 4000,
    type: "success",
  }

) 
    setShowSignIn(false)
    setUsername("")
    setPassword("")

    }

  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-white animate-in fade-in duration-700">
        <nav className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground font-[family-name:var(--font-cursive)]">
                Feel<span className="text-primary">Diary</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                {
                data? 
                `Welcome, ${data?.username}`
                :
                "About"
                }
              </a>
              <Button
                onClick={() => setShowSignIn(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        {/* Sign-in Modal */}
        {showSignIn && (
          <div 
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          className="fixed align  bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" >
            <Card className="w-full max-w-md shadow-2xl border-2 animate-in zoom-in-95 duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to FeelDiary</CardTitle>
                <CardDescription>Choose how you'd like to sign in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={signInMode} onValueChange={(v) => setSignInMode(v as "regular" | "anonymous")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="regular" className="gap-2">
                      <LogIn className="h-4 w-4" />
                      LogIn
                    </TabsTrigger>
                    <TabsTrigger value="anonymous" className="gap-2">
                      <EyeOff className="h-4 w-4" />
                      SignUp
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="regular" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Sign in with your identity visible to the community</p>
                  </TabsContent>
                  <TabsContent value="anonymous" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="anon-username">Username</Label>
                      <Input
                        id="anon-username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anon-password">Password</Label>
                      <Input
                        id="anon-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Card className="bg-primary/10 border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <EyeOff className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            Your identity will remain completely private. You can still track your personal journal, but
                            the community won't see your name.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSignIn(false)
                      setUsername("")
                      setPassword("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={signInMode === "regular" ? handleSignIn : handleSignUp}
                    disabled={!username.trim() || !password.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {signInMode === "regular" ? "Log In" : "Sign Up"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium border">
                <Sparkles className="mr-2 h-4 w-4 inline" />
                AI-Powered Emotional Wellness
              </Badge>
              <h2 className="text-6xl md:text-7xl font-bold text-balance leading-tight text-foreground">
                Your Digital <span className="text-primary">Sanctuary</span>
              </h2>
              <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
                Journal your thoughts, receive AI-powered emotional insights, and connect with a supportive community.
                Share openly or anonymously in a professional, minimal environment.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setShowSignIn(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 text-white font-medium"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 bg-white">
                Learn More
              </Button>
            </div>

            {/* <div id="features" className="grid md:grid-cols-3 gap-6 mt-20">
              <Card className="hover:shadow-lg transition-all duration-300 bg-white border">
                <CardHeader className="space-y-4">
                  <div className="h-14 w-14 rounded-lg bg-primary flex items-center justify-center">
                    <PenLine className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Express Yourself</CardTitle>
                  <CardDescription className="leading-relaxed">
                    Write freely in a notebook-style interface. Share publicly or anonymously in a judgment-free space.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 bg-white border">
                <CardHeader className="space-y-4">
                  <div className="h-14 w-14 rounded-lg bg-foreground flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
                  <CardDescription className="leading-relaxed">
                    Receive empathetic, personalized feedback and emotion analysis with music and quote recommendations.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 bg-white border">
                <CardHeader className="space-y-4">
                  <div className="h-14 w-14 rounded-lg bg-primary flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Track Your Journey</CardTitle>
                  <CardDescription className="leading-relaxed">
                    View your emotional patterns over time and celebrate your progress with weekly mood summaries.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div> */}
          </div>
        </main>

        <footer className="border-t py-8 bg-white">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p className="text-lg font-semibold text-foreground mb-2 font-[family-name:var(--font-cursive)]">
              Feel<span className="text-primary">Diary</span>
            </p>
            <p>Your private journaling space © 2025</p>
            <p className="mt-2">Made with care for your emotional wellness</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Past Journals with streak tracker */}
        <aside className="w-80 border-r hidden lg:flex flex-col overflow-hidden">
          <JournalSidebar
            onNewJournal={handleNewJournal}
            onSelectEntry={setSelectedEntry}
            selectedEntryId={selectedEntry?.id}
            data={entries}
          />
        </aside>

        {/* Middle Panel - Notebook with quote rotator at top */}
        <section className="flex-1 overflow-hidden flex flex-col">
          {selectedEntry ? (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <Button variant="ghost" onClick={handleNewJournal} className="mb-4 hover:bg-primary/10">
                  ← Back to New Entry
                </Button>
                <Card className="paper-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-primary">Journal Entry</CardTitle>
                      <Badge className="bg-primary/10 text-primary border-primary/30 border">
                        {new Date(selectedEntry.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">{selectedEntry.content}</p>
                    <Card className="bg-primary/5 border-primary/20 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-primary mb-3 text-lg">AI Review</p>
                            <p className="text-sm text-foreground leading-relaxed">{selectedEntry.aiReview}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <JournalEditor onSave={handleSaveEntry} />
          )}
        </section>

        {/* Right Panel - Music (top, scrollable) + Mood Summary (bottom, fixed) */}
        <aside className="w-80 border-l hidden xl:flex flex-col overflow-hidden">
          <RecommendationsPanel />
        </aside>
      </main>
    </div>
  )
}

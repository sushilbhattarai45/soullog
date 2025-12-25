"use client";

import { useState, useEffect, CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  PenLine,
  EyeOff,
  LogIn,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/header";
import {
  JournalSidebar,
  type JournalEntry,
} from "@/components/journal-sidebar";
import { JournalEditor } from "@/components/journal-editor";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import type { EmotionKey } from "@/components/emotion-badge";
import axios from "axios";
import { JournalEntryContext } from "@/components/context/journalContext";
import { toast, Toaster } from "sonner";
import { UserContext } from "@/components/context/authContext";
import { SongContext } from "@/components/context/songContext";
import instance from "@/config/axiosConfig";
export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInMode, setSignInMode] = useState<"regular" | "anonymous">(
    "regular"
  );
  let { entries, setEntries, getEntries } = useContext(JournalEntryContext);
  let { data, setUser, getUser, isloggedIn } = useContext(UserContext);
  const { song, setSong } = useContext(SongContext);
  const [loggedIn, setLoggedIn] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");
  const [artistInput, setArtistInput] = useState("");
  const [artists, setArtists] = useState<string[]>([]);
  // Start sign up by opening the onboarding modal. Account will only be created
  // after the user completes onboarding selections (languages + artists).
  const handleSignUp = async () => {
    if (!username.trim() || !password.trim()) return;
    // Open onboarding and require completion before creating the account
    setShowOnboarding(true);
  };

  const addArtist = () => {
    const value = artistInput.trim();
    if (!value) return;
    if (!artists.includes(value)) {
      setArtists((prev) => [...prev, value]);
    }
    setArtistInput("");
  };

  const removeArtist = (a: string) => {
    setArtists((prev) => prev.filter((p) => p !== a));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((p) => p !== lang) : [...prev, lang]
    );
  };

  useEffect(() => {
    if (isloggedIn) {
      router.push("/home");
    }
  }, [isloggedIn]);

  const finalizeSignUp = async () => {
    if (!username.trim() || !password.trim()) return;
    if (selectedLanguages.length === 0 || artists.length === 0) {
      toast("Complete Onboarding", {
        description: "Please select at least one language and add an artist.",
        position: "top-center",
        duration: 3500,
        type: "error",
      });
      return;
    }

    try {
      const payload = {
        username,
        password,
        favoriteArtists: artists,
        languages: selectedLanguages,
      };
      // Attempt to register with onboard data. If backend doesn't accept
      // preferences yet, it should still accept username/password. This call
      // is resilient to either case.
      const register = await instance.post("auth/register", payload);
      toast("Registration Successful", {
        description: "Your account has been created. Welcome!",
        position: "top-center",
        duration: 4000,
        type: "success",
      });
      // finalize UI state
      setShowOnboarding(false);
      setShowSignIn(false);
      // setUsername("");
      // setPassword("");
      // setSelectedLanguages([]);
      // setArtists([]);
      toast("You can now log in with your credentials.", {
        position: "top-center",
        duration: 4000,
        type: "info",
      });
      // Optionally navigate to home or login flow
      // router.push("/home");
    } catch (error) {
      toast("Registration Failed", {
        description: "Unable to create account. Please try again.",
        position: "top-center",
        duration: 4000,
        type: "error",
      });
    }
  };
  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) return;
    // localStorage.setItem("feelDiaryUser", JSON.stringify({ username, isAnonymous: signInMode === "anonymous" }))
    try {
      let response = await instance.post("auth/login", { username, password });
      if (response.status === 200) {
        toast("Login Successful", {
          description: "Welcome back! You have successfully logged in.",
          position: "top-center",
          duration: 4000,
          type: "success",
        });
        getEntries();
        setUser({
          id: response?.data?.user?._id,
          username: response?.data?.user?.username,
          favoriteArtists: response?.data?.user?.favoriteArtists,
          languages: response?.data?.user?.languages,
        });
        setLoggedIn(true);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: response.data.user,
            username: username,
            favoriteArtists: response?.data?.user?.favoriteArtists,
            languages: response?.data?.user?.languages,
          })
        );
        getEntries();
        setLoggedIn(true);
        router.push("/home");
      }
    } catch (error) {
      toast("Login Failed", {
        description: "Please check your credentials and try again.",

        position: "top-center",
        duration: 4000,
        type: "error",
      });
    }
    // setCurrentView("dashboard")
    setShowSignIn(false);
  };
  const router = useRouter();

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
            <a
              href="#about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {data ? `Welcome, ${data?.username}` : ""}
            </a>
            <a
              href="https://github.com/sushilbhattarai45/feeldiary"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Github
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
          className="fixed align backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
        >
          <Card className="w-full max-w-md shadow-2xl border-2 animate-in zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to FeelDiary</CardTitle>
              <CardDescription>
                Choose how you'd like to sign in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs
                value={signInMode}
                onValueChange={(v) =>
                  setSignInMode(v as "regular" | "anonymous")
                }
              >
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
                  <p className="text-sm text-muted-foreground">
                    Sign in with your identity visible to the community
                  </p>
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
                          Your identity will remain completely private. You can
                          still track your personal journal, but the community
                          won't see your name.
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
                    setShowSignIn(false);
                    setUsername("");
                    setPassword("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    signInMode === "regular" ? handleSignIn : handleSignUp
                  }
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

      {/* Onboarding Modal (required before account creation) */}
      {showOnboarding && (
        <div
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          className="fixed align backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
        >
          <Card className="w-full max-w-2xl shadow-2xl border-2 animate-in zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">
                Tell us about your preferences
              </CardTitle>
              <CardDescription>
                Select your preferred language(s) and add artists you usually
                listen to. This helps personalize recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2">Preferred Languages</Label>
                <div className="flex flex-wrap gap-3 mt-4">
                  {["English", "Nepali", "Hindi"].map((l) => (
                    <button
                      key={l}
                      onClick={() => toggleLanguage(l)}
                      style={{
                        fontSize: "12px",
                      }}
                      className={`px-3 py-1  rounded-full border transition-colors ${
                        selectedLanguages.includes(l)
                          ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                          : "bg-white text-foreground hover:bg-slate-50"
                      }`}
                      aria-pressed={selectedLanguages.includes(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Add another language"
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && langInput.trim()) {
                        toggleLanguage(langInput.trim());
                        setLangInput("");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (langInput.trim()) {
                        toggleLanguage(langInput.trim());
                        setLangInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLanguages.map((l) => (
                    <Badge
                      key={l}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary"
                    >
                      <span>{l}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLanguage(l);
                        }}
                        aria-label={`Remove ${l}`}
                        className="ml-1 text-xs opacity-80 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2">Favorite Artists</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Type artist and press Enter"
                    value={artistInput}
                    onChange={(e) => setArtistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArtist();
                      }
                    }}
                  />
                  <Button onClick={addArtist}>Add</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {artists.map((a) => (
                    <Badge
                      key={a}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary"
                    >
                      <span>{a}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeArtist(a);
                        }}
                        aria-label={`Remove ${a}`}
                        className="ml-1 text-xs opacity-80 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Allow user to go back and edit credentials
                    setShowOnboarding(false);
                    setShowSignIn(true);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={finalizeSignUp}
                  disabled={
                    selectedLanguages.length === 0 || artists.length === 0
                  }
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <main
        style={{
          height: "70vh",
          alignContent: "center",
        }}
        className="container mx-auto px-4 py-20"
      >
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium border"
            >
              <Sparkles className="mr-2 h-4 w-4 inline" />
              AI-Powered Journaling Platform
            </Badge>
            <h2 className="text-6xl md:text-7xl font-bold text-balance leading-tight text-foreground">
              Your Digital <span className="text-primary">Sanctuary</span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              A calm space to journal, understand your emotions, and write with
              music that matches your mood. FeelDiary combines private
              journaling with AI insights to support your emotional wellness
              journey.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setShowSignIn(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 text-white font-medium"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started{" "}
            </Button>
            <Button
              onClick={() =>
                window.open(
                  "https://github.com/sushilbhattarai45/feeldiary",
                  "_blank"
                )
              }
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-2 bg-white"
            >
              Github{" "}
            </Button>
          </div>
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
  );
}

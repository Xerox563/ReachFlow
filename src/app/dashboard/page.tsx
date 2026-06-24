"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  History as HistoryIcon,
  Layout,
  Mic2,
  Library,
  Settings,
  Plus,
  MessageSquare,
  Calendar,
  RefreshCw,
  Trash2,
  Edit2,
  Wand2,
  Scissors,
  Maximize2,
  Briefcase,
  Zap,
  ThumbsUp,
  Lightbulb,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Star,
  Share2,
  Upload,
  Info,
  ExternalLink,
  Heart,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Sun,
  ChevronDown,
  Bookmark,
  LogOut,
  User as UserIcon,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReferencePost, SavedPost, PostVariation } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type DashboardSection =
  | "newPost"
  | "history"
  | "calendar"
  | "voice"
  | "library"
  | "comment";

// Check if Supabase is configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated" | "demo">("loading");
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [section, setSection] = useState<DashboardSection>("newPost");

  // New Post State
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);
  const [audience, setAudience] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ReferencePost | null>(
    null,
  );
  const [styles, setStyles] = useState<ReferencePost[]>([]);
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [selectedHook, setSelectedHook] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [variations, setVariations] = useState<PostVariation | undefined>(
    undefined,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Voice Settings State
  const [voiceSamples, setVoiceSamples] = useState<string[]>([]);
  const [newSample, setNewSample] = useState("");

  // Post History State
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStyle, setFilterStyle] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Comment Generator State
  const [postToComment, setPostToComment] = useState("");
  const [commentGoal, setCommentGoal] = useState<
    "network" | "engage" | "insightful"
  >("engage");
  const [generatedComment, setGeneratedComment] = useState("");

  const steps = ["Topic", "Style", "Hook", "Generate", "Edit"];

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode - use localStorage
      const savedPosts = localStorage.getItem("reachflow_posts");
      const savedVoices = localStorage.getItem("reachflow_voice");
      
      if (savedPosts) setSavedPosts(JSON.parse(savedPosts));
      if (savedVoices) setVoiceSamples(JSON.parse(savedVoices));
      
      setStatus("demo");
      setUser({ email: "demo@reachflow.com" });
      fetchStyles();
      return;
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setStatus("authenticated");
        loadSavedPosts(session.user.id);
        loadVoiceSamples(session.user.id);
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    // Check initial session
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setStatus("authenticated");
        loadSavedPosts(session.user.id);
        loadVoiceSamples(session.user.id);
      } else {
        setStatus("unauthenticated");
      }
      fetchStyles();
    };
    init();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStyles = async () => {
    const res = await fetch("/api/reference-posts");
    const data = await res.json();
    setStyles(data);
  };

  const loadSavedPosts = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setSavedPosts(data.map((p: any) => ({
        ...p,
        createdAt: p.created_at
      })));
    }
  };

  const loadVoiceSamples = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    
    const { data, error } = await supabase
      .from("voices")
      .select("*")
      .eq("user_id", userId);

    if (data) {
      setVoiceSamples(data.map((v: any) => v.content));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.info("Demo mode active - no Supabase configured");
      return;
    }
    
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Check your email for verification.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.info("Demo mode active - no Supabase configured");
      return;
    }
    
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        toast.error(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    toast.success("Logged out!");
  };

  const saveVoiceSample = async () => {
    if (newSample.trim()) {
      if (isSupabaseConfigured && user?.id) {
        const { error } = await supabase.from("voices").insert([
          {
            user_id: user.id,
            content: newSample.trim(),
          },
        ]);

        if (error) {
          toast.error("Failed to save voice sample");
          return;
        }
      } else {
        // Demo mode - localStorage
        const updated = [...voiceSamples, newSample.trim()];
        localStorage.setItem("reachflow_voice", JSON.stringify(updated));
      }

      setVoiceSamples([...voiceSamples, newSample.trim()]);
      setNewSample("");
      toast.success("Voice sample saved!");
    }
  };

  const removeVoiceSample = async (index: number) => {
    const sampleContent = voiceSamples[index];
    const updated = voiceSamples.filter((_, i) => i !== index);
    
    if (isSupabaseConfigured && user?.id) {
      const { error } = await supabase
        .from("voices")
        .delete()
        .eq("user_id", user.id)
        .eq("content", sampleContent);

      if (error) {
        toast.error("Failed to remove voice sample");
        return;
      }
    } else {
      // Demo mode - localStorage
      localStorage.setItem("reachflow_voice", JSON.stringify(updated));
    }

    setVoiceSamples(updated);
  };

  const addKeyPoint = () => setKeyPoints([...keyPoints, ""]);
  const updateKeyPoint = (index: number, val: string) => {
    const newPoints = [...keyPoints];
    newPoints[index] = val;
    setKeyPoints(newPoints);
  };

  const generateHooks = async () => {
    if (!topic) {
      toast.error("Please enter a topic first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hooks",
          topic,
          count: 10,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHookOptions(data.result);
      toast.success("Hooks generated!");
    } catch (error) {
      toast.error("Failed to generate hooks");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic || !selectedStyle) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    setCurrentStep(3);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post",
          topic,
          keyPoints: keyPoints.filter((p) => p.trim()),
          audience,
          style: selectedStyle,
          voiceSamples: voiceSamples.length > 0 ? voiceSamples : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let finalContent = data.result;
      if (selectedHook) {
        // Replace the first sentence with the selected hook
        const sentences = finalContent.split(/(?<=[.!?])\s+/);
        sentences[0] = selectedHook;
        finalContent = sentences.join(" ");
      }

      setGeneratedContent(finalContent);
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate post");
      setCurrentStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVariations = async () => {
    if (!generatedContent) {
      toast.error("Generate a post first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "variations",
          content: generatedContent,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVariations(data.result);
      toast.success("Variations generated!");
    } catch (error) {
      toast.error("Failed to generate variations");
    } finally {
      setIsGenerating(false);
    }
  };

  const editPost = async (
    action: "rewrite" | "shorten" | "expand" | "professional" | "viral",
  ) => {
    if (!generatedContent) {
      toast.error("Generate a post first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "edit",
          content: generatedContent,
          action,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedContent(data.result);
      toast.success("Post edited!");
    } catch (error) {
      toast.error("Failed to edit post");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComment = async () => {
    if (!postToComment) {
      toast.error("Please paste a post first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          postContent: postToComment,
          goal: commentGoal,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedComment(data.result);
      toast.success("Comment generated!");
    } catch (error) {
      toast.error("Failed to generate comment");
    } finally {
      setIsGenerating(false);
    }
  };

  const savePost = async () => {
    if (!generatedContent) return;
    
    if (isSupabaseConfigured && user?.id) {
      const newPostData = {
        user_id: user.id,
        topic,
        keyPoints,
        audience,
        selectedStyle: selectedStyle!,
        content: generatedContent,
        hookOptions,
        selectedHook,
        variations,
        isFavorite: false,
        uses: 1,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([newPostData])
        .select()
        .single();

      if (error) {
        toast.error("Failed to save post");
        return;
      }

      setSavedPosts([{ ...data, createdAt: data.created_at }, ...savedPosts]);
    } else {
      // Demo mode - localStorage
      const newPost: SavedPost = {
        id: Date.now().toString(),
        topic,
        keyPoints,
        audience,
        selectedStyle: selectedStyle!,
        content: generatedContent,
        hookOptions,
        selectedHook,
        variations,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        uses: 1,
      };
      const updated = [newPost, ...savedPosts];
      localStorage.setItem("reachflow_posts", JSON.stringify(updated));
      setSavedPosts(updated);
    }
    
    toast.success("Post saved!");
  };

  const deletePost = async (id: string) => {
    const updated = savedPosts.filter((p) => p.id !== id);
    
    if (isSupabaseConfigured && user?.id) {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to delete post");
        return;
      }
    } else {
      // Demo mode - localStorage
      localStorage.setItem("reachflow_posts", JSON.stringify(updated));
    }

    setSavedPosts(updated);
    toast.success("Post deleted");
  };

  const toggleFavorite = async (id: string) => {
    const post = savedPosts.find(p => p.id === id);
    if (!post) return;

    const updatedFavorite = !post.isFavorite;
    const updated = savedPosts.map(p => 
      p.id === id ? { ...p, isFavorite: updatedFavorite } : p
    );

    if (isSupabaseConfigured && user?.id) {
      const { error } = await supabase
        .from("posts")
        .update({ isFavorite: updatedFavorite })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to update favorite");
        return;
      }
    } else {
      // Demo mode
      localStorage.setItem("reachflow_posts", JSON.stringify(updated));
    }

    setSavedPosts(updated);
    toast.success(updatedFavorite ? "Added to favorites" : "Removed from favorites");
  };

  const filteredPosts = savedPosts.filter(post => {
    const matchesSearch = 
      post.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStyle = 
      filterStyle === "all" || 
      post.selectedStyle.category.toLowerCase() === filterStyle.toLowerCase();

    return matchesSearch && matchesStyle;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPost = async (post: SavedPost) => {
    setTopic(post.topic);
    setKeyPoints(post.keyPoints);
    setAudience(post.audience);
    setSelectedStyle(post.selectedStyle);
    setHookOptions(post.hookOptions);
    setSelectedHook(post.selectedHook || "");
    setGeneratedContent(post.content);
    setVariations(post.variations);
    setCurrentStep(4);
    setSection("newPost");

    // Increment uses
    const updatedUses = (post.uses || 0) + 1;
    const updated = savedPosts.map(p => 
      p.id === post.id ? { ...p, uses: updatedUses } : p
    );

    if (isSupabaseConfigured && user?.id) {
      await supabase
        .from("posts")
        .update({ uses: updatedUses })
        .eq("id", post.id)
        .eq("user_id", user.id);
    } else {
      localStorage.setItem("reachflow_posts", JSON.stringify(updated));
    }
    setSavedPosts(updated);
  };

  const resetNewPost = () => {
    setTopic("");
    setKeyPoints([""]);
    setAudience("");
    setSelectedStyle(null);
    setHookOptions([]);
    setSelectedHook("");
    setGeneratedContent("");
    setVariations(undefined);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 0 && !topic) {
        toast.error("Please enter a topic");
        return;
      }
      if (currentStep === 1 && !selectedStyle) {
        toast.error("Please select a style");
        return;
      }
      if (currentStep === 2) {
        if (hookOptions.length === 0) {
          generateHooks();
        } else {
          handleGenerate();
        }
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navItems: { key: DashboardSection; label: string; icon: any }[] = [
    { key: "newPost", label: "New Post", icon: Plus },
    { key: "history", label: "Post History", icon: HistoryIcon },
    { key: "calendar", label: "Content Calendar", icon: Calendar },
    { key: "voice", label: "Voice Settings", icon: Mic2 },
    { key: "library", label: "Reference Library", icon: Library },
    { key: "comment", label: "AI Comments", icon: MessageSquare },
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F7] dark:bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAF9F7] dark:bg-gray-950 px-4">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {authView === "login" ? "Welcome Back" : "Create an Account"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-center">
          {authView === "login" 
            ? "Sign in to your ReachFlow account to continue." 
            : "Create your free account to start generating content."}
        </p>
        <Card className="w-full max-w-md p-8 shadow-xl dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <form onSubmit={authView === "login" ? handleLogin : handleSignup} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              </div>
              <Input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-500/20"
            >
              {authLoading ? "Loading..." : authView === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authView === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setAuthView(authView === "login" ? "signup" : "login")}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                {authView === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF9F7] dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FAF9F7] dark:bg-gray-900 border-r border-gray-200/70 dark:border-gray-800 hidden lg:flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
            ReachFlow
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = section === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-semibold dark:bg-orange-950/30 dark:text-orange-400"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-6">
          <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/60 transition-colors text-left">
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-end px-8 gap-3 bg-[#FAF9F7] dark:bg-gray-950">
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 group">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-semibold flex items-center justify-center text-sm overflow-hidden">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                    Welcome
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                    {user.email}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </header>

        <main className="flex-1 overflow-auto px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* New Post Section */}
            {section === "newPost" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                    Create New Post
                  </h1>
                  <Button
                    variant="outline"
                    onClick={resetNewPost}
                    className="rounded-lg border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Progress Steps */}
                <div>
                  <div className="flex justify-between items-center">
                    {steps.map((step, index) => (
                      <div
                        key={step}
                        className="flex items-center flex-1 last:flex-none"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: index === currentStep ? 1 : 0.95,
                            }}
                            transition={{ duration: 0.2 }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                              index <= currentStep
                                ? "bg-orange-500 text-white"
                                : "bg-white border border-gray-300 text-gray-400 dark:bg-gray-900 dark:border-gray-700"
                            }`}
                          >
                            {index + 1}
                          </motion.div>
                          <span
                            className={`text-sm whitespace-nowrap ${
                              index === currentStep
                                ? "text-orange-600 font-semibold dark:text-orange-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800 mx-3 mb-5" />
                        )}
                      </div>
                    ))}
                  </div>
                  <motion.div
                    className="h-0.5 bg-orange-500 mt-2 rounded-full"
                    style={{ width: 40 }}
                    layout
                  />
                </div>

                <AnimatePresence mode="wait">
                  {/* Topic Step */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          Let's start with your topic
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Enter your topic and key points to help AI generate
                          better content.
                        </p>

                        <div className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Post Topic
                            </label>
                            <Input
                              placeholder="e.g. Why AI is changing the way founders build startups"
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              className="h-11 rounded-lg border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-700 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Target Audience
                            </label>
                            <Input
                              placeholder="Select audience"
                              value={audience}
                              onChange={(e) => setAudience(e.target.value)}
                              className="h-11 rounded-lg border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-700 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Key Points
                              </label>
                              <span className="text-xs text-gray-400">
                                {keyPoints.filter((p) => p.trim()).length} / 10
                                points
                              </span>
                            </div>
                            <div className="space-y-2">
                              {keyPoints.map((point, i) => (
                                <Input
                                  key={i}
                                  placeholder={
                                    i === 0
                                      ? "Add your key points (one per line)"
                                      : `Point ${i + 1}`
                                  }
                                  value={point}
                                  onChange={(e) =>
                                    updateKeyPoint(i, e.target.value)
                                  }
                                  className="h-11 rounded-lg border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-700 placeholder:text-gray-400"
                                />
                              ))}
                            </div>
                            <button
                              onClick={addKeyPoint}
                              className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors pt-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add another point
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Additional Context{" "}
                              <span className="text-gray-400 font-normal">
                                (Optional)
                              </span>
                            </label>
                            <Textarea
                              placeholder="Add any specific context, background, or additional information..."
                              className="min-h-[110px] rounded-lg border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-700 placeholder:text-gray-400 resize-y"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleNext}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 h-11"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Style Step */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Choose a style
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {styles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setSelectedStyle(style)}
                            className={`text-left rounded-2xl border p-5 transition-all bg-white dark:bg-gray-900 ${
                              selectedStyle?.id === style.id
                                ? "border-orange-500 ring-1 ring-orange-500"
                                : "border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-100 dark:border-orange-900/50 uppercase tracking-wide">
                                {style.category}
                              </span>
                              {selectedStyle?.id === style.id && (
                                <Check className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 italic mb-4">
                              "{style.content}"
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {style.tags.hook}
                              </span>
                              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {style.tags.structure}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePrev}
                          className="rounded-lg border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 h-11"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={!selectedStyle}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 h-11"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Hook Step */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Choose your hook
                        </h2>
                        <Button
                          variant="outline"
                          onClick={generateHooks}
                          disabled={isGenerating}
                          className="rounded-lg border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
                          />
                          Generate New Hooks
                        </Button>
                      </div>
                      {hookOptions.length > 0 ? (
                        <div className="grid gap-3">
                          {hookOptions.map((hook, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedHook(hook)}
                              className={`text-left rounded-2xl border p-4 transition-all bg-white dark:bg-gray-900 ${
                                selectedHook === hook
                                  ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50/30 dark:bg-orange-950/20"
                                  : "border-gray-200/80 dark:border-gray-800 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    selectedHook === hook
                                      ? "border-orange-500"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  {selectedHook === hook && (
                                    <Check className="w-3 h-3 text-orange-500" />
                                  )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  {hook}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 text-center py-16">
                          <Lightbulb className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Click "Generate New Hooks" to get started
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePrev}
                          className="rounded-lg border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 h-11"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 h-11"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              Generate Post
                              <Sparkles className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Generating Step */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-24 space-y-6"
                    >
                      <div className="relative w-20 h-20">
                        <div className="w-20 h-20 border-4 border-orange-100 dark:border-orange-900/50 rounded-full" />
                        <motion.div
                          className="w-20 h-20 border-4 border-orange-500 rounded-full border-t-transparent absolute top-0 left-0"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <Sparkles className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                          Generating your post...
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Matching your selected style and tone
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Edit Step */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden">
                        <div className="bg-gray-50/80 dark:bg-gray-800 px-6 py-3.5 border-b border-gray-200/80 dark:border-gray-700 flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Your Post
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(generatedContent)}
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="p-6">
                          <Textarea
                            className="w-full min-h-[300px] text-base leading-relaxed text-gray-700 dark:text-gray-300 bg-transparent border-none focus-visible:ring-0 resize-none p-0"
                            value={generatedContent}
                            onChange={(e) =>
                              setGeneratedContent(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Edit Tools */}
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                          Edit Tools
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => editPost("rewrite")}
                            disabled={isGenerating}
                            className="rounded-lg border-gray-200 dark:border-gray-700"
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Rewrite
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => editPost("shorten")}
                            disabled={isGenerating}
                            className="rounded-lg border-gray-200 dark:border-gray-700"
                          >
                            <Scissors className="w-4 h-4 mr-2" />
                            Shorten
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => editPost("expand")}
                            disabled={isGenerating}
                            className="rounded-lg border-gray-200 dark:border-gray-700"
                          >
                            <Maximize2 className="w-4 h-4 mr-2" />
                            Expand
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => editPost("professional")}
                            disabled={isGenerating}
                            className="rounded-lg border-gray-200 dark:border-gray-700"
                          >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Pro
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => editPost("viral")}
                            disabled={isGenerating}
                            className="rounded-lg border-gray-200 dark:border-gray-700"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Viral
                          </Button>
                        </div>
                      </div>

                      {/* Variations */}
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Variations
                          </h3>
                          <Button
                            variant="outline"
                            onClick={generateVariations}
                            disabled={isGenerating || !generatedContent}
                            className="rounded-lg border-gray-200 dark:border-gray-700"
                          >
                            <RefreshCw
                              className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
                            />
                            Generate Variations
                          </Button>
                        </div>
                        {variations && (
                          <div className="mt-4">
                            <Tabs defaultValue="story">
                              <TabsList className="grid grid-cols-3">
                                <TabsTrigger value="story">Story</TabsTrigger>
                                <TabsTrigger value="professional">
                                  Professional
                                </TabsTrigger>
                                <TabsTrigger value="engaging">
                                  Engaging
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="story" className="mt-4">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {variations.story}
                                  </p>
                                </div>
                              </TabsContent>
                              <TabsContent
                                value="professional"
                                className="mt-4"
                              >
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {variations.professional}
                                  </p>
                                </div>
                              </TabsContent>
                              <TabsContent value="engaging" className="mt-4">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {variations.engaging}
                                  </p>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={savePost}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-11 px-6"
                        >
                          Save to History
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="rounded-lg border-gray-200 dark:border-gray-700 h-11"
                        >
                          Try Another Style
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handlePrev}
                          className="rounded-lg border-gray-200 dark:border-gray-700 h-11"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Post History Section */}
            {section === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                      Post History
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      View, edit, and reuse your previously generated posts.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg text-sm"
                      />
                    </div>
                    <Select value={filterStyle} onValueChange={setFilterStyle}>
                      <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg text-sm">
                        <SelectValue placeholder="All Styles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Styles</SelectItem>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Posts", value: savedPosts.length, icon: HistoryIcon, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
                    { label: "This Month", value: savedPosts.filter(p => p.createdAt && new Date(p.createdAt).getMonth() === new Date().getMonth()).length, icon: Calendar, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                    { label: "Total Uses", value: savedPosts.reduce((acc, p) => acc + (p.uses || 0), 0), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Favorites", value: savedPosts.filter(p => p.isFavorite).length, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
                  ].map((stat, i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Post</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Style</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uses</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {paginatedPosts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                              {searchQuery || filterStyle !== "all" ? "No posts match your filters" : "No saved posts yet"}
                            </td>
                          </tr>
                        ) : (
                          paginatedPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                              <td className="px-6 py-4 min-w-[300px]">
                                <div className="flex items-start gap-3">
                                  <Star 
                                    className={`w-4 h-4 mt-1 transition-colors cursor-pointer ${
                                      post.isFavorite 
                                        ? "text-yellow-500 fill-yellow-500" 
                                        : "text-gray-300 dark:text-gray-600 group-hover:text-yellow-500"
                                    }`}
                                    onClick={() => toggleFavorite(post.id)}
                                  />
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{post.topic}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 italic">"{post.content}"</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  post.selectedStyle.category === 'Founder' ? 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' :
                                  post.selectedStyle.category === 'AI' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                                  'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400'
                                }`}>
                                  {post.selectedStyle.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                {post.uses || 0}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.content)} className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => loadPost(post)} className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500">
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 disabled:opacity-50"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 font-bold text-xs ${
                            currentPage === page
                              ? "bg-orange-500 text-white"
                              : "text-gray-400 hover:text-orange-500"
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 disabled:opacity-50"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Content Calendar Section */}
            {section === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                      Content Calendar
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Plan and schedule your content to stay consistent.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-gray-400">Week</Button>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-xs bg-orange-500 text-white font-bold rounded-md shadow-sm">Month</Button>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-10 px-4 font-bold text-sm shadow-lg shadow-orange-500/20">
                      <Plus className="w-4 h-4 mr-2" />
                      New Plan
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500 border border-gray-100 dark:border-gray-800">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">June 2024</h2>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500 border border-gray-100 dark:border-gray-800">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-gray-200 dark:border-gray-800 text-gray-500">Today</Button>
                  </div>

                  <div className="grid grid-cols-7 border-b border-gray-50 dark:border-gray-800">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                      <div key={day} className="py-3 text-center text-[10px] font-bold text-gray-400 tracking-widest">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 auto-rows-[120px]">
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - 2; // Offset for June 2024 starting on Saturday
                      const isCurrentMonth = day > 0 && day <= 30;
                      return (
                        <div key={i} className={`p-2 border-r border-b border-gray-50 dark:border-gray-800/50 relative ${!isCurrentMonth ? 'bg-gray-50/30 dark:bg-gray-900/30' : ''}`}>
                          <span className={`text-xs font-bold ${day === 24 ? 'w-6 h-6 bg-orange-500 text-white flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                            {day > 0 && day <= 30 ? day : day <= 0 ? 31 + day : day - 30}
                          </span>
                          
                          {day === 10 && (
                            <div className="mt-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 space-y-1 group cursor-pointer transition-all hover:scale-[1.02]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tight">Post Idea</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">AI in Startups</p>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 italic">Hook: Power Stand</p>
                            </div>
                          )}

                          {day === 11 && (
                            <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 space-y-1 group cursor-pointer transition-all hover:scale-[1.02]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-tight">Post Idea</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">Founder Mindset</p>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 italic">Hook: Personal Story</p>
                            </div>
                          )}

                          {day === 4 && (
                            <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 space-y-1 group cursor-pointer transition-all hover:scale-[1.02]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">Post Idea</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">Sales Tips</p>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 italic">Hook: Contrarian</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Draft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empty</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Voice Settings Section */}
            {section === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                      Voice Calibration
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Train ReachFlow on your writing style to match your unique voice.
                    </p>
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-10 px-4 font-bold text-sm shadow-lg shadow-orange-500/20">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Calibrate Voice
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Add samples */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group">
                      <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add writing samples</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag & drop your LinkedIn posts here or paste content directly.</p>
                        </div>
                        <div className="pt-4 flex flex-wrap justify-center gap-4">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <Check className="w-3 h-3 text-green-500" />
                            Add 3-5 of your best posts
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <Check className="w-3 h-3 text-green-500" />
                            More samples = better match
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <Check className="w-3 h-3 text-green-500" />
                            We never store your data permanently
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <div className="p-4 border-b border-gray-50 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Samples</h3>
                      </div>
                      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {[
                          { title: "Post about AI tools", date: "Added 2 days ago" },
                          { title: "Founder lessons", date: "Added 5 days ago" },
                          { title: "Building in public", date: "Added 1 week ago" },
                        ].map((sample, i) => (
                          <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <HistoryIcon className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{sample.title}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{sample.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Analysis */}
                  <div className="space-y-6">
                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Your Voice Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: "Tone", value: "Professional, Conversational", status: "Strong", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                          { label: "Sentence Length", value: "Medium", status: "Strong", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                          { label: "Hook Style", value: "Curiosity-driven", status: "Strong", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                          { label: "CTA Style", value: "Soft authority", status: "Good", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
                          { label: "Vocabulary", value: "Clear, Simple, Actionable", status: "Strong", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                        ].map((trait, i) => (
                          <div key={i} className="flex items-center justify-between group">
                            <div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{trait.label}</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{trait.value}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${trait.bg} ${trait.color}`}>{trait.status}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Voice Match Score</h3>
                          <Info className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <div className="flex flex-col items-center justify-center py-4 relative">
                          <div className="w-32 h-32 rounded-full border-[10px] border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">92%</span>
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Excellent</span>
                          </div>
                          <svg className="absolute w-32 h-32 -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="59"
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth="10"
                              strokeDasharray={2 * Math.PI * 59}
                              strokeDashoffset={2 * Math.PI * 59 * (1 - 0.92)}
                              className="text-orange-500"
                            />
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase">
                            <span>Analysis Progress</span>
                            <span>92%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "92%" }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-orange-500" 
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic pt-2 text-center">Your content aligns well with your unique voice.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reference Library Section */}
            {section === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                      Reference Library
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Browse high-performing posts and proven content styles.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search reference posts..."
                        className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg text-sm"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px] h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg text-sm">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-10 px-4 font-bold text-sm shadow-lg shadow-orange-500/20">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Post
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {styles.map((style, i) => (
                    <motion.div
                      key={style.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              style.category === 'Founder' ? 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' :
                              style.category === 'AI' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                              'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400'
                            }`}>
                              {style.category}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-orange-500">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-orange-500">
                                <Heart className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-sm font-bold text-gray-900 dark:text-white mt-3 line-clamp-2">
                            {style.content.split('\n')[0].replace(/#/g, '') || "High Performing Post"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-4 italic flex-1">
                            "{style.content}"
                          </p>
                          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex flex-wrap gap-1.5">
                            <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-tight">{style.tags.hook}</span>
                            <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-tight">{style.tags.structure}</span>
                            <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-tight">{style.tags.contentType}</span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">High Performance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-orange-500">
                                <Bookmark className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-orange-500">
                                <Info className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Comment Generator Section */}
            {section === "comment" && (
              <motion.div
                key="comment"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                    AI Comment Generator
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Generate thoughtful, engaging comments for LinkedIn posts.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: Input */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Post to comment on</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="relative">
                          <Textarea
                            placeholder="Just shipped our new product! It's been 12 months of hard work by an incredible team. Excited to see how our users love it."
                            className="min-h-[200px] bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 focus:ring-orange-500/20 rounded-xl resize-none text-sm"
                            value={postToComment}
                            onChange={(e) => setPostToComment(e.target.value)}
                          />
                          <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium">120 / 1000</div>
                        </div>
                        <Button
                          onClick={generateComment}
                          disabled={!postToComment || isGenerating}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-10 font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              Analyze Post
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Generated Comments */}
                  <div className="lg:col-span-3 space-y-6">
                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-800 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Generated Comments</CardTitle>
                        <div className="flex items-center gap-1.5">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold bg-orange-500 text-white rounded-md">Insightful</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Networking</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Supportive</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Question</Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 overflow-auto">
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                          {[
                            "Congrats on the launch! 12 months of hard work always shows. Can't wait to see the impact it creates for your users.",
                            "Love seeing teams bringing ideas to life! What's been the most challenging part of this journey?",
                            "Huge congratulations! The best feeling is when your users truly love what you've built. Wishing you all the success!",
                          ].map((comment, i) => (
                            <div key={i} className="p-6 space-y-4 group hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                  <MessageSquare className="w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment}</p>
                              </div>
                              <div className="flex items-center justify-between pl-12">
                                <div className="flex items-center gap-3">
                                  <button className="text-gray-400 hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /></button>
                                  <button className="text-gray-400 hover:text-orange-500 transition-colors"><ThumbsUp className="w-4 h-4" /></button>
                                  <button className="text-gray-400 hover:text-gray-600 transition-colors"><ThumbsDown className="w-4 h-4" /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500" onClick={() => copyToClipboard(comment)}>
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500">
                                    <Bookmark className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <div className="p-4 border-t border-gray-50 dark:border-gray-800 flex justify-center">
                        <Button variant="ghost" size="sm" className="text-[11px] font-bold text-gray-400 hover:text-orange-500 uppercase tracking-widest">
                          <RefreshCw className="w-3.5 h-3.5 mr-2" />
                          Generate More
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

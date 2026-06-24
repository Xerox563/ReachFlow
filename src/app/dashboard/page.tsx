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
  Sun,
  ChevronDown,
  Home,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ReferencePost, SavedPost, PostVariation } from "@/types";
import { toast } from "sonner";

type DashboardSection =
  | "newPost"
  | "history"
  | "calendar"
  | "voice"
  | "library"
  | "comment";

export default function Dashboard() {
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

  // Comment Generator State
  const [postToComment, setPostToComment] = useState("");
  const [commentGoal, setCommentGoal] = useState<
    "network" | "engage" | "insightful"
  >("engage");
  const [generatedComment, setGeneratedComment] = useState("");

  const steps = ["Topic", "Style", "Hook", "Generate", "Edit"];

  useEffect(() => {
    fetchStyles();
    loadSavedPosts();
    loadVoiceSamples();
  }, []);

  const fetchStyles = async () => {
    const res = await fetch("/api/reference-posts");
    const data = await res.json();
    setStyles(data);
  };

  const loadSavedPosts = () => {
    const saved = localStorage.getItem("reachflow_posts");
    if (saved) {
      setSavedPosts(JSON.parse(saved));
    }
  };

  const loadVoiceSamples = () => {
    const saved = localStorage.getItem("reachflow_voice");
    if (saved) {
      setVoiceSamples(JSON.parse(saved));
    }
  };

  const saveVoiceSample = () => {
    if (newSample.trim()) {
      const updated = [...voiceSamples, newSample.trim()];
      setVoiceSamples(updated);
      localStorage.setItem("reachflow_voice", JSON.stringify(updated));
      setNewSample("");
      toast.success("Voice sample saved!");
    }
  };

  const removeVoiceSample = (index: number) => {
    const updated = voiceSamples.filter((_, i) => i !== index);
    setVoiceSamples(updated);
    localStorage.setItem("reachflow_voice", JSON.stringify(updated));
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

  const savePost = () => {
    if (!generatedContent) return;
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
    };
    const updated = [newPost, ...savedPosts];
    setSavedPosts(updated);
    localStorage.setItem("reachflow_posts", JSON.stringify(updated));
    toast.success("Post saved!");
  };

  const deletePost = (id: string) => {
    const updated = savedPosts.filter((p) => p.id !== id);
    setSavedPosts(updated);
    localStorage.setItem("reachflow_posts", JSON.stringify(updated));
    toast.success("Post deleted");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPost = (post: SavedPost) => {
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
          <button className="flex items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-semibold flex items-center justify-center text-sm">
              N
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
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
              <div className="space-y-6">
                <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                  Post History
                </h1>
                {savedPosts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 text-center py-16">
                    <HistoryIcon className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No saved posts yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                              {post.topic}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 text-sm">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                                {post.selectedStyle.category}
                              </span>
                              <span>
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadPost(post)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(post.content)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Calendar Section */}
            {section === "calendar" && (
              <div className="space-y-6">
                <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                  Content Calendar
                </h1>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-10 text-center">
                  <Calendar className="w-14 h-14 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Calendar Coming Soon
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Plan your content schedule here
                  </p>
                </div>
              </div>
            )}

            {/* Voice Settings Section */}
            {section === "voice" && (
              <div className="space-y-6">
                <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                  Voice Calibration
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Add examples of your writing to help the AI match your unique
                  voice and style
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Add a writing sample
                    </label>
                    <Textarea
                      placeholder="Paste one of your LinkedIn posts here..."
                      className="min-h-[120px] rounded-lg border-gray-200 dark:border-gray-700"
                      value={newSample}
                      onChange={(e) => setNewSample(e.target.value)}
                    />
                    <Button
                      onClick={saveVoiceSample}
                      disabled={!newSample.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-11"
                    >
                      Save Sample
                    </Button>
                  </div>

                  {voiceSamples.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Your Samples
                      </h3>
                      {voiceSamples.map((sample, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex justify-between gap-4"
                        >
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 flex-1 text-sm">
                            {sample}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVoiceSample(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reference Library Section */}
            {section === "library" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                    Reference Library
                  </h1>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-11">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Post
                  </Button>
                </div>
                <div className="grid gap-4">
                  {styles.map((style) => (
                    <div
                      key={style.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-900/50 uppercase mb-2 inline-block">
                            {style.category}
                          </span>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 text-sm">
                            {style.content}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                              {style.tags.hook}
                            </span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                              {style.tags.structure}
                            </span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                              {style.tags.contentType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Comment Generator Section */}
            {section === "comment" && (
              <div className="space-y-6">
                <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
                  AI Comment Generator
                </h1>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Paste a LinkedIn post
                    </label>
                    <Textarea
                      placeholder="Paste a LinkedIn post here to generate a comment..."
                      className="min-h-[150px] rounded-lg border-gray-200 dark:border-gray-700"
                      value={postToComment}
                      onChange={(e) => setPostToComment(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Comment goal
                    </label>
                    <Tabs
                      defaultValue={commentGoal}
                      onValueChange={(v) => setCommentGoal(v as any)}
                    >
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="network">Network</TabsTrigger>
                        <TabsTrigger value="engage">Engage</TabsTrigger>
                        <TabsTrigger value="insightful">Insightful</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <Button
                    onClick={generateComment}
                    disabled={!postToComment || isGenerating}
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-lg h-11"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Generate Comment
                      </>
                    )}
                  </Button>

                  {generatedComment && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-6 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {generatedComment}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(generatedComment)}
                        className="rounded-lg"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Comment
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

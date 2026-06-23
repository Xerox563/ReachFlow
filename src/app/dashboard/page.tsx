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
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ReferencePost, SavedPost, PostVariation } from "@/types";
import { toast } from "sonner";

type DashboardSection = 'newPost' | 'history' | 'calendar' | 'voice' | 'library' | 'comment';

export default function Dashboard() {
  const [section, setSection] = useState<DashboardSection>('newPost');
  
  // New Post State
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);
  const [audience, setAudience] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ReferencePost | null>(null);
  const [styles, setStyles] = useState<ReferencePost[]>([]);
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [selectedHook, setSelectedHook] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [variations, setVariations] = useState<PostVariation | undefined>(undefined);
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
  const [commentGoal, setCommentGoal] = useState<'network' | 'engage' | 'insightful'>('engage');
  const [generatedComment, setGeneratedComment] = useState("");

  const steps = ["Topic", "Style", "Hook", "Generate", "Edit"];

  useEffect(() => {
    fetchStyles();
    loadSavedPosts();
    loadVoiceSamples();
  }, []);

  const fetchStyles = async () => {
    const res = await fetch('/api/reference-posts');
    const data = await res.json();
    setStyles(data);
  };

  const loadSavedPosts = () => {
    const saved = localStorage.getItem('reachflow_posts');
    if (saved) {
      setSavedPosts(JSON.parse(saved));
    }
  };

  const loadVoiceSamples = () => {
    const saved = localStorage.getItem('reachflow_voice');
    if (saved) {
      setVoiceSamples(JSON.parse(saved));
    }
  };

  const saveVoiceSample = () => {
    if (newSample.trim()) {
      const updated = [...voiceSamples, newSample.trim()];
      setVoiceSamples(updated);
      localStorage.setItem('reachflow_voice', JSON.stringify(updated));
      setNewSample("");
      toast.success("Voice sample saved!");
    }
  };

  const removeVoiceSample = (index: number) => {
    const updated = voiceSamples.filter((_, i) => i !== index);
    setVoiceSamples(updated);
    localStorage.setItem('reachflow_voice', JSON.stringify(updated));
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hooks',
          topic,
          count: 10
        })
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'post',
          topic,
          keyPoints: keyPoints.filter(p => p.trim()),
          audience,
          style: selectedStyle,
          voiceSamples: voiceSamples.length > 0 ? voiceSamples : undefined
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      let finalContent = data.result;
      if (selectedHook) {
        // Replace the first sentence with the selected hook
        const sentences = finalContent.split(/(?<=[.!?])\s+/);
        sentences[0] = selectedHook;
        finalContent = sentences.join(' ');
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'variations',
          content: generatedContent
        })
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

  const editPost = async (action: 'rewrite' | 'shorten' | 'expand' | 'professional' | 'viral') => {
    if (!generatedContent) {
      toast.error("Generate a post first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'edit',
          content: generatedContent,
          action
        })
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          postContent: postToComment,
          goal: commentGoal
        })
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
      createdAt: new Date().toISOString()
    };
    const updated = [newPost, ...savedPosts];
    setSavedPosts(updated);
    localStorage.setItem('reachflow_posts', JSON.stringify(updated));
    toast.success("Post saved!");
  };

  const deletePost = (id: string) => {
    const updated = savedPosts.filter(p => p.id !== id);
    setSavedPosts(updated);
    localStorage.setItem('reachflow_posts', JSON.stringify(updated));
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
    setSection('newPost');
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

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">ReachFlow</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 ${section === 'newPost' ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setSection('newPost')}
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 ${section === 'history' ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setSection('history')}
          >
            <HistoryIcon className="w-4 h-4" />
            Post History
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 ${section === 'calendar' ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setSection('calendar')}
          >
            <Calendar className="w-4 h-4" />
            Content Calendar
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 ${section === 'voice' ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setSection('voice')}
          >
            <Mic2 className="w-4 h-4" />
            Voice Settings
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 ${section === 'library' ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setSection('library')}
          >
            <Library className="w-4 h-4" />
            Reference Library
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 ${section === 'comment' ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setSection('comment')}
          >
            <MessageSquare className="w-4 h-4" />
            AI Comments
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 dark:text-gray-400">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* New Post Section */}
          {section === 'newPost' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
                <Button variant="outline" onClick={resetNewPost}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 -z-10" />
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      index <= currentStep ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      index <= currentStep ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Topic Step */}
                {currentStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">What do you want to write about?</CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">Enter your topic and key points to guide the AI.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Topic</label>
                          <Input 
                            placeholder="e.g. Why founders should build in public" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Audience (optional)</label>
                          <Input 
                            placeholder="e.g. SaaS founders, B2B marketers" 
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Key Points (optional)</label>
                          {keyPoints.map((point, i) => (
                            <Input 
                              key={i}
                              placeholder={`Point ${i + 1}`}
                              value={point}
                              onChange={(e) => updateKeyPoint(i, e.target.value)}
                            />
                          ))}
                          <Button variant="ghost" size="sm" onClick={addKeyPoint} className="text-orange-500 hover:text-orange-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Add another point
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex justify-end">
                      <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white">
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a style</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {styles.map((style) => (
                        <Card 
                          key={style.id}
                          className={`cursor-pointer transition-all hover:shadow-md bg-white dark:bg-gray-900 ${
                            selectedStyle?.id === style.id ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => setSelectedStyle(style)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-100 dark:border-orange-900/50 uppercase">
                                {style.category}
                              </span>
                              {selectedStyle?.id === style.id && <Check className="w-4 h-4 text-orange-500" />}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 italic mb-4">"{style.content}"</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{style.tags.hook}</span>
                              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{style.tags.structure}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button onClick={handleNext} disabled={!selectedStyle} className="bg-orange-500 hover:bg-orange-600 text-white">
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose your hook</h2>
                      <Button variant="outline" onClick={generateHooks} disabled={isGenerating}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                        Generate New Hooks
                      </Button>
                    </div>
                    {hookOptions.length > 0 ? (
                      <div className="grid gap-3">
                        {hookOptions.map((hook, index) => (
                          <Card 
                            key={index}
                            className={`cursor-pointer transition-all bg-white dark:bg-gray-900 ${
                              selectedHook === hook ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/30 dark:bg-orange-950/20' : 'border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => setSelectedHook(hook)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedHook === hook ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {selectedHook === hook && <Check className="w-3 h-3 text-orange-500" />}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{hook}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-none shadow-sm bg-white dark:bg-gray-900 text-center py-12">
                        <CardContent>
                          <Lightbulb className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Click "Generate New Hooks" to get started</p>
                        </CardContent>
                      </Card>
                    )}
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating} 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
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
                    className="flex flex-col items-center justify-center py-20 space-y-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-orange-100 dark:border-orange-900/50 rounded-full" />
                      <motion.div 
                        className="w-20 h-20 border-4 border-orange-500 rounded-full border-t-transparent absolute top-0 left-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <Sparkles className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Generating your post...</h3>
                      <p className="text-gray-500 dark:text-gray-400">Matching your selected style and tone</p>
                    </div>
                  </motion.div>
                )}

                {/* Edit Step */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-900">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Post</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <Textarea 
                          className="w-full min-h-[300px] text-lg leading-relaxed text-gray-700 dark:text-gray-300 bg-transparent border-none focus:ring-0 resize-none"
                          value={generatedContent}
                          onChange={(e) => setGeneratedContent(e.target.value)}
                        />
                      </CardContent>
                    </Card>

                    {/* Edit Tools */}
                    <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Edit Tools</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <Button variant="outline" onClick={() => editPost('rewrite')} disabled={isGenerating}>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Rewrite
                          </Button>
                          <Button variant="outline" onClick={() => editPost('shorten')} disabled={isGenerating}>
                            <Scissors className="w-4 h-4 mr-2" />
                            Shorten
                          </Button>
                          <Button variant="outline" onClick={() => editPost('expand')} disabled={isGenerating}>
                            <Maximize2 className="w-4 h-4 mr-2" />
                            Expand
                          </Button>
                          <Button variant="outline" onClick={() => editPost('professional')} disabled={isGenerating}>
                            <Briefcase className="w-4 h-4 mr-2" />
                            Pro
                          </Button>
                          <Button variant="outline" onClick={() => editPost('viral')} disabled={isGenerating}>
                            <Zap className="w-4 h-4 mr-2" />
                            Viral
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Variations */}
                    <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-gray-900 dark:text-white">Variations</CardTitle>
                          <Button variant="outline" onClick={generateVariations} disabled={isGenerating || !generatedContent}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                            Generate Variations
                          </Button>
                        </div>
                      </CardHeader>
                      {variations && (
                        <CardContent>
                          <Tabs defaultValue="story">
                            <TabsList className="grid grid-cols-3">
                              <TabsTrigger value="story">Story</TabsTrigger>
                              <TabsTrigger value="professional">Professional</TabsTrigger>
                              <TabsTrigger value="engaging">Engaging</TabsTrigger>
                            </TabsList>
                            <TabsContent value="story" className="mt-4">
                              <Card>
                                <CardContent className="p-4">
                                  <p className="text-gray-600 dark:text-gray-400">{variations.story}</p>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="professional" className="mt-4">
                              <Card>
                                <CardContent className="p-4">
                                  <p className="text-gray-600 dark:text-gray-400">{variations.professional}</p>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="engaging" className="mt-4">
                              <Card>
                                <CardContent className="p-4">
                                  <p className="text-gray-600 dark:text-gray-400">{variations.engaging}</p>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      )}
                    </Card>

                    <div className="flex flex-wrap gap-4">
                      <Button onClick={savePost} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save to History
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Try Another Style
                      </Button>
                      <Button variant="outline" onClick={handlePrev}>
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
          {section === 'history' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post History</h1>
              {savedPosts.length === 0 ? (
                <Card className="border-none shadow-sm bg-white dark:bg-gray-900 text-center py-12">
                  <CardContent>
                    <HistoryIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No saved posts yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {savedPosts.map((post) => (
                    <Card key={post.id} className="border-none shadow-sm bg-white dark:bg-gray-900">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{post.topic}</h3>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{post.content}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                                {post.selectedStyle.category}
                              </span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => loadPost(post)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(post.content)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Calendar Section */}
          {section === 'calendar' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Calendar</h1>
              <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Calendar Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">Plan your content schedule here</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Voice Settings Section */}
          {section === 'voice' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voice Calibration</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add examples of your writing to help the AI match your unique voice and style
              </p>
              <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Add a writing sample</label>
                    <Textarea 
                      placeholder="Paste one of your LinkedIn posts here..."
                      className="min-h-[120px]"
                      value={newSample}
                      onChange={(e) => setNewSample(e.target.value)}
                    />
                    <Button onClick={saveVoiceSample} disabled={!newSample.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">
                      Save Sample
                    </Button>
                  </div>

                  {voiceSamples.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">Your Samples</h3>
                      {voiceSamples.map((sample, index) => (
                        <Card key={index} className="border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4 flex justify-between gap-4">
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">{sample}</p>
                            <Button variant="ghost" size="sm" onClick={() => removeVoiceSample(index)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reference Library Section */}
          {section === 'library' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reference Library</h1>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
              </div>
              <div className="grid gap-4">
                {styles.map((style) => (
                  <Card key={style.id} className="border-none shadow-sm bg-white dark:bg-gray-900">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-900/50 uppercase mb-2 inline-block">
                            {style.category}
                          </span>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{style.content}</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{style.tags.hook}</span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{style.tags.structure}</span>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{style.tags.contentType}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Comment Generator Section */}
          {section === 'comment' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Comment Generator</h1>
              <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Paste a LinkedIn post</label>
                    <Textarea 
                      placeholder="Paste a LinkedIn post here to generate a comment..."
                      className="min-h-[150px]"
                      value={postToComment}
                      onChange={(e) => setPostToComment(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Comment goal</label>
                    <Tabs defaultValue={commentGoal} onValueChange={(v) => setCommentGoal(v as any)}>
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
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full"
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
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-4">
                        <p className="text-gray-700 dark:text-gray-300">{generatedComment}</p>
                      </div>
                      <Button variant="outline" onClick={() => copyToClipboard(generatedComment)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Comment
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

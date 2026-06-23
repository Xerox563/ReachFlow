"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  History as HistoryIcon,
  Layout,
  Mic2,
  Library,
  Settings,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ReferencePost, Category } from "@/types";
import { toast } from "sonner";

const steps = ["Topic", "Style", "Hook", "Generate", "Edit"];

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);
  const [audience, setAudience] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ReferencePost | null>(null);
  const [styles, setStyles] = useState<ReferencePost[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    const res = await fetch('/api/reference-posts');
    const data = await res.json();
    setStyles(data);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addKeyPoint = () => setKeyPoints([...keyPoints, ""]);
  const updateKeyPoint = (index: number, val: string) => {
    const newPoints = [...keyPoints];
    newPoints[index] = val;
    setKeyPoints(newPoints);
  };

  const handleGenerate = async () => {
    if (!topic || !selectedStyle) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    setCurrentStep(3); // Move to generate step

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keyPoints: keyPoints.filter(p => p.trim()),
          audience,
          style: selectedStyle
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedContent(data.content);
      setCurrentStep(4); // Move to edit step
    } catch (error: any) {
      toast.error(error.message || "Failed to generate post");
      setCurrentStep(1); // Go back to style selection
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-bold text-xl tracking-tight">ReachFlow</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-orange-500 bg-orange-50 font-bold">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
            <HistoryIcon className="w-4 h-4" />
            Post History
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
            <Layout className="w-4 h-4" />
            Content Calendar
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
            <Mic2 className="w-4 h-4" />
            Voice Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
            <Library className="w-4 h-4" />
            Reference Library
          </Button>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 -z-10" />
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  index <= currentStep ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
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
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>What do you want to write about?</CardTitle>
                    <CardDescription>Enter your topic and key points to guide the AI.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500">Topic</label>
                      <Input 
                        placeholder="e.g. Why founders should build in public" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-500">Key Points (optional)</label>
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
                  <Button onClick={handleNext} disabled={!topic} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {styles.map((style) => (
                    <Card 
                      key={style.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedStyle?.id === style.id ? 'border-orange-500 ring-1 ring-orange-500' : 'border-none'
                      }`}
                      onClick={() => setSelectedStyle(style)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100 uppercase">
                            {style.category}
                          </span>
                          {selectedStyle?.id === style.id && <Check className="w-4 h-4 text-orange-500" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3 italic mb-4">"{style.content}"</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{style.tags.hook}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{style.tags.structure}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handlePrev}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleGenerate} disabled={!selectedStyle} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                    Generate Post
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && isGenerating && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-100 rounded-full" />
                  <motion.div 
                    className="w-20 h-20 border-4 border-orange-500 rounded-full border-t-transparent absolute top-0 left-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <Sparkles className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Generating your post...</h3>
                  <p className="text-gray-500">Matching your selected style and tone.</p>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Generated Result</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <textarea 
                      className="w-full h-[400px] text-lg leading-relaxed text-gray-700 bg-transparent border-none focus:ring-0 outline-none resize-none"
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-12">
                    Save to History
                  </Button>
                  <Button variant="outline" className="rounded-full px-8 h-12 border-gray-200" onClick={() => setCurrentStep(1)}>
                    Try Another Style
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

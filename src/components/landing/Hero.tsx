"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, Layout, Anchor, Edit3, History } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export const Hero = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-32 pb-20 px-4 overflow-hidden bg-white dark:bg-gray-950">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered LinkedIn Content Generator</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
              Create LinkedIn Posts That <span className="text-orange-500">Get Noticed.</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
              ReachFlow helps you generate high-performing LinkedIn content that matches your voice, saves time, and grows your personal brand.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">AI-Powered</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Smart content that sounds like you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                  <Layout className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Proven Styles</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Built from winning LinkedIn posts</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Link href="/dashboard">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-12">
                  Try It Free - Generate 1 Post
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-gray-200 dark:border-gray-700">
                  Request Access
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>No signup required to try</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>Free 1 post generation</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* Mockup Container */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 relative z-10">
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">R</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">ReachFlow</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-40 hidden md:block space-y-3">
                    <div className={`h-8 rounded-md border ${step === 0 ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800' : 'bg-gray-100 dark:bg-gray-800 border-transparent'}`} />
                    <div className={`h-8 rounded-md border ${step === 1 ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800' : 'bg-gray-100 dark:bg-gray-800 border-transparent'}`} />
                    <div className={`h-8 rounded-md border ${step === 2 ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800' : 'bg-gray-100 dark:bg-gray-800 border-transparent'}`} />
                    <div className={`h-8 rounded-md border ${step === 3 ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800' : 'bg-gray-100 dark:bg-gray-800 border-transparent'}`} />
                  </div>
                  
                  <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <AnimatePresence mode="wait">
                      {step === 0 && (
                        <motion.div
                          key="step0"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <div className="flex gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                              <span className="text-orange-500 border-b-2 border-orange-500 pb-1">1. Topic</span>
                              <span>2. Style</span>
                              <span>3. Hook</span>
                              <span>4. Generate</span>
                              <span>5. Edit</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500">What do you want to write about?</label>
                            <div className="h-10 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500">Key Points (optional)</label>
                            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                          </div>
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 h-10 rounded-lg">
                            Continue
                          </Button>
                        </motion.div>
                      )}
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                           <div className="space-y-2">
                            <div className="flex gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                              <span>1. Topic</span>
                              <span className="text-orange-500 border-b-2 border-orange-500 pb-1">2. Style</span>
                              <span>3. Hook</span>
                              <span>4. Generate</span>
                              <span>5. Edit</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-100 dark:border-orange-900/50" />
                            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                          </div>
                        </motion.div>
                      )}
                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                              <span>1. Topic</span>
                              <span>2. Style</span>
                              <span className="text-orange-500 border-b-2 border-orange-500 pb-1">3. Hook</span>
                              <span>4. Generate</span>
                              <span>5. Edit</span>
                            </div>
                          </div>
                          <div className="h-14 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-100 dark:border-orange-900/50" />
                          <div className="h-14 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                          <div className="h-14 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                        </motion.div>
                      )}
                      {step === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                              <span>1. Topic</span>
                              <span>2. Style</span>
                              <span>3. Hook</span>
                              <span className="text-orange-500 border-b-2 border-orange-500 pb-1">4. Generate</span>
                              <span>5. Edit</span>
                            </div>
                          </div>
                          <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
                          <div className="flex gap-2">
                            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 h-10 rounded-lg">
                              Copy
                            </Button>
                            <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700 h-10 rounded-lg">
                              Save
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-200 dark:bg-orange-800/30 rounded-full blur-3xl opacity-30" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

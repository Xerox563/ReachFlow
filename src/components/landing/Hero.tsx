"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Layout } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered LinkedIn Content Generator</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Create LinkedIn Posts That <span className="text-orange-500">Get Noticed.</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              ReachFlow helps you generate high-performing LinkedIn content that matches your voice, saves time, and grows your personal brand.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI-Powered</h3>
                  <p className="text-sm text-gray-500">Smart content that sounds like you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Layout className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Proven Styles</h3>
                  <p className="text-sm text-gray-500">Built from winning LinkedIn posts</p>
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
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-gray-200">
                  Request Access
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>No signup required to try</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
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
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative z-10">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">R</span>
                    </div>
                    <span className="font-bold text-sm">ReachFlow</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-40 hidden md:block space-y-3">
                    <div className="h-8 bg-orange-100 rounded-md border border-orange-200" />
                    <div className="h-8 bg-gray-100 rounded-md" />
                    <div className="h-8 bg-gray-100 rounded-md" />
                    <div className="h-8 bg-gray-100 rounded-md" />
                  </div>
                  
                  <div className="flex-1 bg-white rounded-xl border p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex gap-4 text-xs font-medium text-gray-400">
                        <span className="text-orange-500 border-b-2 border-orange-500 pb-1">1. Topic</span>
                        <span>2. Style</span>
                        <span>3. Hook</span>
                        <span>4. Generate</span>
                        <span>5. Edit</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">What do you want to write about?</label>
                      <div className="h-10 bg-gray-50 rounded-md border border-gray-100" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">Key Points (optional)</label>
                      <div className="h-20 bg-gray-50 rounded-md border border-gray-100" />
                    </div>

                    <Button className="w-full bg-orange-500 hover:bg-orange-600 h-10 rounded-lg">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-30" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

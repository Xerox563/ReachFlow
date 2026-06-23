"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export const AccessStrategy = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Two Ways to Access <span className="text-orange-500">ReachFlow</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs hidden md:flex z-10">
            OR
          </div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-orange-50/50 border border-orange-100 flex flex-col h-full"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Try-First, Then Google Login (Self-Serve)</h3>
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                "Try the tool with 1 free post (no login required).",
                "On save or regenerate, continue with Google.",
                "One click to create your account and save posts.",
                "Quick, easy, and risk-free."
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-full font-bold">
                Try It Free - Generate 1 Post
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-white border border-gray-100 flex flex-col h-full"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Admin-Approved Access Link (Gated)</h3>
            <ul className="space-y-4 mb-10 flex-grow">
              {[
                "Request access via form, email, or LinkedIn DM.",
                "Admin reviews and sends you a unique access link.",
                "Access can be permanent, time-limited, or tied to a one-time payment."
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full border-gray-200 h-12 rounded-full font-bold">
                Request Access
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

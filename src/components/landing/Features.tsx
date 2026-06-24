"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  Library, 
  Sparkles, 
  Mic2, 
  Anchor, 
  Layers, 
  Edit3, 
  History, 
  Calendar, 
  MessageSquare 
} from "lucide-react";

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let i = 0;
    const timer = setTimeout(() => {
      setIsTyping(true);
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [text, isInView, delay]);

  return (
    <span ref={ref}>
      {displayText}
      {isTyping && <span className="animate-pulse text-orange-500 text-xs">|</span>}
    </span>
  );
};

// Import useInView
import { useInView } from "framer-motion";

const features = [
  {
    title: "Reference Style Library",
    description: "Access a library of high-performing LinkedIn posts categorized by niche, hook, and content type.",
    icon: Library,
  },
  {
    title: "AI Post Generator",
    description: "Generate fresh, original posts based on your topic, key points, and audience.",
    icon: Sparkles,
  },
  {
    title: "Voice Calibration",
    description: "Upload your past posts and our AI learns your unique voice and writing style.",
    icon: Mic2,
  },
  {
    title: "Hook Generator",
    description: "Get 10-20 attention-grabbing hook options tailored to your topic.",
    icon: Anchor,
  },
  {
    title: "Multiple Variations",
    description: "Choose from Story, Professional, or Engaging versions of your post.",
    icon: Layers,
  },
  {
    title: "Post Editor",
    description: "Rewrite, shorten, expand, or refine your post to make it more viral or professional.",
    icon: Edit3,
  },
  {
    title: "Post History",
    description: "Save and manage all your generated posts with history and style used.",
    icon: History,
  },
  {
    title: "Content Calendar",
    description: "Plan your content with 7-day or 30-day calendars to stay consistent.",
    icon: Calendar,
  },
  {
    title: "AI Comment Generator",
    description: "Generate smart, engaging LinkedIn comments to grow your network and visibility.",
    icon: MessageSquare,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            Everything You Need to Create Content <span className="text-orange-500"><TypewriterText text="That Connects" delay={0.3} /></span>
          </motion.h2>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                <TypewriterText text={feature.title} delay={0.1 + index * 0.05} />
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                <TypewriterText text={feature.description} delay={0.3 + index * 0.05} />
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

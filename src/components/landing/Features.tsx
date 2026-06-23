"use client";

import { motion } from "framer-motion";
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
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Everything You Need to Create Content <span className="text-orange-500">That Connects</span>
          </h2>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                <feature.icon className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

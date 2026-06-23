"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-bold text-xl tracking-tight">ReachFlow</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
            How It Works
          </Link>
          <Link href="#use-cases" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
            Use Cases
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
            FAQ
          </Link>
        </nav>

        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
          Request Access
        </Button>
      </div>
    </motion.header>
  );
};

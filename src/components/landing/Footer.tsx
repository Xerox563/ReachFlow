"use client";

import Link from "next/link";
import { Linkedin, Twitter, Instagram, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-950 pt-24 pb-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">ReachFlow</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
              AI-Powered LinkedIn Content Generator that helps you create, connect, and grow your personal brand.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Features</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">How It Works</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Use Cases</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">LinkedIn Tips</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Content Guide</Link></li>
              <li><Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
          <p>© 2026 ReachFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

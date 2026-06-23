"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const CTABanner = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-orange-500 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Creating Content That Builds Your Brand
            </h2>
            <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">
              Try ReachFlow today and write LinkedIn posts that connect, engage, and grow your audience.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Button size="lg" className="bg-white text-orange-500 hover:bg-orange-50 rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-orange-900/20">
                Try It Free - Generate 1 Post
              </Button>
              <Button size="lg" variant="outline" className="border-orange-400 text-white hover:bg-orange-600 rounded-full px-8 h-14 text-lg font-bold">
                Request Access
              </Button>
            </div>
            <p className="text-orange-200 text-sm">
              No credit card required
            </p>
          </div>

          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />
        </motion.div>
      </div>
    </section>
  );
};

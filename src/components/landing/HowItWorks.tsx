"use client";

import { motion } from "framer-motion";

const steps = [
  { id: 1, title: "Enter Topic & Key Points" },
  { id: 2, title: "Choose Style" },
  { id: 3, title: "Select Hook" },
  { id: 4, title: "Generate Post" },
  { id: 5, title: "Choose Version" },
  { id: 6, title: "Edit Post" },
  { id: 7, title: "Save to History" },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-orange-50/30 dark:bg-orange-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            How <span className="text-orange-500">ReachFlow</span> Works
          </h2>
          <p className="text-gray-500 dark:text-gray-400">From idea to impactful post in 7 simple steps.</p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-200 dark:bg-orange-800/50 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                  {step.id}
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                  {step.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

"use client";

import { motion } from "framer-motion";

const logos = [
  { name: "acme", icon: "◈" },
  { name: "StarupHub", icon: "⌬" },
  { name: "Brainwave", icon: "≋" },
  { name: "Elevate", icon: "◬" },
  { name: "Sphere", icon: "○" },
  { name: "Vortex", icon: "🌀" },
];

export const SocialProof = () => {
  return (
    <section className="py-12 border-y border-gray-100 bg-gray-50/50">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-widest">
          Trusted by founders, creators, and professionals
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl grayscale">{logo.icon}</span>
              <span className="text-xl font-bold tracking-tight text-gray-900">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

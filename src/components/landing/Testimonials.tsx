"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    content: "ReachFlow helps me create content 10x faster. The posts feel like me, just better.",
    author: "Arjun Patel",
    role: "Founder",
    avatar: "AP"
  },
  {
    content: "The AI understands my voice incredibly well. My engagement has never been higher.",
    author: "Meera Shah",
    role: "LinkedIn Top Voice",
    avatar: "MS"
  },
  {
    content: "From hooks to full posts, it's like having a content team in your pocket.",
    author: "Rohan Verma",
    role: "Growth Marketer",
    avatar: "RV"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Loved by LinkedIn <span className="text-orange-500">Creators & Professionals</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <p className="text-gray-600 mb-8 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-12">
          <div className="w-8 h-1 bg-orange-500 rounded-full" />
          <div className="w-2 h-1 bg-orange-200 rounded-full" />
          <div className="w-2 h-1 bg-orange-200 rounded-full" />
        </div>
      </div>
    </section>
  );
};

"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  bgClass?: string;
}

export function TestimonialsSection({
  title = "Apa Kata Mereka?",
  subtitle = "Pengalaman pelanggan kami yang telah menggunakan layanan reservasi lapangan",
  testimonials,
  bgClass = "bg-muted/30"
}: TestimonialsSectionProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.section 
      className={`py-20 ${bgClass} rounded-3xl my-16`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {testimonials.map((testimonial) => (
            <motion.div 
              key={testimonial.id}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all"
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="mb-4">{testimonial.text}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
} 
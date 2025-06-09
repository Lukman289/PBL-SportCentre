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
      className={`py-8 sm:py-20 ${bgClass} md:rounded-3xl my-6 sm:my-16`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          className="text-center mb-6 sm:mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-xl sm:text-4xl font-bold mb-2 sm:mb-4">{title}</h2>
          <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8"
          variants={staggerContainer}
        >
          {testimonials.map((testimonial) => (
            <motion.div 
              key={testimonial.id}
              className="bg-white p-3 sm:p-8 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all"
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-2 sm:mb-4">
                <div className="mr-2 sm:mr-4">
                  <div className="h-8 w-8 sm:h-14 sm:w-14 rounded-full overflow-hidden">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-base">{testimonial.name}</h4>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="mb-2 sm:mb-4 text-xs sm:text-base">{testimonial.text}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 sm:w-5 sm:h-5 ${
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
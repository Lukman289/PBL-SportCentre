"use client";

import { motion } from "framer-motion";

interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs: Faq[];
  bgClass?: string;
}

export function FaqSection({
  title = "Pertanyaan Umum",
  subtitle = "Jawaban untuk pertanyaan yang sering ditanyakan",
  faqs,
  bgClass = ""
}: FaqSectionProps) {
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

  return (
    <motion.section 
      className={`py-8 sm:py-20 ${bgClass}`}
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
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8 max-w-4xl mx-auto"
          variants={staggerContainer}
        >
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="bg-muted/30 p-3 sm:p-6 rounded-xl"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{faq.question}</h3>
              <p className="text-xs sm:text-base text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
} 
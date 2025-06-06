"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface CtaSectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export function CtaSection({
  title = "Siap Untuk Bergabung?",
  subtitle = "Jadilah bagian dari ekosistem Sport Center kami",
  primaryButtonText = "Daftar Sekarang",
  primaryButtonLink = "/auth/register",
  secondaryButtonText = "Jelajahi Cabang",
  secondaryButtonLink = "/branches"
}: CtaSectionProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.section 
      className="py-20 bg-primary my-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto text-center">
        <motion.div variants={fadeInUp}>
          <h2 className="text-4xl font-bold mb-4 text-white">{title}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href={primaryButtonLink}>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 hover:text-primary transition-colors"
            >
              {primaryButtonText}
            </Button>
          </Link>
          <Link href={secondaryButtonLink}>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/20 hover:text-white"
            >
              {secondaryButtonText}
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
} 
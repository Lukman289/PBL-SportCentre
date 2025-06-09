"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Branch } from "@/types";

interface BranchesSectionProps {
  branches: Branch[];
  isLoading: boolean;
}

export function BranchesSection({ branches, isLoading }: BranchesSectionProps) {
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
      className="py-8 sm:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          className="flex justify-between items-center mb-6 sm:mb-12"
          variants={fadeInUp}
        >
          <h2 className="text-xl sm:text-3xl font-bold">Cabang Populer</h2>
          <Link href="/branches">
            <Button variant="ghost" className="gap-1 sm:gap-2 text-xs sm:text-base">
              Lihat Semua <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Link>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-[180px] sm:h-[300px] rounded-xl bg-muted"
              ></div>
            ))}
          </div>
        ) : branches.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
            variants={staggerContainer}
          >
            {branches.map((branch) => (
              <motion.div
                key={branch.id}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full overflow-hidden group hover:shadow-md transition-all">
                  <div className="relative h-28 sm:h-48 overflow-hidden">
                    <div className="h-full w-full bg-muted group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={branch.imageUrl || "images/img_not_found.png"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "images/img_not_found.png";
                          target.className = "h-full w-full object-contain";
                        }}
                        alt={branch.name}
                        className="h-full w-full object-cover aspect-[16/9]"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          branch.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {branch.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="p-2 sm:p-6 sm:pb-2 sm:pt-4">
                    <CardTitle className="text-sm sm:text-xl line-clamp-1">{branch.name}</CardTitle>
                    <CardDescription className="flex items-start gap-1 text-[10px] sm:text-sm">
                      <MapPin className="w-2.5 h-2.5 sm:w-4 sm:h-4 mt-0.5 text-muted-foreground" />
                      <span className="line-clamp-2">{branch.location}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-2 sm:p-6 pt-0">
                    <Link href={`/branches/${branch.id}`} className="w-full">
                      <Button variant="default" className="w-full text-[10px] sm:text-sm py-1 sm:py-2">
                        Lihat Detail
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center p-4 sm:p-10 border border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">Belum ada cabang tersedia</p>
          </div>
        )}
      </div>
    </motion.section>
  );
} 
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
      className="py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto">
        <motion.div 
          className="flex justify-between items-center mb-12"
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold">Cabang Populer</h2>
          <Link href="/branches">
            <Button variant="ghost" className="gap-2">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-[300px] rounded-xl bg-muted"
              ></div>
            ))}
          </div>
        ) : branches.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {branches.map((branch) => (
              <motion.div
                key={branch.id}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full overflow-hidden group hover:shadow-md transition-all">
                  <div className="relative h-48 overflow-hidden">
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
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          branch.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {branch.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{branch.name}</CardTitle>
                    <CardDescription className="flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      {branch.location}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/branches/${branch.id}`} className="w-full">
                      <Button variant="default" className="w-full">
                        Lihat Detail
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center p-10 border border-dashed rounded-lg">
            <p className="text-muted-foreground">Belum ada cabang tersedia</p>
          </div>
        )}
      </div>
    </motion.section>
  );
} 
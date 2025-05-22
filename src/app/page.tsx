"use client";

import { HomeLayout } from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { branchApi, fieldApi } from "@/api";
import { Branch } from "@/types";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  LayoutGrid,
  MapPin,
  Star,
} from "lucide-react";

export default function HomePage() {
  const [featuredBranches, setFeaturedBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBranches, setTotalBranches] = useState(0);
  const [totalFields, setTotalFields] = useState(0);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchApi.getBranches();
        const branches = response.data || [];
        setTotalBranches(response.meta?.totalItems || 0);
        if (Array.isArray(branches)) {
          setFeaturedBranches(branches.slice(0, 4));
        } else {
          console.error("branches is not an array:", branches);
          setFeaturedBranches([]);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setFeaturedBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalFields = async () => {
      try {
        const response = await fieldApi.getAllFields();
        setTotalFields(response.length || 0);
      } catch (error) {
        console.error("Error fetching total fields:", error);
      }
    }
    
    fetchTotalFields();
    fetchBranches();
  }, []);

  // Data testimonial
  const testimonials = [
    {
      id: 1,
      name: "Andi Wijaya",
      role: "Atlet Badminton",
      text: "Aplikasi ini sangat memudahkan saya dalam memesan lapangan badminton. Tidak perlu lagi menelepon atau datang langsung ke tempat. Sangat efisien!",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5,
    },
    {
      id: 2,
      name: "Diana Putri",
      role: "Pemain Basket Amatir",
      text: "Sistem booking yang mudah dan pembayaran yang aman. Saya dan tim basket saya selalu menggunakan aplikasi ini untuk memesan lapangan.",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4,
    },
    {
      id: 3,
      name: "Budi Santoso",
      role: "Penggemar Futsal",
      text: "Sangat puas dengan layanan Sport Center. Banyak pilihan lapangan berkualitas dengan harga yang bersaing. Recommended!",
      avatar: "https://i.pravatar.cc/150?img=3",
      rating: 5,
    },
  ];

  return (
    <HomeLayout>
      <section className="relative py-24 overflow-hidden w-full h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80"
            alt="Sport Center"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="container mx-auto text-center relative z-20">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-md">
            Reservasi Lapangan <br />
            Jadi Lebih Mudah
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
            Temukan dan pesan lapangan olahraga favorit Anda dengan cepat dan
            mudah. Bayar online dan dapatkan konfirmasi instan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/branches">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 hover:text-primary transition-colors"
              >
                Jelajahi Cabang
              </Button>
            </Link>
            <Link href="/fields">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/20"
              >
                Lihat Lapangan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{totalBranches} Cabang</h3>
              <p className="text-muted-foreground">Tersebar di berbagai kota</p>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <LayoutGrid className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{totalFields} Lapangan</h3>
              <p className="text-muted-foreground">Tersedia</p>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-1">24/7 Akses</h3>
              <p className="text-muted-foreground">Reservasi kapan saja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Branches List */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Cabang Populer</h2>
            <Link href="/branches">
              <Button variant="ghost" className="gap-2">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-[300px] rounded-xl bg-muted"
                ></div>
              ))}
            </div>
          ) : featuredBranches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className="h-full overflow-hidden group hover:shadow-md transition-all"
                >
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
              ))}
            </div>
          ) : (
            <div className="text-center p-10 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Belum ada cabang tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-muted/30 rounded-2xl">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Mengapa Memilih Kami?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Pemesanan Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Pesan dalam hitungan menit
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Tanpa perlu antre atau telepon
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Akses kapan saja dan dimana saja
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                      />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-center">Pembayaran Aman</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Multiple metode pembayaran
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Proses pembayaran aman & terpercaya
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Notifikasi pembayaran real-time
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                      />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-center">Kualitas Terjamin</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Lapangan terverifikasi kualitasnya
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Review dari pengguna lain
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Fasilitas lengkap dan nyaman
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Kata Mereka Tentang Kami
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    &quot;{testimonial.text}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 mb-6">
        <div className="container mx-auto">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Siap Untuk Bermain?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Jadikan pengalaman olahraga Anda lebih menyenangkan dengan layanan
              reservasi kami. Daftar sekarang dan nikmati kemudahan pemesanan
              lapangan olahraga.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Daftar Sekarang
                </Button>
              </Link>
              <Link href="/branches">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/20 hover:text-white"
                >
                  Jelajahi Lapangan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}

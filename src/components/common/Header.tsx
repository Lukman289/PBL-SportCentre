import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth/auth.context";
import { Button } from "@/components/ui/button";
import { Role } from "@/types";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  Menu,
  User,
  LogOut,
  Home,
  MapPin,
  Calendar,
  ChevronDown,
  Clock,
  LayoutDashboard,
} from "lucide-react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Deteksi scroll untuk efek shadow pada navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/", label: "Beranda", icon: <Home size={16} /> },
    { href: "/branches", label: "Cabang", icon: <MapPin size={16} /> },
    { href: "/fields", label: "Lapangan", icon: <MapPin size={16} /> },
    { href: "/bookings", label: "Pemesanan", icon: <Calendar size={16} /> },
  ];

  // if (isAuthenticated) {
  //   navLinks.push({
  //     href: "/bookings",
  //     label: "Pemesanan",
  //     icon: <Calendar size={16} />,
  //   });
  // }

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ease-in-out ${
        pathname === "/" 
          ? scrolled 
            ? "bg-background/80 shadow-md" 
            : "bg-transparent"
          : "bg-background/80 shadow-md border-b border-border"
      } backdrop-blur-md`}
    >
      {/* Dekoratif header highlight */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 ${scrolled ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}></div>
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-32 h-32"> 
              <Image
                src="/logo.svg"
                alt="Sport Center Logo"
                priority
                fill
                className={`object-contain ${pathname === "/" && !scrolled ? "invert" : ""} transition-all duration-300 ease-in-out`}
              />
            </div>
        </Link>
        </div>

        {/* Desktop */}
        <nav className="hidden md:flex items-center justify-center flex-1 max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 justify-center">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all duration-300 relative overflow-hidden
                  ${
                    isActive(link.href)
                      ? pathname === "/" && !scrolled
                        ? "bg-white/20 text-white" 
                        : pathname === "/" && scrolled
                          ? "bg-primary/80 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      : pathname === "/" && !scrolled
                        ? "text-white hover:text-white/80 hover:bg-white/10"
                        : pathname === "/" && scrolled
                          ? "text-foreground hover:text-foreground/80 hover:bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {link.icon}
                  {link.label}
                </span>
                {/* Efek ripple */}
                {isActive(link.href) && (
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-50"></span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                    pathname === "/" && !scrolled 
                      ? "text-white hover:text-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-md" 
                      : pathname === "/" && scrolled
                        ? "text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-md"
                        : "text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-md"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    pathname === "/" && !scrolled ? "bg-white/20" : "bg-primary/10"
                  } shadow-inner`}>
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-lg border-primary/10 shadow-lg">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="hover:bg-primary/5 focus:bg-primary/5">
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="hover:bg-primary/5 focus:bg-primary/5">
                    <User size={16} className="mr-2" />
                    Profil Saya
                  </DropdownMenuItem>
                </Link>
                {user?.role === Role.USER && (
                  <Link href="/histories">
                    <DropdownMenuItem className="hover:bg-primary/5 focus:bg-primary/5">
                      <Clock size={16} className="mr-2" />
                      Histori
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut size={16} className="mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button 
                  variant={pathname === "/" ? (scrolled ? "ghost" : "outline") : "ghost"}
                  size="sm"
                  className={`rounded-full transition-all duration-300 hover:scale-105 ${pathname === "/" && !scrolled ? "text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-md" : ""}`}
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button 
                  variant="default" 
                  size="sm"
                  className={`rounded-full transition-all duration-300 hover:scale-105 ${pathname === "/" && !scrolled ? "bg-white text-black hover:bg-white/90" : ""}`}
                >
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full transition-all duration-300 hover:scale-105 ${pathname === "/" && !scrolled ? "text-white hover:bg-white/10" : pathname === "/" && scrolled ? "text-foreground hover:bg-background/20" : "text-foreground hover:bg-background/20"}`}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-background/95 backdrop-blur-xl">
              <div className="px-1 py-6 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-sm text-muted-foreground px-4 pb-2">
                    Menu
                  </h3>
                  {navLinks.map((link, index) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-300 ${
                          isActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                        {isActive(link.href) && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-sm text-muted-foreground px-4 pb-2">
                        Akun
                      </h3>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted/50 transition-all duration-300"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted/50 transition-all duration-300"
                        >
                          <User size={16} />
                          Profil
                        </Link>
                      </SheetClose>
                      {user?.role === Role.USER && (
                        <SheetClose asChild>
                          <Link
                            href="/histories"
                            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted/50 transition-all duration-300"
                          >
                            <Clock size={16} />
                            Histori
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                    <div className="mt-auto px-4">
                      <SheetClose asChild>
                        <Button
                          variant="destructive"
                          className="w-full rounded-full transition-all duration-300 hover:scale-105"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Keluar
                        </Button>
                      </SheetClose>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 px-4 mt-auto">
                    <SheetClose asChild>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full rounded-full transition-all duration-300 hover:scale-105">
                          Masuk
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/auth/register">
                        <Button variant="default" className="w-full rounded-full transition-all duration-300 hover:scale-105">
                          Daftar
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

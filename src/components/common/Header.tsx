import Link from "next/link";
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
  ];

  if (isAuthenticated) {
    navLinks.push({
      href: "/bookings",
      label: "Pemesanan",
      icon: <Calendar size={16} />,
    });
  }

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out ${
        pathname === "/" 
          ? scrolled 
            ? "bg-background/90 shadow-sm" 
            : "bg-transparent"
          : "bg-background/90 shadow-sm border-b border-border"
      } backdrop-blur-sm`}
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-md p-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-white"
              >
                <path d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm4.75-6a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3zm0 3a.75.75 0 0 0 0 1.5h5.625a.75.75 0 0 0 0-1.5H7zm0 3a.75.75 0 0 0 0 1.5h5.625a.75.75 0 0 0 0-1.5H7zm0 3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3zm9-3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75zm.75 3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3zm-5.5-12a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5z" />
              </svg>
            </div>
            <span className={`font-bold text-xl ${
              pathname === "/" && !scrolled ? "text-white" : "text-foreground"
            }`}>Sport Center</span>
          </Link>
        </div>

        {/* Desktop */}
        <nav className="hidden md:flex items-center justify-center flex-1 max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-2 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors
                  ${
                    isActive(link.href)
                      ? pathname === "/" && !scrolled
                        ? "bg-white/20 text-white" 
                        : pathname === "/" && scrolled
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      : pathname === "/" && !scrolled
                        ? "text-white hover:text-white/80"
                        : pathname === "/" && scrolled
                          ? "text-foreground hover:text-foreground/80"
                          : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.icon}
                {link.label}
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
                  className={`flex items-center bg-transparent hover:bg-muted gap-2 ${
                    pathname === "/" && !scrolled 
                      ? "text-white hover:text-white/80 hover:bg-white/10" 
                      : pathname === "/" && scrolled
                        ? "text-foreground hover:bg-muted/25"
                        : "text-foreground"
                  } ${
                    scrolled ? "bg-transparent" : "hover:bg-muted/25"
                  }`}
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    pathname === "/" && !scrolled ? "bg-white/20" : "bg-primary/10"
                  }`}>
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User size={16} className="mr-2" />
                    Profil Saya
                  </DropdownMenuItem>
                </Link>
                {user?.role === Role.USER && (
                  <Link href="/histories">
                    <DropdownMenuItem>
                      <Clock size={16} className="mr-2" />
                      Histori
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut size={16} className="mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button 
                  variant={pathname === "/" ? (scrolled ? "ghost" : "outline") : "ghost"}
                  size="sm"
                  className={pathname === "/" && !scrolled ? "text-white border-muted/20 bg-black/10 hover:bg-black/20 hover:text-white" : ""}
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button 
                  variant="default" 
                  size="sm"
                  className={pathname === "/" && !scrolled ? "bg-white text-black hover:bg-white/90" : ""}
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
                className={`${pathname === "/" && !scrolled ? "text-white" : pathname === "/" && scrolled ? "text-foreground" : "text-foreground"}`}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="px-1 py-6 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-sm text-muted-foreground px-4 pb-2">
                    Menu
                  </h3>
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${
                          isActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {link.icon}
                        <span>{link.label}</span>
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
                          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted"
                        >
                          <User size={16} />
                          Profil
                        </Link>
                      </SheetClose>
                      {user?.role === Role.USER && (
                        <SheetClose asChild>
                          <Link
                            href="/histories"
                            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:bg-muted"
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
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Keluar
                        </Button>
                      </SheetClose>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-4 mt-auto">
                    <SheetClose asChild>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full">
                          Masuk
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/auth/register">
                        <Button variant="default" className="w-full">
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

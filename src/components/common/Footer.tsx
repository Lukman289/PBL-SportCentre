import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-background to-muted/30 border-t relative overflow-hidden">
      {/* Elemen dekoratif */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      
      <div className="py-10 relative z-10 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Kolom 1 - Tentang */}
          <div className='flex flex-col items-center lg:items-start'>
            <h3 className="text-lg font-semibold mb-4 text-center lg:text-start">Sport Center</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center lg:text-start">
              Platform reservasi lapangan olahraga terbaik yang menghubungkan pemilik sport center dengan pelanggan.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://facebook.com" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook size={16} />
              </Link>
              <Link href="https://instagram.com" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Instagram size={16} />
              </Link>
              <Link href="https://twitter.com" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter size={16} />
              </Link>
            </div>
          </div>
          
          {/* Kolom 2 - Link */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="text-lg font-semibold mb-4">Tautan</h3>
            <ul className="space-y-2 text-center lg:text-start">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/branches" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cabang
                </Link>
              </li>
              <li>
                <Link href="/fields" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lapangan
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Kolom 3 - Legal */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-center lg:text-start">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Syarat dan Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kebijakan Refund
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Kolom 4 - Kontak */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 flex flex-col items-center lg:items-start">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-primary mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Jl. Soekarno Hatta No. 9, Malang, Jawa Timur
                </span>
              </li>

              {/* Baris khusus untuk nomor HP dan email */}
              <div className="flex flex-row lg:flex-col gap-4">
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-primary" />
                  <span className="text-sm text-muted-foreground">
                    +62 812 3456 7890
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-primary" />
                  <span className="text-sm text-muted-foreground">
                    info@sportcenter.id
                  </span>
                </li>
              </div>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6"></div>
        
        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Sport Center. Hak Cipta Dilindungi.
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Tentang Kami
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Kontak
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Syarat dan Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
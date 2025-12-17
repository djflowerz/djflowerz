import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/context/AuthProvider";
import CartProvider from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AudioPlayer from "@/components/AudioPlayer";
import SecurityProvider from "@/components/SecurityProvider";
import ChatWidget from "@/components/ChatWidget";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DJ Flowerz | Premium Music Pool & Store",
  description: "Exclusive DJ Mixes, Music Pool, and DJ Gear Store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-slate-950 text-slate-200 antialiased selection:bg-rose-500 selection:text-white`}>
        <AuthProvider>
          <SecurityProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <CartDrawer />
                <main className="flex-1 relative z-10 pt-20">
                  {/* Background Gradients */}
                  <div className="fixed inset-0 z-[-1] pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
                  </div>
                  {children}
                </main>
                <Footer />
                <AudioPlayer />
                <ChatWidget />
              </div>
            </CartProvider>
          </SecurityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

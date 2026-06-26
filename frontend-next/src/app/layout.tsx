import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import BookingModal from "@/components/modals/BookingModal";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import MobileNav from "@/components/layout/MobileNav";
import { SocketProvider } from "@/context/SocketContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nukkad Beats — Sing. Sip. Celebrate.",
  description: "Premium private karaoke studios and café experience. Book your studio, explore our café, and celebrate unforgettable moments at Nukkad Beats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <SocketProvider>
            <SmoothScrollProvider>
              {children}
              <Toaster position="bottom-right" toastOptions={{ 
                style: { 
                  background: '#0B0B0F', 
                  color: '#fff', 
                  border: '1px solid rgba(255,255,255,0.1)' 
                } 
              }} />
              <BookingModal />
              <MobileNav />
            </SmoothScrollProvider>
          </SocketProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

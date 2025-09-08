import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SimulationProvider } from "@/context/SimulationContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ChainReact Simulation",
  description: "An Interactive Digital Twin of a Supply Chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <SimulationProvider>{children}</SimulationProvider>
      </body>
    </html>
  );
}
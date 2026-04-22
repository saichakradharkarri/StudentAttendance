"use client";

import HeroSection from '@/app/components/HeroSection';
import FeaturesSection from "@/app/components/FeatureSection";
import TestimonialsSection from "@/app/components/TestimonialsSection";
import PricingSection from "@/app/components/PricingSection";
import HowItWorksSection from "@/app/components/WorkSection";
import AboutSection from "@/app/components/AboutSection";
import ContactSection from "@/app/components/ContactSection";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <main className="relative min-h-screen selection:bg-primary/30">
      {/* Premium Floating Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 py-4 ${
          isScrolled ? "sm:py-6" : "sm:py-8"
        }`}
      >
        <div 
          className={`max-w-7xl mx-auto rounded-3xl transition-all duration-500 border border-white/5 ${
            isScrolled 
              ? "glass-card px-6 py-3 shadow-2xl backdrop-blur-2xl" 
              : "px-6 py-3 bg-transparent border-transparent"
          }`}
        >
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform duration-300">
                <Camera className="text-white w-6 h-6" />
              </div>
              <div className="text-2xl font-black font-outfit tracking-tight">
                <span className="text-foreground">Attend</span>
                <span className="text-primary">Ease</span>
                <span className="text-muted-foreground/50">PRO</span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-10">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-wide uppercase"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            {/* Auth Actions */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/signin"
                className="px-6 py-2.5 text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div 
          initial={false}
          animate={mobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="lg:hidden overflow-hidden mt-4 mx-auto max-w-7xl px-4"
        >
          <div className="glass-card rounded-3xl p-6 space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-bold text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/signin"
                className="w-full py-3 text-center font-bold text-foreground glass rounded-2xl"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full py-3 text-center font-bold text-white bg-primary rounded-2xl shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Page Content */}
      <div className="relative pt-20">
        {/* Sections */}
        <section className="relative">
          <HeroSection />
        </section>
        
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20 space-y-4">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-primary font-bold tracking-[0.2em] uppercase text-xs"
              >
                Core Capabilities
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-black font-outfit text-gradient"
              >
                Powered by Advanced AI
              </motion.h2>
            </div>
            <FeaturesSection />
          </div>
        </section>
        
        <section id="testimonials" className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/3 opacity-[0.03] -skew-y-3 transform origin-right"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <TestimonialsSection />
          </div>
        </section>
        
        <section id="pricing" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <PricingSection />
          </div>
        </section>
        
        <section id="how-it-works" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <HowItWorksSection />
          </div>
        </section>
        
        <section id="about" className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <AboutSection />
          </div>
        </section>
        
        <section id="contact" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ContactSection />
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </main>
  );
}


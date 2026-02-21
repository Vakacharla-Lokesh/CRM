"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Check, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "Lead Management",
      description:
        "Track and nurture leads through your sales funnel with comprehensive lead tracking and qualification",
    },
    {
      title: "Deal Pipeline",
      description:
        "Manage deals from prospect to close with visual pipeline tracking and automated workflows",
    },
    {
      title: "Organization Tracking",
      description: "Maintain detailed profiles of companies and organizations you work with",
    },
    {
      title: "Multi-Tenant Support",
      description: "Secure, isolated workspaces for multiple teams or clients with role-based access control",
    },
    {
      title: "Call & Activity Logs",
      description:
        "Record calls, comments, and activities to maintain complete customer interaction history",
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time insights and metrics to track performance and make data-driven decisions",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded" />
            <span className="font-semibold text-neutral-900">CRM Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Vakacharla-Lokesh/CRM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <Github size={20} />
            </a>
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-neutral-300 hover:bg-neutral-50"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-block mb-6 px-3 py-1 border border-neutral-200 rounded-full text-sm text-neutral-600 backdrop-blur-sm"
            style={{
              opacity: 1 - scrollY / 500,
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            Open-source CRM for modern teams
          </div>

          <h1
            className="text-6xl md:text-7xl font-light text-neutral-900 mb-6 leading-tight tracking-tight"
            style={{
              opacity: 1 - scrollY / 500,
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          >
            Manage relationships,{" "}
            <span className="relative">
              <span className="absolute inset-0 bg-neutral-100 -z-10 rounded" />
              grow revenue
            </span>
          </h1>

          <p
            className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{
              opacity: 1 - scrollY / 500,
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          >
            A lightweight, open-source CRM built for teams that want to move
            fast. No enterprise bloat. Just powerful customer relationship
            management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-neutral-900 hover:bg-neutral-800 text-white h-12 px-8 text-base gap-2"
            >
              Start Free <ArrowRight size={18} />
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="h-12 px-8 text-base"
            >
              Login to Dashboard
            </Button>
          </div>

          <div className="relative w-full h-80 md:h-96 bg-gradient-to-b from-neutral-50 to-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-4" />
                <p className="text-sm">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-neutral-600">
              Purpose-built features for CRM success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors group"
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-lg mb-4 group-hover:bg-neutral-900 transition-colors flex items-center justify-center">
                  <Check
                    size={20}
                    className="text-neutral-400 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-4xl font-light text-neutral-900 mb-2">
                Leads
              </div>
              <p className="text-neutral-600">Management</p>
            </div>
            <div>
              <div className="text-4xl font-light text-neutral-900 mb-2">
                Deals
              </div>
              <p className="text-neutral-600">Pipeline Tracking</p>
            </div>
            <div>
              <div className="text-4xl font-light text-neutral-900 mb-2">
                Multi
              </div>
              <p className="text-neutral-600">Tenant Support</p>
            </div>
            <div>
              <div className="text-4xl font-light text-neutral-900 mb-2">
                Real-time
              </div>
              <p className="text-neutral-600">Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-6 leading-tight">
            Ready to transform your sales?
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Start managing leads, deals, and organizations more effectively today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-white hover:bg-neutral-100 text-neutral-900 h-12 px-8 text-base gap-2"
            >
              Get Started Free <ArrowRight size={18} />
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 h-12 px-8 text-base"
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Product</h3>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Company</h3>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Resources</h3>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <a
                    href="https://github.com/Vakacharla-Lokesh/CRM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    License
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-600">
            <p>&copy; 2024 CRM Pro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="https://github.com/Vakacharla-Lokesh/CRM"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors flex items-center gap-2"
              >
                <Github size={16} /> GitHub
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className="hover:text-neutral-900 transition-colors flex items-center gap-2"
              >
                <ExternalLink size={16} /> Login
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

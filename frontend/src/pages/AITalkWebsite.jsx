import React, { useState, useEffect } from 'react';
import { ChevronDown, Phone, Mail, Menu, X } from 'lucide-react';

const AITalkWebsite = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const slides = [
    {
      title: "The largest tech show where we present our brand",
      subtitle: "GITEX GLOBAL",
      description: "Secure, private and compliant models training, with all up-to-date knowledge, replying instantly. Fast and cost-effective deployment"
    },
    {
      title: "Innovative AI Solutions for Enterprise",
      subtitle: "NEXT GENERATION",
      description: "Transform your business with cutting-edge artificial intelligence technologies and automated workflows."
    },
    {
      title: "Future-Ready Technology Platform",
      subtitle: "ADVANCED TECH",
      description: "Scalable, reliable, and intelligent systems designed for tomorrow's challenges and opportunities."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const BackgroundElements = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 right-20 w-48 h-48 bg-cyan-400/5 rounded-full animate-bounce" style={{animationDuration: '8s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-400/15 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
      <div className="absolute bottom-32 right-10 w-64 h-64 bg-indigo-500/5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
    </div>
  );

  const Header = () => (
    <header className="relative z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-xl font-bold">AITalk</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-1 cursor-pointer hover:text-cyan-400 transition-colors">
            <span>Products</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <span className="cursor-pointer hover:text-cyan-400 transition-colors">Governments</span>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-cyan-400 transition-colors">
            <span>Industries</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-cyan-400 transition-colors">
            <span>Case Studies</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-cyan-400 transition-colors">
            <span>Company</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </nav>

        {/* Contact Info & CTA */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>+1 608 270 4646</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>sales@aitalk.com</span>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
            Book a Demo
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50">
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-3">
              <div className="text-lg cursor-pointer hover:text-cyan-400">Products</div>
              <div className="text-lg cursor-pointer hover:text-cyan-400">Governments</div>
              <div className="text-lg cursor-pointer hover:text-cyan-400">Industries</div>
              <div className="text-lg cursor-pointer hover:text-cyan-400">Case Studies</div>
              <div className="text-lg cursor-pointer hover:text-cyan-400">Company</div>
            </div>
            <div className="pt-4 border-t border-slate-700/50">
              <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  const AIGraphic = () => (
    <div className="relative">
      {/* Main AI Cube */}
      <div className="relative w-64 h-64 mx-auto">
        {/* Cube base */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-600/30 rounded-2xl transform rotate-12 animate-pulse">
          <div className="absolute inset-4 bg-gradient-to-tr from-white/10 to-cyan-400/20 rounded-xl backdrop-blur-sm">
            {/* AI text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI
              </span>
            </div>
          </div>
        </div>
        
        {/* Orbiting elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full animate-bounce opacity-80"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-1/2 -left-8 w-4 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
        
        {/* Connection lines */}
        <div className="absolute top-1/2 left-1/2 w-32 h-px bg-gradient-to-r from-cyan-400/50 to-transparent transform -translate-y-1/2 rotate-45 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-blue-400/50 to-transparent transform -translate-y-1/2 -rotate-45 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Floating data points */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-8 left-12 w-2 h-2 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-16 right-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-12 left-8 w-1 h-1 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-8 right-16 w-2 h-2 bg-cyan-500 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative">
      <BackgroundElements />
      <Header />
      
      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Subtitle with animation */}
              <div className="overflow-hidden">
                <div 
                  className="text-cyan-400 font-semibold text-lg transform transition-all duration-1000 ease-out"
                  style={{
                    transform: `translateY(${currentSlide * -100}%)`,
                  }}
                >
                  {slides.map((slide, index) => (
                    <div key={index} className="h-8 flex items-center">
                      {slide.subtitle}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Title with animation */}
              <div className="overflow-hidden">
                <div 
                  className="transform transition-all duration-1000 ease-out"
                  style={{
                    transform: `translateY(${currentSlide * -100}%)`,
                  }}
                >
                  {slides.map((slide, index) => (
                    <h1 key={index} className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
                      {slide.title}
                    </h1>
                  ))}
                </div>
              </div>

              {/* Description with animation */}
              <div className="overflow-hidden">
                <div 
                  className="transform transition-all duration-1000 ease-out"
                  style={{
                    transform: `translateY(${currentSlide * -100}%)`,
                  }}
                >
                  {slides.map((slide, index) => (
                    <p key={index} className="text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
                      {slide.description}
                    </p>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                Get a Free Consultation
              </button>

              {/* Slide indicators */}
              <div className="flex space-x-3 mt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-cyan-400 scale-110' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>

            {/* Right Content - AI Graphic */}
            <div className="flex justify-center lg:justify-end">
              <AIGraphic />
            </div>
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default AITalkWebsite;
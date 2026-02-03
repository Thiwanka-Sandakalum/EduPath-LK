
import React from 'react';
import { Target, Eye, Building2, BookOpen, Trophy, Calculator, Bot, Users, Mail, Share2 } from 'lucide-react';

const About = () => {
  const offerings = [
    {
      title: "Institution Directory",
      desc: "Comprehensive database of universities, colleges, and training centers",
      icon: <Building2 className="text-orange-500 h-6 w-6" />,
      bg: "bg-orange-50"
    },
    {
      title: "Course Information",
      desc: "Detailed program information with admission requirements",
      icon: <BookOpen className="text-emerald-500 h-6 w-6" />,
      bg: "bg-emerald-50"
    },
    {
      title: "Scholarship Database",
      desc: "Local and international scholarship opportunities",
      icon: <Trophy className="text-amber-500 h-6 w-6" />,
      bg: "bg-amber-50"
    },
    {
      title: "Z-Score Calculator",
      desc: "Estimate your university admission chances",
      icon: <Calculator className="text-red-500 h-6 w-6" />,
      bg: "bg-red-50"
    },
    {
      title: "AI Chat Assistant",
      desc: "Get instant answers to your education questions",
      icon: <Bot className="text-slate-500 h-6 w-6" />,
      bg: "bg-slate-100"
    },
    {
      title: "Student Forum",
      desc: "Connect with other students and share experiences",
      icon: <Users className="text-blue-500 h-6 w-6" />,
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* HERO SECTION */}
      <div className="relative h-[300px] overflow-hidden mb-12">
         <img 
            src="https://th.bing.com/th/id/OIP.aEIP33Nzfo81hEOZ6S-n5QHaCO?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3" 
            className="w-full h-full object-cover" 
            alt="About Hero" 
         />
         <div className="absolute inset-0 bg-slate-900/60"></div>
         <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 reveal">About EduPath LK</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl reveal">
               Empowering Sri Lanka's future through accessible education information.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10 -mt-20">
        <div className="space-y-6">
          
          {/* Our Mission */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 reveal reveal-delay-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Our Mission</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="text-blue-600 h-8 w-8" />
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                To create a comprehensive, centralized digital platform that connects Sri Lankan students to verified information about educational institutions, scholarships, study programs, and career opportunities, helping them make informed decisions about their future.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 reveal reveal-delay-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Our Vision</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="text-purple-600 h-8 w-8" />
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                To be Sri Lanka's most trusted and comprehensive educational resource platform, empowering every student with the knowledge and tools they need to pursue their educational dreams, regardless of their location or background.
              </p>
            </div>
          </div>

          {/* What We Offer */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 reveal reveal-delay-300">
            <h2 className="text-xl font-bold text-slate-800 mb-8">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offerings.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 reveal reveal-delay-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Contact Us</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <span className="font-medium">info@edupathlk.com</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-slate-500" />
                </div>
                <span className="font-medium">Follow us on social media for updates and educational content</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;

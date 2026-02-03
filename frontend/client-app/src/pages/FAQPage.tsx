
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageCircle, Search } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I apply for scholarships?",
      answer: "You can find scholarships on our Scholarships page. Click 'View Full Details' on any scholarship card to see the eligibility criteria and application steps. Most listings include a direct 'Apply Now' button that redirects you to the official provider's website."
    },
    {
      question: "How to find suitable courses for my A/L stream?",
      answer: "Go to the Courses page and use the 'All Fields' filter. You can also ask our AI Chat Assistant for recommendations based on your stream (e.g., 'I did Physical Science, what courses can I follow?')."
    },
    {
      question: "Is the information on EduPath LK verified?",
      answer: "Yes, we strive to keep our database up-to-date by regularly verifying information with official university websites, the UGC, and scholarship providers. However, we always recommend double-checking with the official institution before applying."
    },
    {
      question: "How do I compare different courses?",
      answer: "Open any course and click 'Compare' to add it (up to three). Then go to Tools  Course Comparison to see a side-by-side comparison of fees, duration, requirements, and more."
    },
    {
      question: "What is a Z-score and how is it calculated?",
      answer: "The Z-Score is a statistical method used by the UGC to standardize A/L results across different subjects and years. You can use our Z-Score Calculator in the Tools section to estimate your potential Z-Score based on your expected grades."
    },
    {
      question: "Can I save institutions for later?",
      answer: "Yes! You can click the 'Bookmark' or 'Save' icon on any institution card. Your saved items will appear in your personalized Dashboard (coming soon for registered users)."
    },
    {
      question: "Are there scholarships for private university students?",
      answer: "Absolutely. Many private universities offer merit-based scholarships, sports scholarships, and financial aid. Check the Scholarships section and filter by 'Local' to find these opportunities."
    },
    {
      question: "How do I know application deadlines?",
      answer: "Our 'Application Deadlines' tool tracks upcoming dates for university admissions and exams. You can also see deadlines highlighted on individual course and scholarship cards."
    },
    {
      question: "Can I study abroad through EduPath LK?",
      answer: "We list international scholarships and partnerships offered by local institutes. While we don't process visa applications directly, we provide information on pathways to study in countries like the UK, Australia, and Japan."
    },
    {
      question: "What should I do if my information is incorrect?",
      answer: "If you find any errors in our data, please contact our support team using the form below or email us at info@edupathlk.com. We appreciate your feedback!"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
       
       {/* HERO SECTION */}
       <div className="relative h-[300px] overflow-hidden mb-12">
         <img 
            src="https://th.bing.com/th/id/R.3a03bd9996d8faa23800db5ce1a23b72?rik=RGZxLFVipbcGCg&pid=ImgRaw&r=0" 
            className="w-full h-full object-cover" 
            alt="FAQ Hero" 
         />
         <div className="absolute inset-0 bg-slate-900/60"></div>
         <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 reveal">Help Center</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl reveal">
               Find answers to your questions about EduPath LK and your educational journey.
            </p>
         </div>
      </div>

       <div className="container mx-auto px-4 max-w-3xl relative z-10 -mt-20">
          
          {/* Header Card */}
          <div className="flex items-center gap-4 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 reveal">
             <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 flex-shrink-0">
                <HelpCircle size={32} />
             </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Frequently Asked Questions</h1>
                <p className="text-slate-500 mt-1">Browse common topics below</p>
             </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4 mb-12">
             {faqs.map((faq, index) => (
                <div key={index} className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 reveal ${index % 2 !== 0 ? 'reveal-delay-100' : ''}`}>
                   <button
                     onClick={() => toggleFAQ(index)}
                     className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                   >
                     <span className="pr-4">{faq.question}</span>
                     {openIndex === index ? (
                       <ChevronUp className="text-blue-500 flex-shrink-0" />
                     ) : (
                       <ChevronDown className="text-slate-400 flex-shrink-0" />
                     )}
                   </button>
                   <div 
                     className={`px-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/50 transition-all duration-300 ease-in-out overflow-hidden ${
                       openIndex === index ? 'max-h-40 py-5 opacity-100' : 'max-h-0 py-0 opacity-0'
                     }`}
                   >
                      {faq.answer}
                   </div>
                </div>
             ))}
          </div>

          {/* Contact Support CTA */}
          <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100 reveal reveal-delay-200">
             <h2 className="text-xl font-bold text-slate-900 mb-2">Still have questions?</h2>
             <p className="text-slate-500 mb-6 max-w-md mx-auto">Can't find the answer you're looking for? Feel free to contact us.</p>
             <button 
               onClick={() => window.location.href = 'mailto:info@edupathlk.com'}
               className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 inline-flex items-center gap-2"
             >
                Contact Support
             </button>
          </div>
       </div>
    </div>
  );
};

export default FAQ;

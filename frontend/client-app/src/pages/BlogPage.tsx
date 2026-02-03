
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, Share2, ChevronRight, 
  Bookmark, MessageSquare, ThumbsUp, Tag, List, Sparkles, Send
} from 'lucide-react';
import { blogPosts, BlogPost } from '../data/mockData';

const slugify = (value: string) => value
   .toLowerCase()
   .trim()
   .replace(/[^a-z0-9\s-]/g, '')
   .replace(/\s+/g, '-')
   .replace(/-+/g, '-');

const copyToClipboard = async (text: string) => {
   try {
      if (navigator?.clipboard?.writeText) {
         await navigator.clipboard.writeText(text);
         return true;
      }
   } catch { /* ignore */ }

   try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
   } catch {
      return false;
   }
};

const heroImages = [
  "https://cdn.pixabay.com/photo/2017/05/30/03/58/blog-2355684_1280.jpg", // Writing / Laptop
  "https://www.signshop.com/wp-content/uploads/2018/08/Shutterstock_REDPIXEL_PL.jpg", // Planning / Calendar
  "https://tse1.mm.bing.net/th/id/OIP.VmGPd86AAhct1K4A8Z1LjgHaE8?w=1200&h=800&rs=1&pid=ImgDetMain&o=7&rm=3"  // Group Study
];

const Blog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
   const [activeCategory, setActiveCategory] = useState<string>('All');

   const openPost = (postId: number) => navigate(`/blog/${postId}`);
   const onPostCardKeyDown = (e: React.KeyboardEvent, postId: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         openPost(postId);
      }
   };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const selectedPost = id ? blogPosts.find(p => p.id === Number(id)) : null;

   const categories = useMemo(() => {
      const set = new Set<string>(blogPosts.map(p => p.category).filter(Boolean));
      return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
   }, []);

   const filteredPosts = useMemo(() => {
      return blogPosts.filter(p => (activeCategory === 'All' ? true : p.category === activeCategory));
   }, [activeCategory]);

  if (selectedPost) {
    return <BlogDetail post={selectedPost} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-slate-900 overflow-hidden">
         {heroImages.map((img, index) => (
            <div 
               key={index}
               className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentHeroIndex ? 'opacity-60' : 'opacity-0'
               }`}
            >
               <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="Blog Hero"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
               />
            </div>
         ))}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
         <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 animate-fade-in-up z-10">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest shadow-lg">Our Blog</span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Guidance for Your <span className="text-blue-400">Future</span></h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
               Expert educational advice, career tips, and study guides curated for the Sri Lankan student community.
            </p>

                  {/* hero dots */}
                  <div className="mt-6 flex items-center justify-center gap-2">
                     {heroImages.map((_, idx) => (
                        <button
                           key={idx}
                           onClick={() => setCurrentHeroIndex(idx)}
                           aria-label={`Show hero image ${idx + 1}`}
                           className={`h-2.5 rounded-full transition-all ${idx === currentHeroIndex ? 'w-10 bg-white/90' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
                        />
                     ))}
                  </div>
         </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 mt-12">
            {/* Filters */}
            <div className="mb-10">
               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div>
                     <h2 className="text-2xl md:text-3xl font-black text-slate-900">Latest Articles</h2>
                     <p className="text-slate-500 mt-2">Showing <span className="font-bold text-slate-800">{filteredPosts.length}</span> posts</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {categories.map(cat => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                              activeCategory === cat
                                 ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                 : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                           }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredPosts.map((post, i) => (
            <article
              key={post.id} 
              role="button"
              tabIndex={0}
              onClick={() => openPost(post.id)}
              onKeyDown={(e) => onPostCardKeyDown(e, post.id)}
              aria-label={`Open post: ${post.title}`}
              className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col h-full transform hover:-translate-y-2 cursor-pointer reveal focus:outline-none focus:ring-4 focus:ring-blue-500/25 ${i % 2 !== 0 ? 'reveal-delay-100' : ''} will-change-transform`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="h-56 overflow-hidden relative rounded-t-[2.5rem]">
                <img
                   src={post.image}
                   alt={post.title}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                   loading="lazy"
                   decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-6 left-6">
                   <span className="bg-white/95 backdrop-blur-md text-slate-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">
                   <Calendar size={14} /> {post.date}
                   <span className="text-slate-300">•</span>
                   <span className="text-slate-400 flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{post.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">{post.summary}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.slice(0, 3).map(tag => (
                     <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                        {tag}
                     </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                   <div className="flex items-center gap-3">
                      <img
                         src={post.authorAvatar}
                         className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                         alt={post.author}
                         loading="lazy"
                         decoding="async"
                      />
                      <div>
                         <p className="text-sm font-bold text-slate-900">{post.author}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{post.authorRole}</p>
                      </div>
                   </div>
                   <div className="text-blue-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      <span className="text-xs font-black uppercase tracking-widest">Read</span>
                      <ChevronRight size={22} />
                   </div>
                </div>
              </div>
            </article>
          ))}
        </div>

            {filteredPosts.length === 0 && (
               <div className="mt-16 text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                  <p className="text-slate-600 font-bold">No posts match your search.</p>
                  <p className="text-slate-400 mt-2">Try a different keyword or category.</p>
               </div>
            )}

        {/* Newsletter Signup */}
        <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden reveal">
          <div className="relative z-10 max-w-2xl mx-auto">
             <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20">
                <Sparkles size={32} className="text-blue-400" />
             </div>
             <h2 className="text-3xl md:text-5xl font-black mb-6">Stay Ahead of the Curve</h2>
             <p className="text-slate-400 mb-12 text-lg md:text-xl font-light">Get the latest scholarship alerts and expert academic advice delivered to your inbox every week.</p>
             <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input type="email" placeholder="Your email address" className="flex-1 px-6 py-4 rounded-2xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/30 text-lg" />
                <button className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/25 active:scale-95">Subscribe</button>
             </div>
          </div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

const BlogDetail = ({ post }: { post: BlogPost }) => {
  const navigate = useNavigate();
  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 3);

   const [shareToast, setShareToast] = useState<string | null>(null);
   const [readingProgress, setReadingProgress] = useState(0);
  
  // Simulated Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{author: string, text: string, time: string}[]>([]);

  const handleLike = () => setIsLiked(!isLiked);
  const handleBookmark = () => setIsBookmarked(!isBookmarked);
   const handleShare = async () => {
      const url = window.location.href;
      try {
         if ((navigator as any)?.share) {
            await (navigator as any).share({ title: post.title, url });
            return;
         }
      } catch { /* ignore */ }

      const ok = await copyToClipboard(url);
      setShareToast(ok ? 'Link copied!' : 'Could not copy link');
      window.setTimeout(() => setShareToast(null), 2000);
   };

  const postComment = () => {
    if (!commentText.trim()) return;
    setComments([{ 
      author: "You", 
      text: commentText, 
      time: "Just now" 
    }, ...comments]);
    setCommentText("");
  };

   useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }, [post.id]);

   useEffect(() => {
      const onScroll = () => {
         const doc = document.documentElement;
         const scrollTop = window.scrollY || doc.scrollTop;
         const scrollHeight = doc.scrollHeight - doc.clientHeight;
         const percent = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
         setReadingProgress(percent);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
   }, []);

  return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24">

         {/* Reading progress */}
         <div className="fixed top-0 left-0 right-0 h-1 z-[70] bg-transparent">
            <div className="h-full bg-blue-600" style={{ width: `${readingProgress}%` }} />
         </div>
      
      {/* Immersive Hero Header (matching second image requirements) */}
      <div className="relative h-[400px] overflow-hidden">
         <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover scale-105"
            loading="eager"
            decoding="async"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

             <div className="absolute top-6 left-0 right-0 z-10">
                <div className="container mx-auto px-4">
                   <div className="flex items-center justify-between">
                      <button
                         onClick={() => navigate('/blog')}
                         aria-label="Back to blog"
                         className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
                      >
                         ← Back
                      </button>
                      <button
                         onClick={handleShare}
                         aria-label="Share this post"
                         className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/15 transition-all flex items-center gap-2"
                      >
                         <Share2 size={18} /> Share
                      </button>
                   </div>
                </div>
             </div>

         <div className="absolute inset-0 flex flex-col justify-end pb-8">
            <div className="container mx-auto px-4">
               <div className="max-w-5xl animate-fade-in-up">
                  <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-widest shadow-xl">
                    {post.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-slate-100">
                     <div className="flex items-center gap-3">
                        <img
                           src={post.authorAvatar}
                           alt={post.author}
                           className="w-10 h-10 rounded-full border-2 border-white shadow-xl"
                           loading="lazy"
                           decoding="async"
                        />
                        <div>
                           <p className="font-bold text-white text-sm">{post.author}</p>
                           <p className="text-slate-300 text-[9px] font-bold uppercase tracking-tighter">{post.authorRole}</p>
                        </div>
                     </div>
                     <div className="hidden sm:block w-px h-6 bg-white/20"></div>
                     <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-400"/> {post.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-400"/> {post.readTime}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
           
           {/* Left Sidebar (Desktop Only) - Sharing / Reactions */}
           <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32 flex flex-col items-center gap-6">
                 <button 
                   onClick={handleLike}
                   className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md ${isLiked ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-slate-400 hover:text-blue-600'}`}
                 >
                    <ThumbsUp size={24} fill={isLiked ? "currentColor" : "none"} />
                 </button>
                 <button 
                   onClick={() => document.getElementById('comment-box')?.focus()}
                   className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-600 hover:shadow-md transition-all"
                 >
                    <MessageSquare size={24} />
                 </button>
                 <div className="h-px w-8 bg-slate-200 my-2"></div>
                 <button 
                   onClick={handleShare}
                   className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-600 transition-all"
                 >
                    <Share2 size={24} />
                 </button>
                 <button 
                   onClick={handleBookmark}
                   className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all ${isBookmarked ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-slate-400 hover:text-blue-600'}`}
                 >
                    <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
                 </button>
              </div>
           </div>

           {/* Main Article Body */}
           <div className="lg:col-span-7">
              <article className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-200">
                 {/* Lead Paragraph */}
                 <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed mb-10 border-l-4 border-blue-500 pl-8">
                    {post.summary}
                 </p>

                 {/* Rich Text Content */}
                 <div className="prose prose-base md:prose-lg prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                    {post.content.split('\n\n').map((para, i) => {
                        if (para.startsWith('###')) {
                        const text = para.replace('###', '').trim();
                        const hid = `h3-${slugify(text)}`;
                        return <h3 id={hid} key={i} className="scroll-mt-20 text-xl font-bold text-slate-800 mt-10 mb-5">{text}</h3>;
                        }
                        if (para.startsWith('#')) {
                        const text = para.replace('#', '').trim();
                        const hid = `h2-${slugify(text)}`;
                        return <h2 id={hid} key={i} className="scroll-mt-20 text-2xl md:text-3xl font-black text-slate-800 mt-14 mb-7">{text}</h2>;
                        }
                        return <p key={i} className="mb-6">{para}</p>;
                    })}
                 </div>

                 {/* Tags */}
                 <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-3">
                    {post.tags.map(tag => (
                       <span key={tag} className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                          <Tag size={14} /> {tag}
                       </span>
                    ))}
                 </div>
              </article>

              {/* Comments Section */}
              <div className="mt-12 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm reveal">
                 <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <MessageSquare className="text-blue-600" /> Join the Discussion
                 </h3>
                 <div className="space-y-6 mb-8">
                    {comments.map((c, i) => (
                       <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl animate-fade-in">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                             {c.author.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 mb-1">{c.author} <span className="text-[10px] text-slate-400 ml-2 font-medium uppercase tracking-wider">{c.time}</span></p>
                             <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="relative">
                    <textarea 
                       id="comment-box"
                       value={commentText}
                       onChange={(e) => setCommentText(e.target.value)}
                       placeholder="Share your thoughts or ask a question..." 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 h-32 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none pr-20"
                    ></textarea>
                    <div className="flex justify-end mt-4">
                       <button 
                         onClick={postComment}
                         disabled={!commentText.trim()}
                         className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          Post Comment <Send size={18} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Sidebar - Author Info / Trending / Related */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Author Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm reveal">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">About the Author</h4>
                 <div className="flex items-center gap-4 mb-6">
                    <img
                       src={post.authorAvatar}
                       className="w-16 h-16 rounded-2xl object-cover shadow-md"
                       alt={post.author}
                       loading="lazy"
                       decoding="async"
                    />
                    <div>
                       <p className="font-bold text-slate-900 text-lg">{post.author}</p>
                       <p className="text-blue-600 text-xs font-bold uppercase">{post.authorRole}</p>
                    </div>
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Professional dedicated to bridging the information gap for students in Sri Lanka. Expertise in higher education consulting and career guidance.
                 </p>
                 <button 
                   onClick={() => navigate('/blog')}
                   className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                 >
                   View All Posts
                 </button>
              </div>

              {/* Related Posts */}
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl reveal reveal-delay-100">
                 <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <List size={18} /> Related Articles
                 </h4>
                 <div className="space-y-8">
                    {relatedPosts.map(related => (
                       <div 
                         key={related.id} 
                         onClick={() => navigate(`/blog/${related.id}`)}
                         className="group cursor-pointer flex gap-4"
                       >
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                             <img
                                src={related.image}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                alt={related.title}
                                loading="lazy"
                                decoding="async"
                             />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{related.category}</p>
                             <h5 className="font-bold text-sm leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">{related.title}</h5>
                             <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">{related.date}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Category Browser */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm reveal reveal-delay-200">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Browse Categories</h4>
                 <div className="flex flex-wrap gap-2">
                    {["Guidance", "Scholarships", "Career", "Study Tips", "Campus Life", "Events"].map(cat => (
                       <button key={cat} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                          {cat}
                       </button>
                    ))}
                 </div>
              </div>

           </div>
        </div>
      </div>

         {/* Mobile action bar */}
         <div className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden">
            <div className="mx-auto max-w-3xl px-4 pb-4">
               <div className="bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center justify-between p-2">
                  <button
                     onClick={handleLike}
                     className={`flex-1 mx-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isLiked ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}
                  >
                     <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} /> Like
                  </button>
                  <button
                     onClick={() => document.getElementById('comment-box')?.focus()}
                     className="flex-1 mx-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-50 text-slate-600"
                  >
                     <MessageSquare size={18} /> Comment
                  </button>
                  <button
                     onClick={handleShare}
                     className="flex-1 mx-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-50 text-slate-600"
                  >
                     <Share2 size={18} /> Share
                  </button>
                  <button
                     onClick={handleBookmark}
                     className={`flex-1 mx-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isBookmarked ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}
                  >
                     <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} /> Save
                  </button>
               </div>
            </div>
         </div>

         {/* Share toast */}
         {shareToast && (
            <div className="fixed bottom-24 right-4 z-[80]">
               <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl font-bold">
                  {shareToast}
               </div>
            </div>
         )}
    </div>
  );
};

export default Blog;

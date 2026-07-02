import React, { useState } from 'react';

const MOCK_BLOGS = [
  {
    id: 1,
    title: 'Understanding the Recent Fed Rate Pause',
    desc: "An in-depth look at the Federal Reserve's decision to hold interest rates steady and the immediate ripple effects across major globa...",
    category: 'MARKET ANALYSIS',
    categoryColor: 'text-[#006e1c]',
    date: 'Oct 22, 2023',
    img: '/fed_pause.png'
  },
  {
    id: 2,
    title: 'Options Trading Basics: Calls vs. Puts',
    desc: 'A beginner-friendly guide to understanding the fundamental differences between call and put options, and when to utilize each...',
    category: 'EDUCATION',
    categoryColor: 'text-[#005cab]',
    date: 'Oct 18, 2023',
    img: '/options_basics.png'
  },
  {
    id: 3,
    title: 'Supply Chain Disruptions in Q4',
    desc: 'Analyzing the potential bottlenecks in global shipping as we head into the busy holiday season, and which sectors are most...',
    category: 'ECONOMICS',
    categoryColor: 'text-[#FF9D3B]',
    date: 'Oct 15, 2023',
    img: '/supply_chain.png'
  },
  {
    id: 4,
    title: 'Stock Island Platform Updates: Mobile V2.0',
    desc: 'Discover the new features rolling out in the latest version of our mobile app, designed to make execution faster and analysis more...',
    category: 'COMPANY NEWS',
    categoryColor: 'text-[#ac2c2b]',
    date: 'Oct 10, 2023',
    img: '/mobile_updates.png'
  }
];

export default function Blogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All Posts', 'Market Analysis', 'Education', 'Company News', 'Economics'];

  const filteredBlogs = MOCK_BLOGS.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    let normFilter = activeFilter.toUpperCase();
    if (activeFilter === 'All Posts') normFilter = 'ALL';
    
    const matchesFilter = normFilter === 'ALL' || blog.category === normFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto sm:px-6 sm:py-8 bg-surface-container-lowest pb-12">
      {/* Cool Header */}
      <div className="pt-6 pb-4 px-4 sm:px-0">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#7d20a3]">
          Insights & News
        </h1>
        <p className="text-xs text-on-surface-variant mt-1.5 font-medium">Stay ahead of the market with our latest updates.</p>
      </div>
      {/* Featured Blog Card */}
      <section className="relative w-full h-[260px] sm:h-[320px] mb-8 sm:mb-10 flex items-end sm:rounded-2xl overflow-hidden shadow-md group cursor-pointer">
        <img 
          src="/tech_stock_graph.png" 
          alt="The Resurgence of Tech Stocks" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="relative z-10 p-5 sm:p-8 w-full">
           <div className="flex gap-2 items-center text-[10px] font-bold tracking-wider text-white/90 mb-3">
             <span className="bg-primary px-2 py-0.5 rounded shadow-sm">MARKET ANALYSIS</span>
             <span className="opacity-70">•</span>
             <span className="opacity-70">Oct 24, 2023</span>
           </div>
           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-2 drop-shadow-md">
             The Resurgence of Tech Stocks: A Q3 Deep Dive
           </h2>
           <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-2xl mb-5 font-medium drop-shadow">
             As quarterly reports roll in, the technology sector is demonstrating unexpected resilience. We analyze the driving factors behind the recent upswing.
           </p>
           <button className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl w-max">
             Read Article <span className="material-icons text-[16px]">arrow_forward</span>
           </button>
        </div>
      </section>

      {/* Filters and Search Bar */}
      <section className="flex flex-col gap-4 mb-8 px-4 sm:px-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2.5 text-[11px] overflow-x-auto no-scrollbar w-full pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all ${
                  activeFilter === cat 
                    ? 'bg-gradient-to-r from-primary to-[#2d76c8] text-white shadow-md' 
                    : 'bg-white text-on-surface-variant border border-border-subtle hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative w-full">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-border-subtle rounded-md text-xs text-on-surface pl-11 pr-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none placeholder-outline shadow-sm transition-all"
            placeholder="Search articles, insights, and news..."
          />
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-4 sm:px-0 mb-10">
        {filteredBlogs.map(blog => (
          <article 
            key={blog.id} 
            className="bg-white border border-border-subtle/50 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group cursor-pointer shadow-sm"
          >
            <div className="h-48 w-full bg-surface-container-low overflow-hidden relative">
              <img 
                src={blog.img} 
                alt={blog.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded shadow-sm">
                 <span className={`text-[9px] font-extrabold tracking-wider ${blog.categoryColor}`}>{blog.category}</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex gap-2 items-center text-[10px] font-bold tracking-wide mb-3">
                  <span className="text-on-surface-variant font-mono flex items-center gap-1">
                    <span className="material-icons text-[12px]">calendar_today</span>
                    {blog.date}
                  </span>
                </div>
                <h3 className="font-extrabold text-[15px] text-on-surface leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                  {blog.desc}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Load More Button */}
      <div className="flex justify-center pt-2 px-4 sm:px-0">
        <button className="w-full sm:w-auto px-10 py-2.5 border border-border-subtle bg-white hover:bg-surface-container-low text-xs font-semibold rounded-md text-primary shadow-sm hover:shadow transition-all">
          Load More Articles
        </button>
      </div>
    </main>
  );
}

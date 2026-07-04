import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Blogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await api.getBlogs();
        setBlogs(data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = ['All Posts', ...Array.from(new Set(blogs.map(b => b.category)))].slice(0, 8);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (blog.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let normFilter = activeFilter.toUpperCase();
    if (activeFilter === 'All Posts' || activeFilter === 'All') normFilter = 'ALL';
    
    const matchesFilter = normFilter === 'ALL' || (blog.category && blog.category.toUpperCase() === normFilter);
    return matchesSearch && matchesFilter;
  });

  const isSearchingOrFiltering = searchQuery.trim().length > 0 || (activeFilter !== 'All' && activeFilter !== 'All Posts');
  const featuredBlog = (!isSearchingOrFiltering && blogs.length > 0) ? blogs[0] : null;
  
  // Exclude featured blog from the grid
  const gridBlogs = featuredBlog 
    ? filteredBlogs.filter(b => b.id !== featuredBlog.id)
    : filteredBlogs;

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
      {featuredBlog && (
      <section 
        className="relative w-full h-[320px] sm:h-[400px] mb-8 sm:mb-10 flex items-end sm:rounded-2xl overflow-hidden shadow-md group cursor-pointer"
        onClick={() => window.open(featuredBlog.url, '_blank')}
      >
        <img 
          src={featuredBlog.image_url || "/tech_stock_graph.png"} 
          alt={featuredBlog.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => { e.target.onerror = null; e.target.src = "/tech_stock_graph.png" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent backdrop-blur-[2px]"></div>
        <div className="relative z-10 p-5 sm:p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
           <div className="flex gap-2 items-center text-[10px] font-bold tracking-wider text-white/90 mb-3">
             <span className="bg-primary px-2 py-0.5 rounded shadow-sm truncate max-w-[130px] sm:max-w-[250px] inline-block">{featuredBlog.category}</span>
             <span className="opacity-70 shrink-0">•</span>
             <span className="opacity-70 shrink-0">{new Date(featuredBlog.published_at).toLocaleDateString()}</span>
           </div>
           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-2 drop-shadow-md">
             {featuredBlog.title}
           </h2>
           <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-2xl mb-5 font-medium drop-shadow" dangerouslySetInnerHTML={{__html: featuredBlog.description}}></p>
           <button className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl w-max">
             Read Article <span className="material-icons text-[16px]">arrow_forward</span>
           </button>
        </div>
      </section>
      )}

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
        {loading ? (
          <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-500 gap-3">
             <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full"></div>
             <span className="text-sm font-medium">Fetching latest news...</span>
          </div>
        ) : gridBlogs.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500 text-sm">
            No articles found matching your criteria.
          </div>
        ) : gridBlogs.slice(0, visibleCount).map(blog => (
          <article 
            key={blog.id} 
            onClick={() => window.open(blog.url, '_blank')}
            className="bg-white border border-border-subtle/50 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group cursor-pointer shadow-sm"
          >
            <div className="h-48 w-full bg-surface-container-low overflow-hidden relative">
              <img 
                src={blog.image_url || "/tech_stock_graph.png"} 
                alt={blog.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.onerror = null; e.target.src = "/tech_stock_graph.png" }}
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded shadow-sm">
                 <span className={`text-[9px] font-extrabold tracking-wider ${blog.category_color || 'text-[#005cab]'}`}>{blog.category}</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex gap-2 items-center text-[10px] font-bold tracking-wide mb-3">
                  <span className="text-on-surface-variant font-mono flex items-center gap-1">
                    <span className="material-icons text-[12px]">calendar_today</span>
                    {new Date(blog.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-extrabold text-[15px] text-on-surface leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{__html: blog.title}}>
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{__html: blog.description}}>
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Load More Button */}
      {visibleCount < filteredBlogs.length && (
        <div className="flex justify-center pt-2 px-4 sm:px-0">
          <button 
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="w-full sm:w-auto px-10 py-2.5 border border-border-subtle bg-white hover:bg-surface-container-low text-xs font-semibold rounded-md text-primary shadow-sm hover:shadow transition-all"
          >
            Load More Articles
          </button>
        </div>
      )}
    </main>
  );
}

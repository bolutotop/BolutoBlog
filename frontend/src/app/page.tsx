export default function Home() {
  return (
    <>
      {/* 噪点覆盖层 */}
      <div className="grain-overlay"></div>

      {/* 导航栏 */}
      <nav className="fixed top-8 right-8 z-40" data-purpose="minimal-nav">
        <div className="flex flex-col items-end space-y-4">
          <button
            aria-label="Menu"
            className="w-10 h-10 flex flex-col items-end justify-center space-y-1.5 group"
          >
            <span className="block w-8 h-0.5 bg-charcoal transition-all group-hover:w-6"></span>
            <span className="block w-5 h-0.5 bg-charcoal transition-all group-hover:w-8"></span>
            <span className="block w-7 h-0.5 bg-charcoal transition-all group-hover:w-4"></span>
          </button>
          <div className="hidden md:flex flex-col items-end space-y-2 text-sm font-medium uppercase tracking-widest text-charcoal/60">
            <a className="hover:text-brand transition-colors" href="#">
              Archive
            </a>
            <a className="hover:text-brand transition-colors" href="#">
              Lab
            </a>
            <a className="hover:text-brand transition-colors" href="#">
              About
            </a>
          </div>
        </div>
      </nav>

      {/* 头部品牌 */}
      <header className="p-8 md:p-12 lg:p-20 relative z-10">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-forest leading-none">
            JOURNAL<span className="text-brand">.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-earth max-w-md font-light italic">
            Observations on the intersection of hardware, human habits, and the slow process of learning.
          </p>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="max-w-screen-xl mx-auto px-8 md:px-12 lg:px-20 pb-32">
        <div className="asymmetric-grid">
          {/* 特色文章区 */}
          <section className="col-span-12 lg:col-span-8 relative mb-24" data-purpose="hero-feature">
            <div className="absolute -left-12 top-0 sidebar-text hidden md:block text-xs uppercase tracking-[0.3em] text-earth/40">
              Featured Entry — 04 / 2024
            </div>
            <div className="relative group overflow-hidden rounded-custom shadow-2xl">
              {/* 注意：在实际生产环境中，建议使用 next/image 替换原生 img 标签以获得更好的性能优化 */}
              <img
                alt="Film style desk setup"
                className="w-full h-[60vh] object-cover film-grain-img transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUQk8QRJ8A9-EUPPjuUe_ypU1e1c8Qq57LvpA-x7G7assG4sGvzGiPYVC_ge2_XXugTtOHxN4yjxME8H7CCOkBG3itG2fuQFaUH0hvdku4rFlf_1phCjZkHBdfAiBqxWgOI8DtWHVUypYpw9C3p27sWTy_hXoIPTZwsBaN3lwDFAlLwBiTMD3UEf85wcRtaVrX7iEK50w2N0yDP9atvy8ORq590C8wqAf3PiEyxgMJxhcJEbCl95n-mMoi0S0GYd7j_0VoGPuL6os"
              />
              <div className="absolute inset-0 bg-forest/20 mix-blend-overlay"></div>
            </div>
            <div className="relative lg:-mt-32 lg:ml-12 bg-white p-8 md:p-12 shadow-xl border border-charcoal/5 rounded-custom max-w-2xl">
              <span className="text-brand font-bold text-sm tracking-widest uppercase mb-4 block">
                Hardware Philosophy
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-charcoal leading-tight mb-6">
                The tactile feedback of learning: Why I still use physical notebooks.
              </h2>
              <p className="text-earth leading-relaxed mb-8 text-lg">
                There's a specific cognitive weight to ink on paper that pixels can't replicate. In this entry, I
                explore how the limitations of physical media actually foster deeper concentration and better memory
                retention.
              </p>
              <a className="inline-flex items-center space-x-4 group" href="#">
                <span className="h-[1px] w-12 bg-charcoal group-hover:w-20 transition-all"></span>
                <span className="font-bold text-sm uppercase tracking-widest">Read Entry</span>
              </a>
            </div>
          </section>

          {/* 左侧窄列 */}
          <div className="col-span-12 lg:col-span-4 lg:mt-24 space-y-24">
            <article className="relative" data-purpose="short-log">
              <div className="border-l-2 border-forest pl-6">
                <time className="text-xs font-bold text-earth/50 block mb-2 tracking-widest uppercase">
                  March 12
                </time>
                <h3 className="text-xl font-bold text-charcoal mb-3">Re-coding the old ways.</h3>
                <p className="text-earth text-sm leading-relaxed mb-4">
                  Exploring minimal CSS frameworks and the beauty of semantic HTML without the bloat.
                </p>
                <a className="text-xs font-bold uppercase tracking-tighter text-brand border-b border-brand/20" href="#">
                  View Notes
                </a>
              </div>
            </article>
            <article className="relative bg-forest p-8 rounded-custom text-paper" data-purpose="dark-accent-block">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Current Reading List</h3>
                  <ul className="space-y-3 text-sm font-light opacity-80">
                    <li>• The Glass Bead Game — Hesse</li>
                    <li>• Thinking, Fast and Slow — Kahneman</li>
                    <li>• Low-tech Magazine: Printed Version</li>
                  </ul>
                </div>
                <div className="mt-12">
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Updated Weekly</span>
                </div>
              </div>
            </article>
          </div>

          {/* 右侧宽列 */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6 space-y-32">
            <section className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2">
                <img
                  alt="Forest view"
                  className="w-full h-auto aspect-[3/4] object-cover rounded-custom film-grain-img grayscale hover:grayscale-0 transition-all duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1CVOFq0Ios3TGYJlUrLYQmrbeghCMTM1W9o6X28eu9BAnG7gDVOUiXrRtpoLqu5hFbkzBZWoQ1Zi-oKAlbKFwtRDILFIICdduCBiUgAnXZ2F4ZYRQIK_iVE_t8cmjy4R3NID02KF0ArXzBdGkevbejqorCOu3Hff2l1RTBcxATv0_4CfpLZNK6H08ajzj_KL2lm--tbWqVb2Y7rdrcGOzlNdNmGcf7Q6fHIcyzD-GvSv9j_3JpISRDAJQDgrzURAuUCCZRMvIxDI"
                />
              </div>
              <div className="w-full md:w-1/2 pt-12">
                <span className="text-xs font-bold text-brand uppercase tracking-widest mb-4 block">
                  Travel & Mindset
                </span>
                <h3 className="text-3xl font-bold text-charcoal mb-6">Slow living in a high-speed world.</h3>
                <p className="text-earth leading-relaxed mb-6">
                  Sometimes the best tech upgrade is a long walk without a smartphone. Notes from my recent trip to the
                  Black Forest and the silence I found there.
                </p>
                <button className="px-6 py-3 border border-charcoal/20 hover:bg-charcoal hover:text-white transition-all text-xs font-bold uppercase tracking-widest rounded-custom">
                  Explore Gallery
                </button>
              </div>
            </section>

            {/* 引言区域 */}
            <section className="py-20 border-t border-charcoal/10">
              <blockquote className="text-4xl md:text-6xl font-light text-forest leading-tight tracking-tight italic">
                "We shape our tools, and thereafter our tools shape us."
              </blockquote>
              <cite className="block mt-8 text-sm uppercase tracking-widest font-bold text-earth">
                — Marshall McLuhan
              </cite>
            </section>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-charcoal text-paper py-20 px-8 md:px-12 lg:px-20 mt-20" data-purpose="site-footer">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="max-w-md">
            <h4 className="text-2xl font-bold mb-4">Stay in touch.</h4>
            <p className="text-paper/60 text-sm mb-8">
              A monthly dispatch of things I've built, read, and thought about. No spam, just human thoughts.
            </p>
            <form className="flex gap-2">
              <input
                className="bg-transparent border-b border-paper/30 py-2 focus:outline-none focus:border-brand transition-colors w-full text-sm"
                placeholder="email@address.com"
                type="email"
              />
              <button className="text-brand font-bold uppercase text-xs tracking-widest" type="submit">
                Join
              </button>
            </form>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="flex space-x-6 mb-8 text-sm font-medium">
              <a className="hover:text-brand transition-colors" href="#">
                RSS
              </a>
              <a className="hover:text-brand transition-colors" href="#">
                GitHub
              </a>
              <a className="hover:text-brand transition-colors" href="#">
                LinkedIn
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">
              © 2024 Built with intention.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
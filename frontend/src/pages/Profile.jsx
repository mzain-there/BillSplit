import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'

export default function Profile(){
  useEffect(()=>{
    // notification toggle and fade-in observer handled in components
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('opacity-100')
          entry.target.classList.remove('translate-y-10')
        }
      })
    },{threshold:0.1})
    document.querySelectorAll('.animate-fade-in').forEach(el=>{
      el.classList.add('transition-all','duration-700','ease-out','opacity-0','translate-y-10')
      observer.observe(el)
    })
    return ()=> observer.disconnect()
  },[])

  // Toggle buttons handler
  useEffect(()=>{
    function toggleHandler(e){
      const btn = e.currentTarget
      const dot = btn.querySelector('div')
      if(btn.classList.contains('bg-primary')){
        btn.classList.replace('bg-primary','bg-surface-container-highest')
        dot.classList.replace('translate-x-6','translate-x-0')
      } else {
        btn.classList.replace('bg-surface-container-highest','bg-primary')
        dot.classList.replace('translate-x-0','translate-x-6')
      }
    }
    document.querySelectorAll('button.w-14').forEach(btn=>btn.addEventListener('click', toggleHandler))
    return ()=> document.querySelectorAll('button.w-14').forEach(btn=>btn.removeEventListener('click', toggleHandler))
  },[])

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-gutter py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <aside className="lg:col-span-4 space-y-gutter sticky top-28">
            <div className="glass-card rounded-xl p-8 flex flex-col items-center text-center primary-glow animate-fade-in">
              <div className="relative group">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-xl overflow-hidden mb-6 relative z-10">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDiGqxe-hVBWtLF6EVbkWeuD-fQUr4JmVdoMTt5ruXpjvdjukDb6VAXs0_nHejD0XeE42dCqqZO8_JfBzs5-xRlUcQPvrEd5qkSteMtaS0L0ZM4I2oxnoJRAiq43gfgrHPJ-CmsqmxNJBiQVVfV-ld3NkUK5WjdKUfykdvt7CFKVaUIebYlHkkx8SUfkiyvGNjNd-EmiJMlftZMKL2RmM6yCzITY69Bsvb0ZGybvDiQGZF4hVNnwSNnEup6QVV-ZpuNw54mY-PMSI2" />
                </div>
                <button className="absolute bottom-6 right-2 z-20 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                  <span className="material-symbols-outlined" style={{fontSize:20}}>edit</span>
                </button>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-1">Alex Rivers</h1>
              <p className="text-on-surface-variant font-label-md mb-8">alex.rivers@design.co</p>
              <div className="grid grid-cols-3 w-full gap-4 pt-8 border-t border-outline-variant/30">
                <div>
                  <div className="font-headline-md text-headline-md text-primary">12</div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">Groups</div>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-primary">48</div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">Splits</div>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-secondary">$2.4k</div>
                  <div className="text-label-sm text-on-surface-variant uppercase tracking-wider">Settled</div>
                </div>
              </div>
            </div>
          </aside>
          <section className="lg:col-span-8 space-y-8">
            <div className="glass-card rounded-xl p-8 md:p-10 space-y-8 animate-fade-in" style={{animationDelay:'0.1s'}}>
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
                <h2 className="font-headline-md text-headline-md flex items-center gap-3"><span className="material-symbols-outlined text-primary">person</span>Personal Information</h2>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-6">
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">First Name</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" type="text" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Last Name</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" type="text" defaultValue="Rivers" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Email Address</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" type="email" defaultValue="alex.rivers@design.co" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-label-md font-semibold text-on-surface-variant px-1">Bio</label>
                  <textarea className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white resize-none" rows="3">Product Designer based in SF. Obsessed with splitting checks and minimal design systems.</textarea>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all primary-glow" type="submit">Save Changes</button>
                </div>
              </form>
            </div>
            <div className="glass-card rounded-xl p-8 md:p-10 space-y-8 animate-fade-in" style={{animationDelay:'0.2s'}}>
              <h2 className="font-headline-md text-headline-md flex items-center gap-3 border-b border-outline-variant/30 pb-6"><span className="material-symbols-outlined text-primary">lock</span>Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-6">
                <div className="space-y-2"><label className="text-label-md font-semibold text-on-surface-variant px-1">Current Password</label><input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" placeholder="••••••••" type="password" /></div>
                <div className="space-y-2"><label className="text-label-md font-semibold text-on-surface-variant px-1">New Password</label><input className="w-full bg-surface-container-low border-none rounded-lg p-4 font-body-md transition-all focus:bg-white" placeholder="••••••••" type="password" /></div>
                <div className="md:col-span-2"><button className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all">Change Password</button></div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-8 md:p-10 space-y-8 animate-fade-in" style={{animationDelay:'0.3s'}}>
              <h2 className="font-headline-md text-headline-md flex items-center gap-3 border-b border-outline-variant/30 pb-6"><span className="material-symbols-outlined text-primary">notifications_active</span>Notification Toggles</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div><h4 className="font-bold text-on-surface">Email Notifications</h4><p className="text-label-md text-on-surface-variant">Receive weekly expense summaries</p></div>
                  <button className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors duration-300 shadow-inner"><div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6 transition-transform duration-300" /></button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div><h4 className="font-bold text-on-surface">Push Notifications</h4><p className="text-label-md text-on-surface-variant">Instant alerts for new requests</p></div>
                  <button className="w-14 h-8 bg-surface-container-highest rounded-full relative p-1 transition-colors duration-300 shadow-inner"><div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-0 transition-transform duration-300" /></button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div><h4 className="font-bold text-on-surface">Settlement Reminders</h4><p className="text-label-md text-on-surface-variant">Remind friends to pay back</p></div>
                  <button className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors duration-300 shadow-inner"><div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6 transition-transform duration-300" /></button>
                </div>
              </div>
            </div>
            <div className="bg-error-container/20 rounded-xl p-8 md:p-10 border-2 border-error/10 space-y-6 animate-fade-in" style={{animationDelay:'0.4s'}}>
              <div>
                <h2 className="font-headline-md text-headline-md text-error flex items-center gap-3 mb-2"><span className="material-symbols-outlined">heart_broken</span>Danger Zone</h2>
                <p className="text-body-md text-on-surface-variant">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button className="bg-error text-on-error px-8 py-4 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg w-full sm:w-auto">Delete Account</button>
                <button className="text-on-surface-variant font-bold px-8 py-4 rounded-lg hover:bg-surface-container transition-all w-full sm:w-auto">Deactivate Temporary</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

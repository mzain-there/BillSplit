import React, { useEffect } from 'react'

export default function Login(){
  useEffect(()=>{
    const card = document.querySelector('.glass-card.primary-glow')
    if(!card) return
    const onMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
        card.style.boxShadow = `${(x - rect.width/2)/20}px ${(y - rect.height/2)/20}px 30px -10px rgba(99, 102, 241, 0.2)`
      } else {
        card.style.boxShadow = ''
      }
    }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  },[])

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire to auth API
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
      <header className="sticky top-0 w-full z-50 glass-nav border-b border-primary/10 shadow-sm">
        <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight">BillSplit</div>
          <div className="hidden md:flex items-center gap-6">
            <a className="font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Join the Waitlist</a>
            <button className="bg-primary text-on-primary px-6 py-2 rounded-xl font-label-md hover:scale-[1.02] transition-transform duration-300 ease-out active:scale-95 primary-glow">Sign Up</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="w-full md:w-1/2 flex flex-col justify-center py-12 md:py-0 pr-0 md:pr-16 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-on-surface mb-8 max-w-lg leading-tight">Split bills. <br/><span className="text-primary italic">Not friendships.</span></h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mb-12">Effortless expense sharing with high-end financial transparency. Designed for the modern era of collaborative living.</p>
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-card p-4 animate-float group">
              <div className="w-full h-full bg-cover bg-center rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out" style={{backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCWV4l7A9njyVkB3Dpq8HIuvzPvUnjp1m-ONKS7VnzUs6NBWcAR8we6ScY-4fldHLmLzlBiDUHXO3mY-IrToZiq_ougdHCCxXhw6pb97p1Rd1BImlltPo4Q4PIqIMJ8_8gK24gt2-ACNmFzSjmzDmnvqTb_qwxtChFbOakdEtj-is2AeT3AFM5rHUtaEb30tPcsmO75SgVlQwMcl5-wUo5aD5V8MM9MEsQNAYrYYAoP_yYwtCekLKWY7NTeHH6UBN1w8mYiy76Wnxyv')`}} data-alt="abstract illustration"></div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0">
          <div className="w-full max-w-md glass-card rounded-[32px] p-8 md:p-12 primary-glow">
            <div className="mb-10 text-center md:text-left">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Welcome Back</h2>
              <p className="font-body-md text-on-surface-variant">Enter your credentials to continue splitting.</p>
            </div>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="floating-label-group">
                <input autoComplete="email" className="notion-input font-body-md text-on-surface" id="email" placeholder=" " type="email" />
                <label className="font-body-md" htmlFor="email">Email Address</label>
              </div>
              <div className="floating-label-group">
                <input autoComplete="current-password" className="notion-input font-body-md text-on-surface" id="password" placeholder=" " type="password" />
                <label className="font-body-md" htmlFor="password">Password</label>
              </div>
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant hover:text-primary transition-colors">
                  <input className="w-4 h-4 rounded-sm border-outline text-primary focus:ring-primary/20" type="checkbox" />
                  Remember me
                </label>
                <a className="text-primary hover:underline transition-all" href="#">Forgot Password?</a>
              </div>
              <div className="space-y-4 pt-4">
                <button className="w-full bg-primary text-on-primary font-label-md py-4 rounded-2xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 primary-glow flex items-center justify-center gap-2" type="submit">
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-outline-variant"></div>
                  <span className="flex-shrink mx-4 text-outline font-label-sm">OR</span>
                  <div className="flex-grow border-t border-outline-variant"></div>
                </div>
                <button className="w-full glass-card text-on-surface font-label-md py-4 rounded-2xl transition-all duration-300 ease-out hover:bg-surface-container-low flex items-center justify-center gap-3 border border-outline-variant/30" type="button">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>
            <p className="mt-8 text-center font-body-md text-on-surface-variant">Don't have an account? <a className="text-primary font-bold hover:underline" href="#">Sign up for free</a></p>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 px-margin-mobile md:px-gutter max-w-container-max mx-auto border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-outline font-label-sm">
          <p>© 2024 BillSplit Technologies Inc.</p>
          <div className="flex gap-8">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

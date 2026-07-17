import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function Register(){
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    // sticky header scroll behavior
    const onScroll = () => {
      const nav = document.querySelector('nav')
      if(!nav) return
      if(window.scrollY > 20){
        nav.classList.add('bg-surface/95')
        nav.classList.remove('bg-surface/85')
      } else {
        nav.classList.add('bg-surface/85')
        nav.classList.remove('bg-surface/95')
      }
    }
    window.addEventListener('scroll', onScroll)
    return ()=> window.removeEventListener('scroll', onScroll)
  },[])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if(!formData.username || !formData.email || !formData.password){
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if(formData.password.length < 6){
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // API call will be added here when backend is ready
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      // const data = await response.json()
      // if(!response.ok) throw new Error(data.message)
      // login(data.token)
      
      // Temporary success for now
      const overlay = document.getElementById('successOverlay')
      if(overlay){
        overlay.classList.remove('opacity-0','pointer-events-none')
        overlay.classList.add('opacity-100')
        setTimeout(()=> navigate('/login'), 3000)
      }
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      <nav className="sticky top-0 w-full z-50 bg-surface/85 backdrop-blur-lg border-b border-primary/10 shadow-[0_20px_30px_rgba(99,102,241,0.15)]">
        <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>BillSplit</div>
          <div className="hidden md:flex items-center space-x-8">
            <button type="button" onClick={() => navigate('/login')} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors bg-none border-none cursor-pointer">Log In</button>
            <button type="button" className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1 bg-none border-none cursor-pointer">Sign Up</button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="material-symbols-outlined text-primary text-2xl hover:scale-[1.02] transition-transform">notifications</button>
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2XejcN_JdZlAQ90E976skNGJRODu605zC2DX3Du16t8x4FmP9KLCNJ0AetC-vXtbinL6n76no8lRNCPVzbI8ZCaslm_8mU0r6r1QNejXlHiK-f5qzzNUosf5D1FPq6q4p1Pnm_1TOrbIiS0NJUXgYXMSs7YrRA47IZtCG1nzrkD-2Q-5rD1QEzl04Isju1qPCXM60WIKtrZjwrD6-imC3n-0oYPxMx-7PyX5Yz1AJ91r48JFFXGN4RXQ951z54e2yqi4EFTxPCPaW" alt="avatar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-container-max mx-auto px-gutter py-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="glass-card rounded-xl p-8 md:p-12 shadow-sm">
              <div className="flex items-center space-x-3 mb-12">
                <div className="h-2 rounded-full step-active transition-all duration-300"></div>
                <div className="h-2 rounded-full step-inactive"></div>
                <div className="h-2 rounded-full step-inactive"></div>
                <span className="ml-4 font-label-sm text-label-sm text-primary uppercase tracking-widest">Step 01: Identity</span>
              </div>
              <form className="space-y-10" onSubmit={onSubmit}>
                {error && <div className="text-error font-body-md mb-4">{error}</div>}
                <div className="group">
                  <label className="block font-label-md text-label-md text-outline mb-2 group-focus-within:text-primary transition-colors">Full Name</label>
                  <input className="w-full bg-transparent py-4 text-headline-md font-headline-md input-underline" placeholder="Cameron Williamson" type="text" name="username" value={formData.username} onChange={handleChange} />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-outline mb-2 group-focus-within:text-primary transition-colors">Email Address</label>
                  <input className="w-full bg-transparent py-4 text-headline-md font-headline-md input-underline" placeholder="cameron.w@billings.io" type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-outline mb-2 group-focus-within:text-primary transition-colors">Security Password</label>
                  <input className="w-full bg-transparent py-4 text-headline-md font-headline-md input-underline" placeholder="••••••••••••" type="password" name="password" value={formData.password} onChange={handleChange} />
                </div>
                <div className="pt-6 flex flex-col md:flex-row items-center gap-6">
                  <button className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-bold rounded-xl primary-glow transition-all duration-300 ease-out active:scale-95 text-body-lg" type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
                  <p className="text-on-surface-variant font-body-md">Already split with us? <button type="button" onClick={() => navigate('/login')} className="text-primary font-bold border-b border-primary/30 hover:border-primary transition-all bg-none border-none cursor-pointer">Sign in</button></p>
                </div>
              </form>
            </div>
            <div className="mt-12 flex justify-end">
              <div className="glass-card p-6 rounded-xl flex items-center space-x-4 max-w-xs transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary-container text-4xl" style={{fontVariationSettings: `"FILL" 1`}}>verified_user</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">Secure Vault</p>
                  <p className="font-label-sm text-label-sm text-outline">Bank-grade encryption for all your data.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-12 text-center lg:text-left relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/10 rounded-full blur-[100px] -z-10"></div>
            <h1 className="font-display-xl-mobile lg:font-display-xl text-display-xl-mobile lg:text-display-xl text-on-surface tracking-tighter">Start <span className="text-primary">Splitting</span> Smarter.</h1>
            <div className="flex flex-col items-center lg:items-start space-y-6">
              <div className="relative group cursor-pointer">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-dashed border-outline-variant group-hover:border-primary group-hover:bg-primary-container/5 transition-all duration-500 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary text-5xl mb-2 transition-colors">add_a_photo</span>
                  <span className="font-label-md text-label-md text-outline group-hover:text-primary transition-colors">Upload Avatar</span>
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(circle,rgba(70,72,212,0.4)_0%,transparent_70%)]"></div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-secondary-fixed text-on-secondary-fixed rounded-full flex items-center justify-center shadow-lg border-4 border-surface group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: `"FILL" 1`}}>face</span>
                </div>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-sm">A profile picture helps your friends find you in shared groups faster.</p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 bg-surface/90 backdrop-blur-xl z-[60] flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-500" id="successOverlay">
        <div className="text-center space-y-8 max-w-md p-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
            <span className="material-symbols-outlined text-white text-5xl" style={{fontVariationSettings: `"FILL" 1`}}>check_circle</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Welcome to BillSplit</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Redirecting to your personalized dashboard...</p>
        </div>
      </div>

    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import NotificationsDropdown from './NotificationsDropdown'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(()=>{
    function onDoc(e){
      if(ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return ()=> document.removeEventListener('click', onDoc)
  },[])

  return (
    <nav className="sticky top-0 w-full z-50 bg-surface/85 backdrop-blur-lg border-b border-primary/10 shadow-sm">
      <div className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto relative" ref={ref}>
        <Link to="/dashboard" className="font-headline-md text-headline-md font-bold text-primary tracking-tight">BillSplit</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md">Dashboard</Link>
          <Link to="/groups/1" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Groups</Link>
          <Link to="/notifications" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Notifications</Link>
          <Link to="/profile" className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md">Profile</Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e)=>{e.stopPropagation(); setOpen(v=>!v)}} className="relative p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          <Link to="/profile" className="w-10 h-10 rounded-full ring-2 ring-primary p-0.5 overflow-hidden">
            <img className="w-full h-full object-cover rounded-full" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhiKe6N5Nx9GXraAV1cLdXuGfrYHSaupGdA8T33fJUm18HpfLW6HsURpU3xrE7KjsSVWBrxpDBnL7zxl08EW4q1TEYwCWIVWVEACdTdHHur693znY_mxJStlB7mJTga-SpwwWHJcd0VaqEU35XFfdpS1F6AKf41Lh8-v2awhAJ5a-JRKnjmJiQLIE4uLjnfawnxz495vxxR2YbiBBP36YyidImUctzRuW8tv64bnBGhnyzBgAyeNsQekSvL8t45ymk3YUVd-9Afaya" />
          </Link>
        </div>
        {open && <div className="absolute top-full right-4 mt-2 z-[60]"><NotificationsDropdown/></div>}
      </div>
    </nav>
  )
}

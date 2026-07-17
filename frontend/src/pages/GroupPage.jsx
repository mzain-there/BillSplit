import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import MemberAvatar from '../components/MemberAvatar'
import ExpenseItem from '../components/ExpenseItem'

export default function GroupPage(){
  const [tab, setTab] = useState('expenses')
  useEffect(()=>{
    // initialize indicator logic could go here
  },[])

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="font-display-xl text-display-xl text-primary mb-4 leading-none">Summer Trip 2024</h1>
            <div className="flex items-center gap-6">
              <MemberAvatar images={["https://lh3.googleusercontent.com/aida-public/AB6AXuB7Ck7IoiZ3xqZF5YxYHokeI85fyG_-gFXiUKx1FI2Krdpwa05GURwrIhM88ZPv-kFX8l5aNN9FfPuseDaISAX5bqUBVaDHffECPVkdYon1NA98qXMFk4qk90VODyr_eG8GnOPO897qk4KxZ1LIe2sgdF5v1OyN3W3BcOTqvSkXquggSjGfo4HP1nzHOb65Jt32D5E3kbb18pPe6FhIvFJBQLuoV3ldGwbeJbxAqHw5jzh7gcuR4WnanUbCf96AMpHd2HWwHssyWypX"]} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="group flex items-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"><span className="material-symbols-outlined">mail</span>Invite via Gmail</button>
            <button className="flex items-center gap-2 px-6 py-4 glass-card text-primary rounded-xl font-bold border border-primary/20 transition-all duration-300 hover:bg-primary/5 active:scale-95"><span className="material-symbols-outlined">add</span>New Expense</button>
          </div>
        </header>

        <div className="relative flex border-b border-outline-variant/30 mb-12">
          <button className={`px-8 py-4 font-bold transition-colors ${tab==='expenses'?'text-primary':''}`} onClick={()=>setTab('expenses')}>Expenses</button>
          <button className={`px-8 py-4 font-bold transition-colors ${tab==='balances'?'text-primary':'text-on-surface-variant'}`} onClick={()=>setTab('balances')}>Balances</button>
          <button className={`px-8 py-4 font-bold transition-colors ${tab==='history'?'text-primary':'text-on-surface-variant'}`} onClick={()=>setTab('history')}>History</button>
        </div>

        {tab==='expenses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ExpenseItem date="July 12, 2024" title="Beachfront Villa Rent" paidBy="Marco" avatars={["https://via.placeholder.com/32","https://via.placeholder.com/32"]} amount="$1,200.00" color="primary" />
            <ExpenseItem date="July 13, 2024" title="Dinner at Ocean's Edge" paidBy="Sarah" avatars={["https://via.placeholder.com/32"]} amount="$342.50" color="secondary" />
            <ExpenseItem date="July 13, 2024" title="Boat Tour Rental" paidBy="You" avatars={["https://via.placeholder.com/32","https://via.placeholder.com/32","https://via.placeholder.com/32"]} amount="$450.00" color="tertiary" />
          </div>
        )}

        {tab==='balances' && (
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-outline-variant/20 p-4">
            <div className="p-gutter flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 w-full md:w-64">
                <img alt="Member" className="w-12 h-12 rounded-full" src="https://via.placeholder.com/48" />
                <div>
                  <span className="font-bold text-on-surface block">Marco Rossi</span>
                  <span className="text-label-sm text-secondary">Owes $420.00</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden"><div className="h-full bg-secondary w-[65%] rounded-full"></div></div>
                <div className="flex justify-between mt-2"><span className="text-label-sm text-outline">Paid $800.00</span><span className="text-label-sm text-outline">Target $1,220.00</span></div>
              </div>
            </div>
          </div>
        )}

        {tab==='history' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex gap-6 items-start relative pb-8 before:content-[''] before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-[2px] before:bg-outline-variant/30">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center z-10"><div className="w-2 h-2 rounded-full bg-primary"/></div>
              <div><p className="text-body-md text-on-surface"><span className="font-bold">Marco Rossi</span> added "Beachfront Villa Rent"</p><p className="text-label-sm text-outline">2 hours ago</p></div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

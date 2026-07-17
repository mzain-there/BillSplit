import React from 'react'
import Navbar from '../components/Navbar'
import SummaryCard from '../components/SummaryCard'
import GroupCard from '../components/GroupCard'

export default function Dashboard(){
  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-8 py-12 md:py-20">
        <header className="mb-12">
          <h1 className="font-clash text-display-xl-mobile md:text-display-xl text-on-surface leading-tight tracking-tight">Good morning, Zain 👋</h1>
          <p className="text-on-surface-variant font-body-lg mt-4 max-w-2xl">You're currently in a positive net position. Two groups have pending settle-ups.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <SummaryCard label="Receivable" title="You Are Owed" amount="$1,240.50" icon={<span className="material-symbols-outlined">trending_up</span>} />
          <SummaryCard label="Payable" title="You Owe" amount="$432.10" icon={<span className="material-symbols-outlined">trending_down</span>} />
          <SummaryCard label="Net Worth" title="Net Balance" amount="$808.40" icon={<span className="material-symbols-outlined">account_balance_wallet</span>} variant="primary" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-headline-md text-headline-md">My Groups</h2>
              <button className="text-primary font-label-md hover:underline">View all groups</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GroupCard image="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkcNGRF67yiIwGvtzwWUtP2s9r7OhAXNnyslZyIFwXKlkuurTtaYuq4R4fpJk1wdqfo-nur5ktCyxuYqns62xY9y8XTZIMCg-JKc8i1-vKGc6-GDzt4mIbvJbJjFBNSg0GZEc9E7pWslN7AihVmy0KOR6-0QEEMqXyo8gURTkN0caKQ2bbLDrtcYzrOqVKXgaZCp3LGtXpU91DQ5xCYbk-EYtj4_echHWTb68Cinq6LSIR_4DIGFskmpZf0m8Zi_sW0r-Q-jU-k0N" title="The Lofties" membersText="4 members active" amount="$340.00" variant="owed" />
              <GroupCard image="https://lh3.googleusercontent.com/aida-public/AB6AXuDN1sAEJaHMOLO7bhbG5mDwZKwaXglBnXITz1JoLnWXHPL4vj032h9Rf6fZo1A80cO7J3RgiNAja1eqbhlJPv5F7eUIAx3C1drmo4MLTlrvGCl2X6iz-hxayBBw_e24AHNflsJ90KcpNc0FZRYgFzC3zvw5i2dJPnRPoBrGGXtjrFAbz5bSX4rAzS1D_vL_WWE9eai4kL1gTyCnM5Btn2bTKVJR9Qr3y_3C2bCF3jOcYRwMd7rqodH6uPPNthUuh1W4zMLbNSM_hTU5" title="Bali Trip 2024" membersText="6 members active" amount="$112.50" variant="owe" />
              <GroupCard image="https://lh3.googleusercontent.com/aida-public/AB6AXuDd9CBWG-QqtFPXrqwLvyDlqKsr8VLCnp6wjB_sx9c7Wei-heE8BQzlZ1HXXFTc6_wDbjHWsIWBSfLwoCnWQGd_-xY8jftsZ2CLayIteEmbTVIPeN8iEOn9rcH54msA-tlzwfvc4pYwsert5BkrL2SUVHKLXXhMUc1FPxhVTdj0qq6Z-WC_1kCe7TEXJcbWcXkVgQC2bUD6I_WPy2Xw4krMCNHY2aA4yWxZCiFj8t6Kr1BpCk18I4wHDW1hY0N59vLaCHaoj6bOG1iW" title="Dinner Club" membersText="8 members active" amount="$0.00" variant="settled" />
              <div className="border-2 border-dashed border-outline-variant/50 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all cursor-pointer group">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                <span className="font-label-md">Create New Group</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-end mb-8">
              <h2 className="font-headline-md text-headline-md">Recent Activity</h2>
            </div>
            <div className="relative pl-8 space-y-10">
              <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-outline-variant/30"></div>
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-background"></div>
                <div className="glass-card p-5 rounded-xl">
                  <p className="font-body-md text-on-surface mb-2"><span className="font-bold">You</span> added "Grocery Run" in <span className="text-primary font-medium">The Lofties</span></p>
                  <div className="flex justify-between items-center"><span className="text-secondary font-clash">+$45.20</span><span className="text-on-surface-variant text-[12px]">2 hours ago</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

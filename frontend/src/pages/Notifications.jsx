import React from 'react'
import Navbar from '../components/Navbar'

const notifications = [
  { id: 1, title: 'You were added to The Lofties', description: 'Sam invited you to join the group.' },
  { id: 2, title: 'Payment requested', description: 'Marco requested $24.50 for dinner.' },
  { id: 3, title: 'New expense settled', description: 'Your split for Bali Trip 2024 is complete.' },
]

export default function Notifications(){
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-gutter py-12 md:py-20">
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-xl border border-primary/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="font-headline-md text-headline-md">Notifications</h1>
              <p className="text-on-surface-variant mt-2">Review recent activity and requests in one place.</p>
            </div>
            <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold hover:scale-[1.02] active:scale-95 transition-all">Mark all as read</button>
          </div>
          <div className="space-y-4">
            {notifications.map(note => (
              <div key={note.id} className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/50 hover:bg-surface-container transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-on-surface mb-2">{note.title}</h2>
                    <p className="text-label-md text-on-surface-variant">{note.description}</p>
                  </div>
                  <span className="text-label-sm text-primary">New</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

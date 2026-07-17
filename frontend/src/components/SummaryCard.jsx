import React from 'react'

export default function SummaryCard({icon, label, title, amount, variant='neutral'}){
  return (
    <div className={`glass-card p-8 rounded-xl glow-indigo transition-all duration-300 hover:-translate-y-1 ${variant==='primary' ? 'bg-primary/5' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">{icon}</div>
        <span className="font-label-sm text-secondary uppercase tracking-wider">{label}</span>
      </div>
      <h3 className="font-label-md text-on-surface-variant mb-1">{title}</h3>
      <div className="font-clash text-headline-lg text-secondary">{amount}</div>
    </div>
  )
}

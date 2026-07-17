import React from 'react'

export default function AddExpenseModal({open=true, onClose=()=>{}}){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center overflow-hidden">
      <div className="absolute inset-0 bg-surface/40 backdrop-blur-2xl transition-opacity duration-500" onClick={onClose}></div>
      <div className="relative w-full h-full flex flex-col max-w-3xl mx-auto px-6 py-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-12">
          <button className="w-12 h-12 flex items-center justify-center rounded-full glass-card hover:scale-105 transition-transform" onClick={onClose}>
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
          <span className="font-headline-md text-headline-md">Add Expense</span>
          <div className="w-12" />
        </div>
        <div className="flex flex-col items-center mb-16">
          <div className="text-on-surface-variant font-label-md text-label-md mb-4 uppercase tracking-widest">Amount</div>
          <div className="flex items-center gap-4">
            <span className="font-display-xl text-display-xl text-on-surface/30">$</span>
            <input autoFocus className="bg-transparent border-none text-center font-display-xl text-display-xl w-full max-w-[400px] focus:ring-0 placeholder:text-on-surface-variant/20 outline-none" placeholder="0.00" type="text" />
          </div>
          <input className="mt-8 text-center bg-transparent border-b border-outline-variant/40 py-2 font-headline-md text-headline-md w-full max-w-[320px] focus:border-primary transition-colors focus:ring-0 placeholder:text-on-surface-variant/40" placeholder="What was it for?" type="text" />
        </div>
        <div className="mb-12">
          <h4 className="font-label-md text-label-md mb-6 text-on-surface-variant text-center uppercase tracking-widest">Paid By</h4>
        </div>
        <div className="mt-auto pb-8">
          <button className="w-full bg-primary text-on-primary py-6 rounded-2xl font-headline-md text-headline-md flex items-center justify-center gap-3 primary-glow hover:scale-[1.02] active:scale-95 transition-all duration-300">Split Bill <span className="material-symbols-outlined">arrow_forward</span></button>
        </div>
      </div>
    </div>
  )
}

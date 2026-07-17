import React from 'react'

export default function ExpenseItem({date, title, paidBy, avatars = [], amount, color='primary'}){
  return (
    <div className={`glass-card expense-card-hover p-gutter rounded-xl border-l-[6px] border-l-${color} transition-all duration-300 cursor-pointer`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-label-sm text-outline uppercase tracking-wider block mb-1">{date}</span>
          <h3 className="font-headline-md text-on-surface">{title}</h3>
        </div>
        <div className="p-2 rounded-lg">
          <span className="material-symbols-outlined">receipt_long</span>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-body-md text-on-surface-variant mb-1">Paid by <span className="font-bold">{paidBy}</span></p>
          <div className="flex -space-x-2">
            {avatars.map((a,i)=>(<div key={i} className="w-6 h-6 rounded-full border border-white" style={{backgroundImage:`url(${a})`,backgroundSize:'cover'}} />))}
          </div>
        </div>
        <div className="text-right">
          <span className="block text-label-sm text-outline">Amount</span>
          <span className={`text-headline-md font-bold text-${color}`}>{amount}</span>
        </div>
      </div>
    </div>
  )
}

import React from 'react'

export default function GroupCard({image, title, membersText, amount, variant}){
  return (
    <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl overflow-hidden">
          <img className="w-full h-full object-cover" alt={title} src={image} />
        </div>
        <div>
          <h4 className="font-headline-md text-body-lg font-bold">{title}</h4>
          <p className="font-label-sm text-on-surface-variant">{membersText}</p>
        </div>
      </div>
      <div className={`flex justify-between items-center px-4 py-3 rounded-lg ${variant==='owed' ? 'bg-secondary-container/20' : variant==='owe' ? 'bg-error-container/20' : 'bg-surface-container-highest'}`}>
        <span className="font-label-md text-on-secondary-container">{variant==='owed' ? 'Owes you' : variant==='owe' ? 'You owe' : 'Settled up'}</span>
        <span className={`font-clash text-body-lg ${variant==='owe' ? 'text-error' : 'text-secondary'}`}>{amount}</span>
      </div>
    </div>
  )
}

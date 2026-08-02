import React from 'react'

export default function ExpenseItem({
  date,
  title,
  paidBy,
  avatars = [],
  amount,
  color = 'primary',
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <div className={`glass-card expense-card-hover p-gutter rounded-xl border-l-[6px] border-l-${color} transition-all duration-300`}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 block text-label-sm uppercase tracking-wider text-outline">{date}</span>
          <h3 className="font-headline-md text-on-surface">{title}</h3>
        </div>
        <div className="rounded-lg p-2">
          <span className="material-symbols-outlined">receipt_long</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-body-md text-on-surface-variant">
            Paid by <span className="font-bold">{paidBy}</span>
          </p>
          <div className="flex -space-x-2">
            {avatars.map((a, i) => (
              <div key={i} className="h-6 w-6 rounded-full border border-white" style={{ backgroundImage: `url(${a})`, backgroundSize: 'cover' }} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className="block text-label-sm text-outline">Amount</span>
          <span className={`text-headline-md font-bold text-${color}`}>{amount}</span>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="rounded-lg border border-outline-variant/40 px-3 py-2 text-sm font-semibold" onClick={onEdit} type="button">
          Edit
        </button>
        <button className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500" onClick={onDelete} type="button">
          Delete
        </button>
      </div>
    </div>
  )
}

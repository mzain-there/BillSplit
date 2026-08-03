import React from 'react'

export default function ExpenseItem({
  date,
  title,
  paidBy,
  avatars = [],
  amount,
  color = 'primary',
  isSettled = false,
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <div className={`glass-card expense-card-hover p-gutter rounded-xl border-l-[6px] border-l-${color} transition-all duration-300`}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="block text-label-sm uppercase tracking-wider text-outline">{date}</span>
            {isSettled && (
              <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                Settled
              </span>
            )}
          </div>
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

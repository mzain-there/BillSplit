import React from 'react'

export default function BalanceBadge({amount}){
  const positive = typeof amount === 'number' ? amount >= 0 : String(amount).includes('+')
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${positive? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {amount}
    </span>
  )
}

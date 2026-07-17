import React from 'react'

export default function NotificationsDropdown(){
  const items = [
    {id:1, text:'You were added to Group: Weekend Trip'},
    {id:2, text:'Sam requested $24 from you'},
  ]
  return (
    <div className="w-80 bg-white rounded-xl shadow-lg glass-card p-4">
      <h4 className="font-bold mb-2">Notifications</h4>
      <div className="space-y-2 max-h-60 overflow-auto">
        {items.map(it=> (
          <div key={it.id} className="text-sm text-on-surface p-2 rounded hover:bg-surface-container-low transition-colors">{it.text}</div>
        ))}
        {items.length===0 && <div className="text-sm text-on-surface-variant">No new notifications</div>}
      </div>
    </div>
  )
}

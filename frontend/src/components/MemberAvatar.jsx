import React from 'react'

export default function MemberAvatar({images=[]}){
  return (
    <div className="flex -space-x-3">
      {images.map((src,i)=> (
        <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden ring-1 ring-primary/10" style={{zIndex:images.length - i}}>
          <img src={src} alt={`member-${i}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}

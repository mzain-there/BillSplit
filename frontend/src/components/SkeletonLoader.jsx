import React from 'react'

export default function SkeletonLoader({className=''}){
  return (
    <div className={`animate-pulse bg-surface-container-lowest rounded-md ${className}`} />
  )
}

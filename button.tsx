'use client';
import React from 'react';
export function Button({children, className='', variant='default', size='md', ...props}: any){
  const base = 'inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium shadow-sm transition';
  const variants: Record<string,string> = {
    default: 'bg-zinc-900 text-white hover:bg-zinc-800',
    outline: 'border border-zinc-300 bg-white hover:bg-zinc-50',
    ghost: 'hover:bg-zinc-100',
  };
  const sizes: Record<string,string> = { sm:'px-2 py-1 text-xs', md:'px-3 py-2', lg:'px-4 py-2.5', icon:'p-2' };
  return <button className={`${base} ${variants[variant]||variants.default} ${sizes[size]||''} ${className}`} {...props}>{children}</button>;
}

import React from 'react';
export function Badge({children, variant='default', className=''}: any){
  const variants: any = {
    default: 'bg-zinc-900 text-white',
    secondary: 'bg-zinc-100 text-zinc-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${variants[variant]} ${className}`}>{children}</span>;
}

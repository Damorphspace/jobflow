'use client';
import React from 'react';
export function Checkbox({checked=false, onCheckedChange=()=>{}, className='', ...props}: any){
  return (
    <input type="checkbox" checked={checked} onChange={(e)=> onCheckedChange(e.target.checked)} className={`h-4 w-4 rounded border ${className}`} {...props}/>
  );
}

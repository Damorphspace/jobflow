'use client';
import React from 'react';
export function Toggle({pressed=false, onPressedChange=()=>{}, children, className=''}: any){
  return <button onClick={()=> onPressedChange(!pressed)} className={`h-9 rounded-md border px-3 ${pressed?'bg-zinc-900 text-white':'bg-white'} ${className}`}>{children}</button>;
}

'use client';
import React, {useState} from 'react';
export function Tabs({defaultValue, children, className=''}: any){ return <div className={className}>{children}</div>; }
export function TabsList({children, className=''}: any){ return <div className={`inline-flex rounded-xl border bg-white p-1 ${className}`}>{children}</div>; }
export function TabsTrigger({children, value, active, onClick, className=''}: any){
  return <button onClick={onClick} className={`px-3 py-1.5 text-sm rounded-lg ${active?'bg-zinc-900 text-white':'text-zinc-700 hover:bg-zinc-100'} ${className}`}>{children}</button>;
}
export function TabsContent({children, hidden}: any){ return hidden? null : <div className="mt-4">{children}</div>; }

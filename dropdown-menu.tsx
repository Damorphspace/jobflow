'use client';
import React, {useState, useRef, useEffect} from 'react';
export function DropdownMenu({children}: any){ return <div className="relative inline-block">{children}</div>; }
export function DropdownMenuTrigger({asChild, children}: any){ return children; }
export function DropdownMenuContent({children, align='start'}: any){ return <div className={`absolute z-40 mt-2 w-48 rounded-xl border bg-white p-1 shadow`}>{children}</div>; }
export function DropdownMenuItem({children, onClick}: any){ return <button onClick={onClick} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-zinc-100">{children}</button>; }
export function DropdownMenuLabel({children}: any){ return <div className="px-3 py-2 text-xs uppercase text-zinc-500">{children}</div>; }
export function DropdownMenuSeparator(){ return <div className="my-1 h-px bg-zinc-200" />; }

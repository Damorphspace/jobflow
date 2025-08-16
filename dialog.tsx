'use client';
import React from 'react';
export function Dialog({open, onOpenChange, children}: any){ return open? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={()=> onOpenChange?.(false)}>{children}</div>: null; }
export function DialogContent({children, className=''}: any){ return <div onClick={(e)=> e.stopPropagation()} className={`max-h-[90vh] overflow-auto rounded-2xl bg-white p-4 shadow-xl w-[90vw] max-w-3xl ${className}`}>{children}</div>; }
export function DialogHeader({children}: any){ return <div className="mb-2">{children}</div>; }
export function DialogTitle({children, className=''}: any){ return <div className={`text-lg font-semibold ${className}`}>{children}</div>; }
export function DialogDescription({children, className=''}: any){ return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>; }
export function DialogTrigger({children}: any){ return children; }
export function DialogFooter({children}: any){ return <div className="mt-4 flex justify-end gap-2">{children}</div>; }

import React from 'react';
export function Card({children, className=''}: any){ return <div className={`bg-white border rounded-2xl ${className}`}>{children}</div>; }
export function CardHeader({children, className=''}: any){ return <div className={`p-4 border-b ${className}`}>{children}</div>; }
export function CardTitle({children, className=''}: any){ return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>; }
export function CardDescription({children, className=''}: any){ return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>; }
export function CardContent({children, className=''}: any){ return <div className={`p-4 ${className}`}>{children}</div>; }

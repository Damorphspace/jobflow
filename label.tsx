import React from 'react';
export function Label({children, className='', ...props}: any){ return <label className={`text-sm font-medium ${className}`} {...props}>{children}</label>; }

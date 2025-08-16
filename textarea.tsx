import React from 'react';
export function Textarea({className='', ...props}: any){ return <textarea {...props} className={`rounded-md border px-3 py-2 ${className}`} />; }

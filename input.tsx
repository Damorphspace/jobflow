import React from 'react';
export function Input(props: any){ return <input {...props} className={`h-9 rounded-md border px-3 ${props.className||''}`} />; }

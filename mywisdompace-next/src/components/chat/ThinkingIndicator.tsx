'use client';

import React from 'react';

export function ThinkingIndicator() {
  return (
    <div className="flex gap-3 animate-fadeIn">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm">
        ✨
      </div>
      <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

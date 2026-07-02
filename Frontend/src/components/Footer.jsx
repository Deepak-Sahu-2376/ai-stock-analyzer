import React from 'react';

export default function Footer({ setTab }) {
  return (
    <footer className="order-4 hidden md:block bg-white border-t border-border-subtle mt-auto py-4">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2">
          {/* Logo image on left */}
          <img 
            alt="Stock Island Logo" 
            className="h-5 w-auto object-contain opacity-75"
            src="/Stock_Island.svg"
          />
          <span className="font-body-md text-xs text-on-surface-variant">
            © 2026 Stock Island. All rights reserved.
          </span>
        </div>
        <div className="flex gap-6 text-xs font-body-md">
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            Help Center
          </a>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SubscriptionBadge } from '../subscription';

interface MobileNavProps {
  currentPage: 'dashboard' | 'upload' | 'settings' | 'episode' | 'schedule-tweet' | 'subscription';
}

export function MobileNav({ currentPage }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Publications', href: '/schedule-tweet' },
    { name: 'Réglages', href: '/settings' },
  ];

  return (
    <div className="md:hidden">
      {/* Bouton de menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Menu mobile */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  currentPage === item.href.slice(1) || 
                  (item.href === '/dashboard' && currentPage === 'dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            
            {/* Badge d'abonnement dans le menu mobile */}
            <div className="px-3 py-2">
              <SubscriptionBadge />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

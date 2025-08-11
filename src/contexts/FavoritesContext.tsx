"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoritesCount: number;
  refreshFavoritesCount: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);

  const refreshFavoritesCount = useCallback(async () => {
    try {
      if (user) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setFavoritesCount(0);
          return;
        }
        const resp = await fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          const count = Array.isArray(data.favorites) ? data.favorites.length : 0;
          setFavoritesCount(count);
        } else {
          setFavoritesCount(0);
        }
      } else {
        const saved = localStorage.getItem('favorites');
        if (saved) {
          try {
            const arr = JSON.parse(saved);
            setFavoritesCount(Array.isArray(arr) ? arr.length : 0);
          } catch {
            setFavoritesCount(0);
          }
        } else {
          setFavoritesCount(0);
        }
      }
    } catch {
      setFavoritesCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshFavoritesCount();
  }, [refreshFavoritesCount]);

  useEffect(() => {
    const onFavsUpdated = (e: Event) => {
      const ce = e as CustomEvent;
      const next = ce?.detail?.count;
      if (typeof next === 'number') {
        // Defer state update to avoid updating during another component's render
        setTimeout(() => setFavoritesCount(next), 0);
      } else {
        // Fallback to refetch if no count provided
        setTimeout(() => { void refreshFavoritesCount(); }, 0);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        setTimeout(() => { void refreshFavoritesCount(); }, 0);
      }
    };
    window.addEventListener('favorites-updated', onFavsUpdated as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('favorites-updated', onFavsUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshFavoritesCount]);

  return (
    <FavoritesContext.Provider value={{ favoritesCount, refreshFavoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}

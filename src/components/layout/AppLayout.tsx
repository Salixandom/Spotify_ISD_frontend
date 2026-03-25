import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomPlayer } from './BottomPlayer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Toaster } from 'react-hot-toast';

export const AppLayout: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-spotify-black overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <div className="flex flex-1 gap-2 p-2 overflow-hidden">
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 bg-spotify-surface rounded-lg overflow-hidden
                          flex flex-col">
          <Navbar />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomPlayer />
    </div>
  );
};

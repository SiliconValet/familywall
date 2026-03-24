import { useState } from 'react';
import { FamilyList } from './components/FamilyList';
import { CalendarView } from './components/calendar/CalendarView';
import { CalendarSettings } from './components/calendar/CalendarSettings';
import { ChessPage } from './components/chess/ChessPage';
import { Button } from './components/ui/button';
import { KeyboardProvider } from './context/KeyboardContext';
import { VirtualKeyboard } from './components/VirtualKeyboard';

export default function App() {
  const [view, setView] = useState<'calendar' | 'chess' | 'settings'>('calendar');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <KeyboardProvider>
      <main className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="flex gap-2 p-4">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              className="min-h-12"
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
            <Button
              variant={view === 'chess' ? 'default' : 'outline'}
              className="min-h-12"
              onClick={() => setView('chess')}
            >
              Chess
            </Button>
            <Button
              variant={view === 'settings' ? 'default' : 'outline'}
              className="min-h-12"
              onClick={() => setView('settings')}
            >
              Settings
            </Button>
          </div>
        </nav>
        {view === 'calendar' && <CalendarView onOpenSettings={() => setSettingsOpen(true)} />}
        {view === 'chess' && <ChessPage />}
        {view === 'settings' && <FamilyList />}
        <CalendarSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </main>
      <VirtualKeyboard />
    </KeyboardProvider>
  );
}

import { useState } from 'react';
import { ChoreList } from './components/ChoreList';
import { FamilyList } from './components/FamilyList';
import { Button } from './components/ui/button';

export default function App() {
  const [view, setView] = useState<'chores' | 'family'>('chores');

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="flex gap-2 p-4">
          <Button
            variant={view === 'chores' ? 'default' : 'outline'}
            className="min-h-12"
            onClick={() => setView('chores')}
          >
            Chores
          </Button>
          <Button
            variant={view === 'family' ? 'default' : 'outline'}
            className="min-h-12"
            onClick={() => setView('family')}
          >
            Family
          </Button>
        </div>
      </nav>
      {view === 'chores' ? <ChoreList /> : <FamilyList />}
    </main>
  );
}

import { Layers } from 'lucide-react';

export function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-neutral-300" aria-hidden="true" />
        <h1 className="text-xl font-semibold tracking-tight">FRAME</h1>
      </div>
    </main>
  );
}

export default App;

import { useState } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <LanguageProvider>
      <main className="min-h-screen p-4">
        {user ? <Dashboard /> : <AuthForm onAuth={setUser} />}
      </main>
    </LanguageProvider>
  );
}

import { useState } from 'react';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { t, language } = useLanguage();

  const submit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
    const { data } = await api.post(endpoint, { ...form, language });
    localStorage.setItem('token', data.token);
    onAuth(data.user);
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow space-y-3">
      <h2 className="text-2xl font-bold text-emerald-600">{mode === 'login' ? t.login : t.signup}</h2>
      {mode === 'signup' && (
        <input className="w-full border p-2 rounded" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      )}
      <input className="w-full border p-2 rounded" placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full bg-emerald-500 text-white p-2 rounded">{mode === 'login' ? t.login : t.signup}</button>
      <button type="button" className="text-sm text-charcoal underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? t.signup : t.login}
      </button>
    </form>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Bell, ShoppingCart, ScanLine, Trash2, PlusCircle, Languages } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

const tabs = ['dashboard', 'inventory', 'shoppingList', 'notifications', 'recipes'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState({ urgent: [], soon: [], safe: [], chart: [], recipes: [] });
  const [items, setItems] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [scanner, setScanner] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'fridge', expiry_date: '' });
  const { t, language, setLanguage, isRtl } = useLanguage();

  const refresh = async () => {
    const [d, i, s, n] = await Promise.all([
      api.get('/dashboard'),
      api.get('/inventory'),
      api.get('/shopping-list'),
      api.get('/notifications')
    ]);
    setDashboard(d.data);
    setItems(i.data);
    setShopping(s.data);
    setNotifications(n.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/inventory', form);
    setForm({ name: '', category: 'fridge', expiry_date: '' });
    refresh();
  };

  const finishItem = async (id) => {
    await api.post(`/inventory/${id}/finish`);
    refresh();
  };

  const deleteItem = async (id) => {
    await api.delete(`/inventory/${id}`);
    refresh();
  };

  const sections = useMemo(() => [
    { title: t.urgent, color: 'bg-red-100', items: dashboard.urgent },
    { title: t.soon, color: 'bg-yellow-100', items: dashboard.soon },
    { title: t.safe, color: 'bg-green-100', items: dashboard.safe }
  ], [dashboard, t]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-emerald-600 text-white p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.app}</h1>
          <p>{t.subtitle}</p>
        </div>
        <button className="flex gap-2 items-center bg-white/20 px-3 py-2 rounded" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}><Languages size={16}/> {language.toUpperCase()}</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 rounded-full ${activeTab===tab ? 'bg-emerald-500 text-white':'bg-white'}`}>{t[tab]}</button>)}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboard.chart} dataKey="value" nameKey="name" outerRadius={100}>
                  {dashboard.chart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.title} className={`${section.color} rounded-xl p-3`}>
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm">{section.items.length} item(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white p-4 rounded-2xl shadow space-y-4">
          <form onSubmit={handleAdd} className="grid md:grid-cols-4 gap-2">
            <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="border p-2 rounded" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="fridge">Fridge</option><option value="pantry">Pantry</option><option value="pharmacy">Pharmacy</option>
            </select>
            <input className="border p-2 rounded" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            <button className="bg-emerald-500 text-white rounded p-2 flex items-center justify-center gap-2"><PlusCircle size={16}/> Add</button>
          </form>
          <button className="border px-3 py-2 rounded flex items-center gap-2" onClick={() => setScanner(!scanner)}><ScanLine size={16}/> {scanner ? 'Stop Scanner' : 'Scan Barcode'}</button>
          {scanner && <BarcodeScannerComponent width={500} height={300} onUpdate={async (_, result) => {
            if (result?.text) {
              const { data } = await api.get(`/inventory/barcode/${result.text}`);
              setForm((prev) => ({ ...prev, name: data.name, category: data.category }));
              setScanner(false);
            }
          }} />}

          {items.length === 0 ? <div className="text-center p-8 text-gray-500">{t.empty}</div> : items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm">{item.category} • {item.expiry_date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => finishItem(item.id)} className="px-2 py-1 bg-emerald-100 rounded"><ShoppingCart size={16}/></button>
                <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-red-100 rounded"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'shoppingList' && <div className="bg-white rounded-2xl p-4 shadow space-y-2">{shopping.map((s) => <div key={s.id}>{s.item_name} ({s.reason})</div>)}</div>}
      {activeTab === 'notifications' && <div className="bg-white rounded-2xl p-4 shadow space-y-2">{notifications.map((n) => <div key={n.id} className="flex items-center gap-2"><Bell size={14}/>{n.message}</div>)}</div>}
      {activeTab === 'recipes' && <div className="bg-white rounded-2xl p-4 shadow space-y-4">{dashboard.recipes.map((r) => <div key={r.title}><h3 className="font-semibold">{r.title}</h3><ul className="list-disc ps-5">{r.steps.map((s) => <li key={s}>{s}</li>)}</ul></div>)}</div>}
    </div>
  );
}

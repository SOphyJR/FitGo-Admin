import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://fitgo-backend-production-03ee.up.railway.app/api';

type Tab = 'overview' | 'users' | 'products' | 'orders' | 'stores';

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approveEmail, setApproveEmail] = useState('');
  const [approveMsg, setApproveMsg] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, p, s] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/products`),
        axios.get(`${API}/stores`),
      ]);
      setUsers(u.data);
      setProducts(p.data);
      setStores(s.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const approveSeller = async () => {
    try {
      const res = await axios.post(`${API}/auth/approve-seller`, { email: approveEmail });
      setApproveMsg('✅ ' + res.data.message);
      fetchAll();
    } catch (e: any) {
      setApproveMsg('❌ ' + (e.response?.data?.error || 'Failed'));
    }
  };

  const deleteUser = async (firebase_uid: string) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`${API}/users/${firebase_uid}`);
    fetchAll();
  };

  const customers = users.filter(u => u.role === 'customer');
  const sellers = users.filter(u => u.role === 'seller');
  const drivers = users.filter(u => u.role === 'driver');
  const pending = users.filter(u => u.status === 'pending');

  return (
    <div style={s.app}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          <span style={{ color: '#FF3C2E' }}>●</span> FitGo Admin
        </div>
        {(['overview','users','stores','products','orders'] as Tab[]).map(t => (
          <div key={t} style={{ ...s.navItem, ...(tab===t ? s.navActive : {}) }} onClick={() => setTab(t)}>
            {t === 'overview' && '📊'} {t === 'users' && '👥'} {t === 'stores' && '🏪'}
            {t === 'products' && '📦'} {t === 'orders' && '🛒'}
            {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
        <div style={s.navItem} onClick={fetchAll}>🔄 Refresh</div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.header}>
          <h1 style={s.pageTitle}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </h1>
          <span style={s.badge}>{loading ? 'Loading...' : 'Live'}</span>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={s.statsGrid}>
              {[
                { label: 'Total Users', value: users.length, emoji: '👥', color: '#3b82f6' },
                { label: 'Customers', value: customers.length, emoji: '🛍️', color: '#8b5cf6' },
                { label: 'Sellers', value: sellers.length, emoji: '🏪', color: '#f59e0b' },
                { label: 'Drivers', value: drivers.length, emoji: '🛵', color: '#10b981' },
                { label: 'Pending Approval', value: pending.length, emoji: '⏳', color: '#FF3C2E' },
                { label: 'Products', value: products.length, emoji: '📦', color: '#06b6d4' },
              ].map(stat => (
                <div key={stat.label} style={{ ...s.statCard, borderLeft: `4px solid ${stat.color}` }}>
                  <div style={s.statEmoji}>{stat.emoji}</div>
                  <div style={s.statNum}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Approve Seller */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>🔓 Approve Seller / Driver</h2>
              <div style={s.row}>
                <input
                  style={s.input}
                  placeholder="Enter email to approve..."
                  value={approveEmail}
                  onChange={e => setApproveEmail(e.target.value)}
                />
                <button style={s.btn} onClick={approveSeller}>Approve</button>
              </div>
              {approveMsg && <div style={s.msg}>{approveMsg}</div>}
            </div>

            {/* Pending users */}
            {pending.length > 0 && (
              <div style={s.card}>
                <h2 style={s.cardTitle}>⏳ Pending Approvals ({pending.length})</h2>
                {pending.map(u => (
                  <div key={u.id} style={s.tableRow}>
                    <span style={s.name}>{u.name}</span>
                    <span style={s.email}>{u.email}</span>
                    <span style={{ ...s.roleBadge, background: '#fef3c7', color: '#d97706' }}>{u.role}</span>
                    <button style={s.btnSm} onClick={() => { setApproveEmail(u.email); setTab('overview'); }}>
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>All Users ({users.length})</h2>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>{u.name}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>{u.phone || '-'}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: u.role === 'seller' ? '#fef3c7' : u.role === 'driver' ? '#d1fae5' : '#ede9fe',
                        color: u.role === 'seller' ? '#d97706' : u.role === 'driver' ? '#059669' : '#7c3aed'
                      }}>{u.role}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: u.status === 'approved' || u.status === 'active' ? '#d1fae5' : '#fee2e2',
                        color: u.status === 'approved' || u.status === 'active' ? '#059669' : '#dc2626'
                      }}>{u.status}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnDanger} onClick={() => deleteUser(u.firebase_uid)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STORES */}
        {tab === 'stores' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>All Stores ({stores.length})</h2>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Store Name</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Owner</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(st => (
                  <tr key={st.id} style={s.tr}>
                    <td style={s.td}><b>{st.name}</b></td>
                    <td style={s.td}>{st.location || '-'}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: st.status === 'approved' ? '#d1fae5' : '#fee2e2',
                        color: st.status === 'approved' ? '#059669' : '#dc2626'
                      }}>{st.status}</span>
                    </td>
                    <td style={s.td}>{st.owner_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>All Products ({products.length})</h2>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Image</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Store</th>
                  <th style={s.th}>Available</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={s.tr}>
                    <td style={s.td}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        : <span style={{ fontSize: 24 }}>{p.emoji}</span>
                      }
                    </td>
                    <td style={s.td}><b>{p.name}</b></td>
                    <td style={s.td}>ETB {parseFloat(p.price).toLocaleString()}</td>
                    <td style={s.td}>{p.category}</td>
                    <td style={s.td}>{p.store_name}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.roleBadge,
                        background: p.available ? '#d1fae5' : '#fee2e2',
                        color: p.available ? '#059669' : '#dc2626'
                      }}>{p.available ? 'Yes' : 'No'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>All Orders</h2>
            <p style={{ color: '#888', fontSize: 14 }}>Orders will appear here as customers place them.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const s: Record<string, React.CSSProperties> = {
  app: { display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc' },
  sidebar: { width: 220, background: '#0A0A0A', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 4 },
  logo: { color: '#fff', fontWeight: 900, fontSize: 18, padding: '0 20px 24px', letterSpacing: 1 },
  navItem: { color: 'rgba(255,255,255,0.6)', padding: '10px 20px', cursor: 'pointer', borderRadius: 8, margin: '0 8px', textTransform: 'capitalize', fontSize: 14 },
  navActive: { background: 'rgba(255,60,46,0.15)', color: '#FF3C2E', fontWeight: 600 },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  pageTitle: { margin: 0, fontSize: 24, fontWeight: 800, color: '#0A0A0A' },
  badge: { background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statNum: { fontSize: 32, fontWeight: 900, color: '#0A0A0A' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  card: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A0A0A' },
  row: { display: 'flex', gap: 10 },
  input: { flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' },
  btn: { background: '#FF3C2E', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  btnSm: { background: '#FF3C2E', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 12 },
  btnDanger: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 12 },
  msg: { marginTop: 10, fontSize: 13, fontWeight: 500 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: 13, color: '#0A0A0A', verticalAlign: 'middle' },
  tableRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  name: { fontWeight: 600, fontSize: 14, flex: 1 },
  email: { color: '#888', fontSize: 13, flex: 2 },
  roleBadge: { padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600 },
};
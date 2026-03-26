import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler);

const API_BASE_URL = 'http://localhost:8000';

// Generate sample historical data for demo
const generateSampleData = () => {
  const data = [];
  for (let i = 30; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      ds: date.toISOString().split('T')[0],
      y: Math.floor(Math.random() * 150 + 200),
      temperature: Math.floor(Math.random() * 10 + 25),
      is_event: Math.random() > 0.8 ? 1 : 0
    });
  }
  return data;
};

function Dashboard() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [accuracy] = useState('94.2%');
  const navigate = useNavigate();

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const historicalData = generateSampleData();
      
      const response = await axios.post(`${API_BASE_URL}/forecast`, {
        historical_data: historicalData,
        periods: 7,
        regressors: {
          temperature: [26, 27, 25, 24, 28, 29, 26],
          is_event: [0, 0, 0, 1, 0, 0, 0]
        }
      });

      if (response.data.forecast) {
        setForecast(response.data.forecast);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setError('Failed to connect to backend. Make sure the API is running on http://localhost:8000');
      // Set mock data for demo
      setForecast([
        { ds: '2026-03-27', yhat: 245, yhat_lower: 220, yhat_upper: 270 },
        { ds: '2026-03-28', yhat: 258, yhat_lower: 230, yhat_upper: 286 },
        { ds: '2026-03-29', yhat: 265, yhat_lower: 235, yhat_upper: 295 },
        { ds: '2026-03-30', yhat: 280, yhat_lower: 250, yhat_upper: 310 },
        { ds: '2026-03-31', yhat: 320, yhat_lower: 285, yhat_upper: 355 },
        { ds: '2026-04-01', yhat: 295, yhat_lower: 260, yhat_upper: 330 },
        { ds: '2026-04-02', yhat: 275, yhat_lower: 245, yhat_upper: 305 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const actualData = forecast.map(f => Math.round(f.yhat / 10 * (0.88 + Math.random() * 0.24)));
  const forecastLabels = forecast.map((_, i) => i);

  const categories = [
    { name: 'Vegetables', waste: 15, target: 10 },
    { name: 'Fruits', waste: 8, target: 6 },
    { name: 'Dairy', waste: 12, target: 8 },
    { name: 'Bakery', waste: 18, target: 12 },
  ];

  const alerts = [
    { type: 'warning', title: 'Vegetables showing high waste', desc: 'Your vegetable waste is 50% above target. Consider adjusting orders.' },
    { type: 'success', title: 'Great week for dairy!', desc: 'Dairy waste is 20% below target. Keep up this trend!' },
    { type: 'danger', title: 'Bakery waste increased', desc: 'Bakery items wasted increased 35% this week. Review expiration practices.' },
  ];

  return (
    <div className="main-area">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your waste reduction insights</p>
        </div>
        <button className="log-data-btn" onClick={() => navigate('/log-data')}>+ Log Data</button>
      </div>

      {/* Summary Cards */}
      <div className="kq-summary-grid">
        <KQCard icon="📉" label="Weekly Avg Waste" value="31 kg" trend="-12%" trendColor="green" />
        <KQCard icon="📈" label="Prediction Accuracy" value={accuracy} trend="+2.3%" trendColor="green" />
        <KQCard icon="🌿" label="This Month Saved" value="48 kg" trend="vs target" trendColor="green" />
        <KQCard icon="⚠️" label="Alerts This Week" value="3" trend="-1 from last week" trendColor="gold" iconBg="#fef3c7" />
      </div>

      {/* Chart + Category Breakdown */}
      <div className="kq-mid-grid">
        <div className="kq-panel">
          <h2 className="kq-panel-title">Weekly Predictions vs Actual</h2>
          <div className="analytics-chart-wrap">
            {loading ? (
              <div className="chart-loading">Loading forecast...</div>
            ) : (
              <Line
                data={{
                  labels: forecastLabels,
                  datasets: [
                    {
                      label: 'predicted',
                      data: forecast.map(f => Math.round(f.yhat / 10)),
                      borderColor: '#2d6a4f',
                      backgroundColor: 'transparent',
                      borderDash: [6, 3],
                      tension: 0.4,
                      pointRadius: 5,
                      pointBackgroundColor: '#2d6a4f',
                      borderWidth: 2,
                    },
                    {
                      label: 'actual',
                      data: actualData,
                      borderColor: '#c9a227',
                      backgroundColor: 'transparent',
                      tension: 0.4,
                      pointRadius: 5,
                      pointBackgroundColor: '#c9a227',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { usePointStyle: true } },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    x: { grid: { color: '#e8f5ee' } },
                    y: { beginAtZero: true, grid: { color: '#e8f5ee' } },
                  },
                }}
              />
            )}
          </div>
        </div>

        <div className="kq-panel">
          <h2 className="kq-panel-title">Category Breakdown</h2>
          <div className="category-list">
            {categories.map(cat => (
              <div key={cat.name} className="category-item">
                <div className="category-row">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-value">{cat.waste} kg</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(cat.waste / (cat.target * 1.5) * 100, 100)}%` }}></div>
                </div>
                <div className="category-target">Target: {cat.target} kg</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waste by Category + Alerts */}
      <div className="kq-bottom-grid">
        <div className="kq-panel">
          <h2 className="kq-panel-title">Waste vs Target by Category</h2>
          <div className="analytics-chart-wrap">
            <Bar
              data={{
                labels: categories.map(c => c.name),
                datasets: [
                  {
                    label: 'waste',
                    data: categories.map(c => c.waste),
                    backgroundColor: '#c9a227',
                    borderRadius: 6,
                    barPercentage: 0.7,
                  },
                  {
                    label: 'target',
                    data: categories.map(c => c.target),
                    backgroundColor: '#2d6a4f',
                    borderRadius: 6,
                    barPercentage: 0.7,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'bottom', labels: { usePointStyle: true } },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: '#e8f5ee' } },
                },
              }}
            />
          </div>
        </div>

        <div className="kq-panel">
          <h2 className="kq-panel-title">Recent Alerts &amp; Recommendations</h2>
          <div className="alert-list">
            {alerts.map((alert, i) => (
              <div key={i} className={`alert-card alert-${alert.type}`}>
                <div className="alert-title">{alert.title}</div>
                <div className="alert-desc">{alert.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function KQCard({ icon, label, value, trend, trendColor, iconBg }) {
  const trendStyle = trendColor === 'gold' ? '#c9a227' : '#2d6a4f';
  return (
    <div className="kq-card">
      <div className="kq-card-top">
        <span className="kq-card-label">{label}</span>
        <div className="kq-card-icon" style={{ background: iconBg || '#e8f5ee' }}>
          <span>{icon}</span>
        </div>
      </div>
      <div className="kq-card-value">{value}</div>
      <div className="kq-card-trend" style={{ color: trendStyle }}>{trend}</div>
    </div>
  );
}

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/overview', label: 'Overview' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const active = NAV_LINKS.find(l => l.to === location.pathname);
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-wrap">
          <span className="sidebar-logo-icon">🌿</span>
          <span className="sidebar-logo-text">KitchenIQ</span>
        </div>
        <span className="sidebar-hamburger">☰</span>
      </div>
      <div className="sidebar-active-label">{active ? active.label : 'KitchenIQ'}</div>
      <div className="sidebar-section-label">MENU</div>
      <nav className="sidebar-nav">
        {NAV_LINKS.map(l => (
          <Link key={l.to} to={l.to} className={`sidebar-link${location.pathname === l.to ? ' sidebar-link-active' : ''}`}>{l.label}</Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-account">
          <span>👤 {user ? `${user.username} (${user.role})` : 'Account'}</span>
          {onLogout && (
            <button className="sidebar-logout-btn" onClick={onLogout}>Sign out</button>
          )}
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">About KitchenIQ</h1>
          <p className="page-subtitle">Food Wastage Predictor powered by Prophet AI</p>
        </div>
      </div>
      <div className="kq-panel" style={{ maxWidth: 600 }}>
        <p style={{ color: '#4a5568', lineHeight: 1.7 }}>KitchenIQ uses machine learning to predict food sales and minimize waste in hawker centre kitchens. Powered by Facebook Prophet and XGBoost shelf-life estimation.</p>
      </div>
    </div>
  );
}

function LogData() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [submitted, setSubmitted] = useState(false);

  const [inventoryForm, setInventoryForm] = useState({
    item: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    expiry: '',
    notes: '',
  });

  const [salesForm, setSalesForm] = useState({
    item: '',
    category: 'Vegetables',
    quantity_sold: '',
    quantity_wasted: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Other'];
  const units = ['kg', 'g', 'L', 'mL', 'pcs', 'packs'];

  const handleInventoryChange = (e) => {
    setInventoryForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSalesChange = (e) => {
    setSalesForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      if (activeTab === 'inventory') {
        setInventoryForm({ item: '', category: 'Vegetables', quantity: '', unit: 'kg', expiry: '', notes: '' });
      } else {
        setSalesForm({ item: '', category: 'Vegetables', quantity_sold: '', quantity_wasted: '', date: new Date().toISOString().split('T')[0], notes: '' });
      }
    }, 2500);
  };

  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Log Data</h1>
          <p className="page-subtitle">Update your inventory or record today's sales</p>
        </div>
        <button className="log-data-btn log-data-btn--outline" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>

      <div className="ld-tabs">
        <button
          className={`ld-tab${activeTab === 'inventory' ? ' ld-tab--active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory Update
        </button>
        <button
          className={`ld-tab${activeTab === 'sales' ? ' ld-tab--active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          🧾 Sales & Waste Record
        </button>
      </div>

      {submitted && (
        <div className="ld-success-banner">
          ✅ Entry logged successfully! Data will be used to improve predictions.
        </div>
      )}

      <div className="kq-panel ld-form-panel">
        {activeTab === 'inventory' ? (
          <form className="ld-form" onSubmit={handleSubmit}>
            <h3 className="ld-form-title">Add / Update Inventory Item</h3>
            <div className="ld-form-grid">
              <div className="ld-field">
                <label className="ld-label">Item Name</label>
                <input className="ld-input" name="item" value={inventoryForm.item} onChange={handleInventoryChange} placeholder="e.g. Broccoli" required />
              </div>
              <div className="ld-field">
                <label className="ld-label">Category</label>
                <select className="ld-input" name="category" value={inventoryForm.category} onChange={handleInventoryChange}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="ld-field">
                <label className="ld-label">Quantity</label>
                <input className="ld-input" name="quantity" type="number" min="0" step="0.01" value={inventoryForm.quantity} onChange={handleInventoryChange} placeholder="0" required />
              </div>
              <div className="ld-field">
                <label className="ld-label">Unit</label>
                <select className="ld-input" name="unit" value={inventoryForm.unit} onChange={handleInventoryChange}>
                  {units.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="ld-field">
                <label className="ld-label">Expiry Date</label>
                <input className="ld-input" name="expiry" type="date" value={inventoryForm.expiry} onChange={handleInventoryChange} />
              </div>
              <div className="ld-field ld-field--full">
                <label className="ld-label">Notes (optional)</label>
                <textarea className="ld-input ld-textarea" name="notes" value={inventoryForm.notes} onChange={handleInventoryChange} placeholder="Any additional notes..." rows={3} />
              </div>
            </div>
            <button className="ld-submit-btn" type="submit">Log Inventory Entry</button>
          </form>
        ) : (
          <form className="ld-form" onSubmit={handleSubmit}>
            <h3 className="ld-form-title">Record Sales & Waste</h3>
            <div className="ld-form-grid">
              <div className="ld-field">
                <label className="ld-label">Item Name</label>
                <input className="ld-input" name="item" value={salesForm.item} onChange={handleSalesChange} placeholder="e.g. Chicken Rice" required />
              </div>
              <div className="ld-field">
                <label className="ld-label">Category</label>
                <select className="ld-input" name="category" value={salesForm.category} onChange={handleSalesChange}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="ld-field">
                <label className="ld-label">Quantity Sold</label>
                <input className="ld-input" name="quantity_sold" type="number" min="0" step="0.01" value={salesForm.quantity_sold} onChange={handleSalesChange} placeholder="0" required />
              </div>
              <div className="ld-field">
                <label className="ld-label">Quantity Wasted</label>
                <input className="ld-input" name="quantity_wasted" type="number" min="0" step="0.01" value={salesForm.quantity_wasted} onChange={handleSalesChange} placeholder="0" required />
              </div>
              <div className="ld-field">
                <label className="ld-label">Date</label>
                <input className="ld-input" name="date" type="date" value={salesForm.date} onChange={handleSalesChange} required />
              </div>
              <div className="ld-field ld-field--full">
                <label className="ld-label">Notes (optional)</label>
                <textarea className="ld-input ld-textarea" name="notes" value={salesForm.notes} onChange={handleSalesChange} placeholder="Any additional notes..." rows={3} />
              </div>
            </div>
            <button className="ld-submit-btn" type="submit">Log Sales Entry</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const weekDaysFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseWaste = [12, 10, 14, 16, 22, 18, 15];
  const heatData = Array.from({ length: 8 }, () =>
    baseWaste.map(base => Math.max(0, Math.round(base + (Math.random() * 6 - 3))))
  );
  const maxVal = Math.max(...heatData.flat());

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const monthStart = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = monthStart.getDay();

  const calendarData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const weekendBoost = dayOfWeek === 5 || dayOfWeek === 6 ? 1.2 : 1;
    const sales = Math.round((220 + (day % 9) * 12 + (dayOfWeek % 3) * 10) * weekendBoost);
    const wastage = Math.round(8 + (day % 7) * 1.8 + (dayOfWeek === 5 ? 4 : 0));
    return { day, sales, wastage };
  });

  const maxSales = Math.max(...calendarData.map(d => d.sales));
  const maxWastage = Math.max(...calendarData.map(d => d.wastage));
  const calendarCells = [
    ...Array.from({ length: startOffset }, () => null),
    ...calendarData,
  ];
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const monthlyBar = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [
      { label: 'Total Waste (kg)', data: [142, 138, 165, 129, 118, 105], backgroundColor: '#2d6a4f', borderRadius: 6, barPercentage: 0.6 },
      { label: 'Target (kg)', data: [120, 120, 120, 100, 100, 100], backgroundColor: '#c9a227', borderRadius: 6, barPercentage: 0.6 },
    ],
  };

  const historyLog = [
    { date: '2026-03-26', type: 'Sales', item: 'Chicken Rice', detail: 'Sold: 320 | Wasted: 8 kg' },
    { date: '2026-03-26', type: 'Inventory', item: 'Broccoli', detail: 'Qty: 12 kg | Expiry: 2026-03-29' },
    { date: '2026-03-25', type: 'Sales', item: 'Laksa', detail: 'Sold: 210 | Wasted: 14 kg' },
    { date: '2026-03-25', type: 'Sales', item: 'Kopi', detail: 'Sold: 480 | Wasted: 3 kg' },
    { date: '2026-03-24', type: 'Inventory', item: 'Dairy Pack', detail: 'Qty: 8 L | Expiry: 2026-03-27' },
    { date: '2026-03-23', type: 'Sales', item: 'Nasi Lemak', detail: 'Sold: 290 | Wasted: 20 kg' },
    { date: '2026-03-22', type: 'Sales', item: 'Mee Goreng', detail: 'Sold: 175 | Wasted: 12 kg' },
    { date: '2026-03-21', type: 'Inventory', item: 'Vegetables Bundle', detail: 'Qty: 20 kg | Expiry: 2026-03-24' },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } };

  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Historical trends and a full log of all recorded data</p>
        </div>
      </div>

      <div className="kq-bottom-grid" style={{ marginBottom: 24 }}>
        <div className="kq-panel">
          <h2 className="kq-panel-title">Monthly Waste vs Target</h2>
          <div className="analytics-chart-wrap" style={{ height: 240 }}>
            <Bar data={monthlyBar} options={chartOptions} />
          </div>
        </div>

        <div className="kq-panel">
          <h2 className="kq-panel-title">Waste Heat Map <span className="kq-panel-sub">last 8 weeks by day</span></h2>
          <div className="heatmap-wrap">
            <div className="heatmap-days">
              {days.map(d => <span key={d} className="heatmap-day-label">{d}</span>)}
            </div>
            <div className="heatmap-grid">
              {heatData.map((week, w) =>
                week.map((val, d) => (
                  <div
                    key={`${w}-${d}`}
                    className="heatmap-cell"
                    style={{ background: `rgba(45,106,79,${0.1 + (val / maxVal) * 0.9})` }}
                    title={`${days[d]}, W${w + 1}: ${val} kg`}
                  />
                ))
              )}
            </div>
            <div className="heatmap-legend">
              <span>Low</span><div className="heatmap-legend-bar" /><span>High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kq-panel">
        <h2 className="kq-panel-title">Data Log History</h2>
        <table className="ov-table">
          <thead><tr><th>Date</th><th>Type</th><th>Item</th><th>Details</th></tr></thead>
          <tbody>
            {historyLog.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td><span className={`ov-badge ov-badge--${row.type === 'Sales' ? 'sales' : 'inv'}`}>{row.type}</span></td>
                <td>{row.item}</td>
                <td className="ov-detail">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="kq-panel" style={{ marginTop: 24 }}>
        <h2 className="kq-panel-title">Sales &amp; Wastage Calendar Heat Map</h2>
        <p className="kq-panel-sub-text ov-cal-sub">{monthName} daily intensity view. Each day cell shows both Sales and Wastage heat.</p>

        <div className="ov-cal-weekdays">
          {weekDaysFull.map(d => (
            <span key={d} className="ov-cal-weekday">{d}</span>
          ))}
        </div>

        <div className="ov-cal-grid">
          {calendarCells.map((entry, idx) => {
            if (!entry) {
              return <div key={`empty-${idx}`} className="ov-cal-cell ov-cal-cell--empty" />;
            }

            const salesOpacity = 0.15 + (entry.sales / maxSales) * 0.75;
            const wastageOpacity = 0.15 + (entry.wastage / maxWastage) * 0.75;

            return (
              <div
                key={`day-${entry.day}`}
                className="ov-cal-cell"
                title={`Day ${entry.day}: Sales ${entry.sales}, Wastage ${entry.wastage} kg`}
              >
                <div className="ov-cal-day">{entry.day}</div>
                <div className="ov-cal-row" style={{ background: `rgba(45,106,79,${salesOpacity})` }}>
                  <span className="ov-cal-tag">S</span>
                  <span>{entry.sales}</span>
                </div>
                <div className="ov-cal-row" style={{ background: `rgba(201,162,39,${wastageOpacity})` }}>
                  <span className="ov-cal-tag">W</span>
                  <span>{entry.wastage}kg</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ov-cal-legend">
          <div className="ov-cal-legend-item"><span className="ov-cal-swatch ov-cal-swatch--sales" /> Sales intensity</div>
          <div className="ov-cal-legend-item"><span className="ov-cal-swatch ov-cal-swatch--waste" /> Wastage intensity</div>
        </div>
      </div>
    </div>
  );
}

// ── Predictions ───────────────────────────────────────────────────────────────
function Predictions() {
  const forecastByItem = {
    'Kitchen Total': { demand: [245, 258, 265, 280, 320, 295, 275], waste: [18, 15, 20, 17, 25, 22, 19] },
    'Chicken Rice': { demand: [82, 88, 91, 97, 112, 104, 98], waste: [6, 5, 7, 6, 9, 8, 7] },
    Laksa: { demand: [46, 49, 52, 55, 64, 59, 57], waste: [4, 3, 4, 4, 6, 5, 4] },
    'Mee Goreng': { demand: [38, 41, 42, 45, 52, 47, 44], waste: [3, 2, 3, 3, 4, 4, 3] },
    'Nasi Lemak': { demand: [44, 47, 48, 51, 58, 53, 50], waste: [3, 3, 4, 3, 5, 4, 4] },
    'Char Kway Teow': { demand: [35, 37, 39, 41, 48, 45, 43], waste: [2, 2, 3, 3, 4, 3, 3] },
  };

  const [forecastItem, setForecastItem] = useState('Kitchen Total');
  const [whatIfItem, setWhatIfItem] = useState('Chicken Rice');
  const [reduction, setReduction] = useState(10);
  const selectedForecast = forecastByItem[forecastItem];

  const forecastData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: `${forecastItem} Demand Forecast`, data: selectedForecast.demand, borderColor: '#2d6a4f', borderDash: [6, 3], tension: 0.4, pointRadius: 5, pointBackgroundColor: '#2d6a4f', borderWidth: 2, fill: false },
      { label: `${forecastItem} Predicted Waste`, data: selectedForecast.waste, borderColor: '#c9a227', tension: 0.4, pointRadius: 5, pointBackgroundColor: '#c9a227', borderWidth: 2, fill: false },
    ],
  };

  const suggestions = [
    { item: 'Vegetables', current: 25, suggested: 21, unit: 'kg', saving: '4 kg / S$14' },
    { item: 'Bakery Items', current: 40, suggested: 34, unit: 'pcs', saving: '6 pcs / S$18' },
    { item: 'Dairy', current: 15, suggested: 13, unit: 'L', saving: '2 L / S$8' },
    { item: 'Fruits', current: 18, suggested: 17, unit: 'kg', saving: '1 kg / S$4' },
  ];

  const whatIfSaved = Math.round(reduction * 0.8);
  const whatIfDollars = Math.round(whatIfSaved * 3.5);

  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Predictions</h1>
          <p className="page-subtitle">Forward-looking demand forecasts and order planning</p>
        </div>
      </div>

      <div className="kq-panel" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12, flexWrap: 'wrap' }}>
          <h2 className="kq-panel-title" style={{ marginBottom: 0 }}>Next 7-Day Demand & Waste Forecast</h2>
          <div style={{ minWidth: 220 }}>
            <label className="ld-label">Predicted Item</label>
            <select className="ld-input" value={forecastItem} onChange={e => setForecastItem(e.target.value)}>
              {Object.keys(forecastByItem).map(item => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <p className="kq-panel-sub-text pred-forecast-caption">Showing forecast for: <strong style={{ color: '#2d6a4f' }}>{forecastItem}</strong></p>
        <div className="analytics-chart-wrap" style={{ height: 240 }}>
          <Line data={forecastData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }} />
        </div>
      </div>

      <div className="kq-bottom-grid">
        <div className="kq-panel">
          <h2 className="kq-panel-title">📦 Inventory Suggestions</h2>
          <p className="kq-panel-sub-text">Recommended order reductions for next week based on predicted waste:</p>
          <table className="ov-table">
            <thead><tr><th>Category</th><th>Current Order</th><th>Suggested</th><th>Potential Saving</th></tr></thead>
            <tbody>
              {suggestions.map(s => (
                <tr key={s.item}>
                  <td>{s.item}</td>
                  <td>{s.current} {s.unit}</td>
                  <td className="pred-suggest">{s.suggested} {s.unit} ↓</td>
                  <td className="pred-save">{s.saving}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="kq-panel">
          <h2 className="kq-panel-title">🔮 What-If Scenario</h2>
          <p className="kq-panel-sub-text">Simulate the impact of reducing a menu item's prep quantity.</p>
          <div className="wi-form">
            <label className="ld-label">Menu Item</label>
            <select className="ld-input" value={whatIfItem} onChange={e => setWhatIfItem(e.target.value)}>
              {['Chicken Rice', 'Laksa', 'Mee Goreng', 'Nasi Lemak', 'Char Kway Teow'].map(i => <option key={i}>{i}</option>)}
            </select>
            <label className="ld-label" style={{ marginTop: 16 }}>
              Reduce prep by: <strong style={{ color: '#2d6a4f' }}>{reduction}%</strong>
            </label>
            <input type="range" min={5} max={40} step={5} value={reduction} onChange={e => setReduction(Number(e.target.value))} className="wi-slider" />
            <div className="wi-result">
              <div className="wi-result-row"><span>Estimated waste saved</span><strong>{whatIfSaved} kg / week</strong></div>
              <div className="wi-result-row"><span>Cost savings</span><strong style={{ color: '#2d6a4f' }}>S${whatIfDollars} / week</strong></div>
              <div className="wi-result-row"><span>Demand impact</span><strong style={{ color: '#c9a227' }}>Low risk — within ±5% of forecast</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function Analytics() {
  const financialData = [
    { category: 'Vegetables', icon: '🥬', kgWasted: 15, costPerKg: 3.5 },
    { category: 'Bakery', icon: '🍞', kgWasted: 18, costPerKg: 4.2 },
    { category: 'Dairy', icon: '🥛', kgWasted: 12, costPerKg: 3.8 },
    { category: 'Meat', icon: '🍗', kgWasted: 6, costPerKg: 12.0 },
    { category: 'Fruits', icon: '🍎', kgWasted: 8, costPerKg: 3.0 },
  ];
  const totalLost = financialData.reduce((s, r) => s + Math.round(r.kgWasted * r.costPerKg), 0);

  const rootCauseData = {
    labels: ['Over-preparation', 'Spoilage', 'Plate Waste', 'Damaged Stock', 'Supplier Quality'],
    datasets: [{
      data: [38, 27, 18, 10, 7],
      backgroundColor: ['#2d6a4f', '#40916c', '#74c69d', '#c9a227', '#f4e09a'],
      borderWidth: 0,
    }],
  };

  const financialBarData = {
    labels: financialData.map(r => r.category),
    datasets: [{
      label: 'Est. Loss (S$)',
      data: financialData.map(r => Math.round(r.kgWasted * r.costPerKg)),
      backgroundColor: ['#2d6a4f', '#c9a227', '#40916c', '#d97706', '#74c69d'],
      borderRadius: 6,
      barPercentage: 0.6,
    }],
  };

  const esgMetrics = [
    { label: 'CO₂ equivalent avoided', value: '87 kg', sub: 'Based on 105 kg waste reduction' },
    { label: 'Equivalent meals donated', value: '340', sub: 'Est. at 300 g per meal' },
    { label: 'Virtual water saved', value: '4,200 L', sub: 'Embedded in wasted food' },
    { label: 'ESG Score (Food)', value: 'B+', sub: 'vs industry avg C+' },
  ];

  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Financial impact, root cause analysis, and sustainability reporting</p>
        </div>
      </div>

      <div className="kq-panel" style={{ marginBottom: 24 }}>
        <div className="an-fin-header">
          <h2 className="kq-panel-title">💸 Financial Impact — This Month</h2>
          <div className="an-total-loss">Total estimated loss: <strong style={{ color: '#d32f2f' }}>S${totalLost}</strong></div>
        </div>
        <div className="an-fin-grid">
          {financialData.map(r => (
            <div key={r.category} className="an-fin-card">
              <span className="an-fin-icon">{r.icon}</span>
              <div className="an-fin-cat">{r.category}</div>
              <div className="an-fin-loss">S${Math.round(r.kgWasted * r.costPerKg)}</div>
              <div className="an-fin-detail">{r.kgWasted} kg × S${r.costPerKg}/kg</div>
            </div>
          ))}
        </div>
      </div>

      <div className="kq-bottom-grid" style={{ marginBottom: 24 }}>
        <div className="kq-panel">
          <h2 className="kq-panel-title">🔍 Root Cause Analysis</h2>
          <div className="analytics-chart-wrap" style={{ height: 260 }}>
            <Doughnut data={rootCauseData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </div>
        <div className="kq-panel">
          <h2 className="kq-panel-title">Loss by Category (S$)</h2>
          <div className="analytics-chart-wrap" style={{ height: 260 }}>
            <Bar data={financialBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      <div className="kq-panel">
        <h2 className="kq-panel-title">🌱 Sustainability Report</h2>
        <p className="kq-panel-sub-text">Metrics for ESG reporting and social impact. Exportable for tax incentive submissions related to food donation programmes.</p>
        <div className="an-esg-grid">
          {esgMetrics.map(m => (
            <div key={m.label} className="an-esg-card">
              <div className="an-esg-value">{m.value}</div>
              <div className="an-esg-label">{m.label}</div>
              <div className="an-esg-sub">{m.sub}</div>
            </div>
          ))}
        </div>
        <button className="ld-submit-btn" style={{ marginTop: 20 }}>Export ESG Report (PDF)</button>
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function Settings() {
  const [thresholds, setThresholds] = useState([
    { category: 'Vegetables', target: 10, unit: 'kg' },
    { category: 'Fruits', target: 6, unit: 'kg' },
    { category: 'Dairy', target: 8, unit: 'L' },
    { category: 'Bakery', target: 12, unit: 'kg' },
    { category: 'Meat', target: 5, unit: 'kg' },
  ]);
  const [contacts, setContacts] = useState([
    { name: 'Kitchen Manager', email: 'manager@kitcheniq.sg', active: true },
    { name: 'Owner', email: 'owner@kitcheniq.sg', active: true },
  ]);
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [privacy, setPrivacy] = useState({
    shareAnonymous: true,
    allowResearch: false,
    ipProtection: true,
    dataRetention: '12 months',
  });
  const [saved, setSaved] = useState(false);

  const handleThresholdChange = (i, val) =>
    setThresholds(prev => prev.map((t, idx) => idx === i ? { ...t, target: Number(val) } : t));

  const toggleContact = i =>
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, active: !c.active } : c));

  const addContact = () => {
    if (newContact.name && newContact.email) {
      setContacts(prev => [...prev, { ...newContact, active: true }]);
      setNewContact({ name: '', email: '' });
    }
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure thresholds, alert contacts, and data privacy</p>
        </div>
        <button className="ld-submit-btn" onClick={handleSave}>Save Changes</button>
      </div>

      {saved && <div className="ld-success-banner">✅ Settings saved successfully.</div>}

      <div className="kq-bottom-grid" style={{ marginBottom: 24 }}>
        <div className="kq-panel">
          <h2 className="kq-panel-title">⚖️ Waste Thresholds by Category</h2>
          <p className="kq-panel-sub-text">Maximum acceptable waste target per category per week.</p>
          <div className="st-threshold-list">
            {thresholds.map((t, i) => (
              <div key={t.category} className="st-threshold-row">
                <span className="st-cat-label">{t.category}</span>
                <input type="number" min={0} step={0.5} className="ld-input st-threshold-input" value={t.target} onChange={e => handleThresholdChange(i, e.target.value)} />
                <span className="st-unit">{t.unit} / week</span>
              </div>
            ))}
          </div>
        </div>

        <div className="kq-panel">
          <h2 className="kq-panel-title">🔔 Alert Management</h2>
          <p className="kq-panel-sub-text">Notify these contacts when waste exceeds a threshold.</p>
          <div className="st-contacts">
            {contacts.map((c, i) => (
              <div key={i} className="st-contact-row">
                <div className="st-contact-info">
                  <span className="st-contact-name">{c.name}</span>
                  <span className="st-contact-email">{c.email}</span>
                </div>
                <label className="st-toggle">
                  <input type="checkbox" checked={c.active} onChange={() => toggleContact(i)} />
                  <span className="st-toggle-slider" />
                </label>
              </div>
            ))}
          </div>
          <div className="st-add-contact">
            <input className="ld-input" placeholder="Name" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} />
            <input className="ld-input" placeholder="Email" type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} />
            <button className="st-add-btn" onClick={addContact}>+ Add</button>
          </div>
        </div>
      </div>

      <div className="kq-panel">
        <h2 className="kq-panel-title">🔒 Data Privacy & IP Protection</h2>
        <p className="kq-panel-sub-text">Control how your kitchen data is used. Your recipes, forecasting model weights, and operational patterns are proprietary and encrypted.</p>
        <div className="st-privacy-grid">
          {[
            { key: 'shareAnonymous', label: 'Share anonymised data for benchmarking', sub: 'Your identity is never revealed. Helps improve industry-wide predictions.' },
            { key: 'allowResearch', label: 'Allow data use for academic research', sub: 'Opt in to contribute to food waste reduction research programmes.' },
            { key: 'ipProtection', label: 'IP protection for kitchen forecasting model', sub: 'Model weights and proprietary patterns are encrypted and not shared.' },
          ].map(row => (
            <div key={row.key} className="st-privacy-row">
              <div className="st-privacy-info">
                <span className="st-privacy-label">{row.label}</span>
                <span className="st-privacy-sub">{row.sub}</span>
              </div>
              <label className="st-toggle">
                <input type="checkbox" checked={privacy[row.key]} onChange={() => setPrivacy(p => ({ ...p, [row.key]: !p[row.key] }))} />
                <span className="st-toggle-slider" />
              </label>
            </div>
          ))}
          <div className="st-privacy-row">
            <div className="st-privacy-info">
              <span className="st-privacy-label">Data retention period</span>
              <span className="st-privacy-sub">How long historical records are stored on the server.</span>
            </div>
            <select className="ld-input" style={{ width: 160 }} value={privacy.dataRetention} onChange={e => setPrivacy(p => ({ ...p, dataRetention: e.target.value }))}>
              {['3 months', '6 months', '12 months', '24 months', 'Indefinite'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo credentials ─────────────────────────────────────────────────────────
const DEMO_USERS = [
  { username: 'admin', password: 'kitcheniq2026', role: 'Admin' },
  { username: 'chef', password: 'chef1234', role: 'Chef' },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const match = DEMO_USERS.find(
        u => u.username === username.trim() && u.password === password
      );
      if (match) {
        onLogin({ username: match.username, role: match.role });
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-icon">🌿</span>
          <span className="login-brand-name">KitchenIQ</span>
        </div>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">Sign in to your kitchen intelligence dashboard.</p>
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-field">
            <label className="login-label" htmlFor="kiq-username">Username</label>
            <input
              id="kiq-username"
              className="login-input"
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="kiq-password">Password</label>
            <div className="login-pw-wrap">
              <input
                id="kiq-password"
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="login-hint">
          <span>Demo credentials: </span>
          <code>admin / kitcheniq2026</code>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => setUser(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="app-shell">
        <Sidebar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/log-data" element={<LogData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

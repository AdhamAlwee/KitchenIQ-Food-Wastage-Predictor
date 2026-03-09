import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

function Dashboard() {
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#fafbfc', minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, background: '#111827', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>SS</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#111827', lineHeight: 1 }}>SmartStock</div>
            <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, marginTop: 2 }}>Inventory Optimizer</div>
          </div>
        </div>
        {/* Right Side: Date, Notification, Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#f3f6fa', borderRadius: 8, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, color: '#64748b' }}>📅</span>
              Thursday, 19 February 2026
            </span>
          </div>
          {/* Notification Icon with Badge */}
          <div style={{ position: 'relative', background: '#f3f6fa', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, color: '#1e293b' }}>🔔</span>
            <span style={{ position: 'absolute', top: 7, right: 7, background: '#111827', color: '#fff', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '2px solid #fff' }}>3</span>
          </div>
          {/* Settings Icon */}
          <div style={{ background: '#f3f6fa', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, color: '#1e293b' }}>⚙️</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <SummaryCard title="Prediction Accuracy" value="94.2%" subtitle="Based on last 30 days" trend="+2.3% from last month" icon="📈" color="#2e7d32" />
        <SummaryCard title="Estimated Savings" value="$847.50" subtitle="This month" trend="+$124.50 from last month" icon="💵" color="#1976d2" />
        <SummaryCard title="Waste Reduction" value="32%" subtitle="Compared to baseline" trend="8% improvement" icon="🗑️" color="#fbc02d" />
        <SummaryCard title="Items Needing Restock" value="2" subtitle="Below minimum threshold" trend="Action required" icon="📦" color="#d32f2f" />
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        {/* Predictions List */}
        <div style={{ flex: 2, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Today's Predictions <span style={{ fontSize: 12, color: '#1976d2', background: '#e3f2fd', borderRadius: 4, padding: '2px 8px', marginLeft: 8 }}>AI-Powered</span></div>
            <div style={{ color: '#888', fontSize: 14 }}>Friday, Sunny, 32°C</div>
          </div>
          {/* Placeholder for predictions list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PredictionItem name="Chicken Rice" confidence="high" servings="85" change="+3.7% vs last week" prev="78" notes="Friday boost +12% | Sunny day +5%" />
            <PredictionItem name="Laksa" confidence="medium" servings="42" change="-6.7% vs last week" prev="38" notes="Payday week +8%" />
            <PredictionItem name="Char Kway Teow" confidence="high" servings="65" change="+3.2% vs last week" prev="58" notes="Friday boost +15% | Clear weather" />
            <PredictionItem name="Nasi Lemak" confidence="high" servings="55" change="+1.9% vs last week" prev="52" notes="Consistent demand" />
            <PredictionItem name="Mee Goreng" confidence="medium" servings="35" change="-7.9% vs last week" prev="30" notes="Slight increase expected" />
            <PredictionItem name="Roti Prata" confidence="high" servings="120" change="+1.7% vs last week" prev="115" notes="High turnover item" />
            <PredictionItem name="Kopi" confidence="high" servings="200" change="+1.0% vs last week" prev="195" notes="Stable demand" />
          </div>
        </div>

        {/* Smart Insights Panel */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Smart Insights</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InsightItem text="Char Kway Teow sells 30% more on Fridays – consider preparing extra" color="#1976d2" />
            <InsightItem text="Prawns running low – restock needed before weekend rush" color="#d32f2f" />
            <InsightItem text="Laksa has 12% waste rate – consider reducing portion by 2 servings" color="#fbc02d" />
            <InsightItem text="School holiday next week – expect 25% higher traffic" color="#388e3c" />
            <InsightItem text="Rain forecasted tomorrow – soups may sell better, reduce cold drinks prep" color="#1976d2" />
            <InsightItem text="Chicken Rice waste reduced by 40% this month – great job!" color="#8e24aa" />
          </ul>
        </div>
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Weekly Sales Pattern */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Weekly Sales Pattern</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Sales volume and waste by day of week</div>
          <Bar
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  label: 'Sales',
                  data: [260, 270, 290, 312, 400, 380, 340],
                  backgroundColor: '#111827',
                  borderRadius: 6,
                  barPercentage: 0.7,
                },
                {
                  label: 'Waste',
                  data: [8, 7, 10, 10, 12, 11, 9],
                  backgroundColor: '#ef4444',
                  borderRadius: 6,
                  barPercentage: 0.7,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: 'bottom' },
                tooltip: { enabled: true },
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
              },
            }}
            height={220}
          />
        </div>

        {/* Hourly Peak Analysis */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Hourly Peak Analysis</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Identify your busiest hours</div>
          <Line
            data={{
              labels: ['7AM', '9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'],
              datasets: [
                {
                  label: 'Orders',
                  data: [45, 80, 60, 180, 90, 150, 130, 60],
                  borderColor: '#111827',
                  backgroundColor: 'rgba(17,24,39,0.1)',
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: '#111827',
                  fill: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
              },
            }}
            height={220}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Top Sellers This Week */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Top Sellers This Week</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Best performing menu items</div>
          <ol style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Chicken Rice', sold: 520 },
              { name: 'Kopi', sold: 485 },
              { name: 'Char Kway Teow', sold: 410 },
              { name: 'Teh', sold: 395 },
              { name: 'Nasi Lemak', sold: 345 },
            ].map((item, idx) => (
              <li key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 28, background: '#f3f6fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#111827', fontSize: 15 }}>{idx + 1}</span>
                <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{item.name}</span>
                <div style={{ flex: 2, background: '#f3f4f6', borderRadius: 8, height: 8, margin: '0 12px', position: 'relative' }}>
                  <div style={{ background: '#111827', borderRadius: 8, height: 8, width: `${item.sold / 520 * 100}%`, position: 'absolute', left: 0, top: 0 }}></div>
                </div>
                <span style={{ color: '#6b7280', fontSize: 14 }}>{item.sold} sold</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Waste Tracking */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Waste Tracking</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Sold vs wasted comparison per item</div>
          <Bar
            data={{
              labels: ['Laksa', 'Mee Goreng', 'Nasi Lemak', 'Char Kway Teow', 'Chicken Rice'],
              datasets: [
                {
                  label: 'Sold',
                  data: [320, 210, 340, 390, 520],
                  backgroundColor: '#111827',
                  borderRadius: 6,
                  barPercentage: 0.7,
                },
                {
                  label: 'Wasted',
                  data: [30, 15, 18, 22, 10],
                  backgroundColor: '#ef4444',
                  borderRadius: 6,
                  barPercentage: 0.7,
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              responsive: true,
              plugins: {
                legend: { display: true, position: 'bottom' },
                tooltip: { enabled: true },
              },
              scales: {
                x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                y: { grid: { display: false } },
              },
            }}
            height={220}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, trend, icon, color }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 28, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#888' }}>{subtitle}</div>
      <div style={{ fontSize: 13, color: color, fontWeight: 500 }}>{trend}</div>
    </div>
  );
}

function PredictionItem({ name, confidence, servings, change, prev, notes }) {
  const confidenceColor = confidence === 'high' ? '#388e3c' : confidence === 'medium' ? '#fbc02d' : '#d32f2f';
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: 8, padding: 16, gap: 16 }}>
      <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍽️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{name} <span style={{ fontSize: 12, color: confidenceColor, background: '#e0f2f1', borderRadius: 4, padding: '2px 8px', marginLeft: 8 }}>{confidence} confidence</span></div>
        <div style={{ fontSize: 13, color: '#888' }}>{notes}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>{servings} <span style={{ fontWeight: 400, fontSize: 13, color: '#888' }}>servings</span></div>
        <div style={{ fontSize: 13, color: change.startsWith('+') ? '#388e3c' : '#d32f2f' }}>{change}</div>
        <div style={{ fontSize: 12, color: '#888' }}>Yesterday: {prev}</div>
      </div>
    </div>
  );
}

function InsightItem({ text, color }) {
  return (
    <li style={{ background: '#f5f5f5', borderLeft: `4px solid ${color}`, borderRadius: 6, padding: '10px 14px', fontSize: 14, color: '#333' }}>{text}</li>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
      <p>This dashboard helps you track and predict food wastage.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f0f0f0', marginBottom: 24 }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;

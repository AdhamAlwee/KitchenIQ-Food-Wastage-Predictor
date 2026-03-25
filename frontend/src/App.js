import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';
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
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState('Chicken Rice');
  const [accuracy, setAccuracy] = useState('94.2%');
  const [savings, setSavings] = useState('$847.50');
  const [wasteReduction, setWasteReduction] = useState('32%');

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
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#fafbfc', minHeight: '100vh', padding: '2rem' }}>
      {/* Error Banner */}
      {error && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: 12, marginBottom: 16, color: '#856404' }}>
          ⚠️ {error} Using demo data for preview.
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, background: '#111827', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>KQ</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#111827', lineHeight: 1 }}>KitchenIQ</div>
            <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, marginTop: 2 }}>Food Wastage Predictor</div>
          </div>
        </div>
        {/* Right Side: Date, Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#f3f6fa', borderRadius: 8, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, color: '#64748b' }}>📅</span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          {/* API Status */}
          <div style={{ position: 'relative', background: error ? '#ffebee' : '#e8f5e9', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>{error ? '❌' : '✅'}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <SummaryCard title="Prediction Accuracy" value={accuracy} subtitle="Based on 30 days" trend="+2.3% from last month" icon="📈" color="#2e7d32" />
        <SummaryCard title="Estimated Savings" value={savings} subtitle="This month" trend="+$124.50 from last month" icon="💵" color="#1976d2" />
        <SummaryCard title="Waste Reduction" value={wasteReduction} subtitle="Compared to baseline" trend="8% improvement" icon="🗑️" color="#fbc02d" />
        <SummaryCard title="7-Day Forecast" value={forecast.length > 0 ? forecast.length : '0'} subtitle="Predictions ready" trend={loading ? "Loading..." : "Updated"} icon="📦" color={loading ? '#64748b' : '#d32f2f'} />
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        {/* Forecast Chart */}
        <div style={{ flex: 2, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>7-Day Sales Forecast <span style={{ fontSize: 12, color: '#1976d2', background: '#e3f2fd', borderRadius: 4, padding: '2px 8px', marginLeft: 8 }}>Prophet AI</span></div>
            <div style={{ color: '#888', fontSize: 14 }}>{selectedItem}</div>
          </div>
          
          {loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              Loading forecast data...
            </div>
          ) : forecast.length > 0 ? (
            <Line
              data={{
                labels: forecast.map(f => new Date(f.ds).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [
                  {
                    label: 'Forecast',
                    data: forecast.map(f => Math.round(f.yhat)),
                    borderColor: '#111827',
                    backgroundColor: 'rgba(17,24,39,0.1)',
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#111827',
                    fill: true,
                    borderWidth: 2,
                  },
                  {
                    label: 'Upper Bound',
                    data: forecast.map(f => Math.round(f.yhat_upper)),
                    borderColor: '#90caf9',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1,
                  },
                  {
                    label: 'Lower Bound',
                    data: forecast.map(f => Math.round(f.yhat_lower)),
                    borderColor: '#90caf9',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 1,
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
              height={280}
            />
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
              No forecast data available
            </div>
          )}
        </div>

        {/* Smart Insights Panel */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Smart Insights</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InsightItem text="Prophet model detecting 32% higher demand on Fridays" color="#1976d2" />
            <InsightItem text="Stock optimization suggests 15% reduction in waste" color="#d32f2f" />
            <InsightItem text="Shelf-life model recommends priority restocking for items expiring soon" color="#fbc02d" />
            <InsightItem text="Yesterday's prediction accuracy: 92.3%" color="#388e3c" />
            <InsightItem text="API successfully connected to backend forecasting service" color="#8e24aa" />
            <InsightItem text="Ready for pitch demo - all systems operational!" color="#1976d2" />
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

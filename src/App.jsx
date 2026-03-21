import { useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { exportToJson, importFromJson } from './lib/storage';
import BottomNav from './components/BottomNav';
import DailyPage from './pages/DailyPage';
import WeeklyPage from './pages/WeeklyPage';
import MonthlyPage from './pages/MonthlyPage';
import YearlyPage from './pages/YearlyPage';

// Header component with app title and Export/Import buttons
function AppHeader() {
  const navigate = useNavigate();
  // Hidden file input for the Import button
  const fileInputRef = useRef(null);

  // Handle importing a JSON file
  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const count = await importFromJson(file);
      alert(`Imported successfully! (${count} meals total)`);
      // Reload the current page to show imported data
      navigate(0);
    } catch (err) {
      alert('Import failed: ' + err.message);
    }

    // Reset the file input so the same file can be imported again
    e.target.value = '';
  }

  return (
    <header className="app-header">
      <h1 className="app-title">Meal Planner</h1>
      <div className="app-header-actions">
        {/* Export button - downloads all data as a JSON file */}
        <button className="header-btn" onClick={exportToJson} title="Export data">
          Export
        </button>
        {/* Import button - opens file picker to load a JSON file */}
        <button className="header-btn" onClick={() => fileInputRef.current?.click()} title="Import data">
          Import
        </button>
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppHeader />
      <Routes>
        {/* Daily view - home page and with specific date */}
        <Route path="/" element={<DailyPage />} />
        <Route path="/day/:date" element={<DailyPage />} />

        {/* Weekly view */}
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/weekly/:date" element={<WeeklyPage />} />

        {/* Monthly calendar view */}
        <Route path="/monthly" element={<MonthlyPage />} />
        <Route path="/monthly/:yearMonth" element={<MonthlyPage />} />

        {/* Yearly overview */}
        <Route path="/yearly" element={<YearlyPage />} />
        <Route path="/yearly/:year" element={<YearlyPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

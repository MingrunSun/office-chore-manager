import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CalendarContainer from './components/calendar/CalendarContainer';
import ChoreList from './components/chores/ChoreList';
import MemberList from './components/members/MemberList';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<CalendarContainer />} />
            <Route path="/chores" element={<ChoreList />} />
            <Route path="/members" element={<MemberList />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

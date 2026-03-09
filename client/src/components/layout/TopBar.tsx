import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/calendar': 'Calendar',
  '/chores': 'Manage Chores',
  '/members': 'Manage Members',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Office Chores';
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
    </header>
  );
}

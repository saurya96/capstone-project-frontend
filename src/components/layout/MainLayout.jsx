import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-container">
        <Sidebar />
        <main id="main-content" className="main-content" tabIndex="-1">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

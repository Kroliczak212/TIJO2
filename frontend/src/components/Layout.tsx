/**
 * VetCRM Receptionist Module - Layout Component
 *
 * @author Bartłomiej Król
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  Calculator,
  LogOut
} from 'lucide-react';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

function Layout({ children, onLogout }: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>VetCRM</h1>
          <span>Moduł Recepcjonisty</span>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <NavLink to="/" end>
                <LayoutDashboard />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/clients">
                <Users />
                <span>Klienci</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/pets">
                <PawPrint />
                <span>Zwierzęta</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/appointments">
                <Calendar />
                <span>Wizyty</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctors">
                <Stethoscope />
                <span>Lekarze</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/calculators">
                <Calculator />
                <span>Kalkulatory</span>
              </NavLink>
            </li>
            <li>
              <a href="#" onClick={onLogout}>
                <LogOut />
                <span>Wyloguj</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome, HiUsers, HiShieldCheck, HiOfficeBuilding, HiAcademicCap,
  HiClipboardList, HiUserGroup, HiCurrencyRupee, HiDocumentText,
  HiChartBar, HiCog, HiBell, HiClipboardCheck, HiEye, HiCalendar,
  HiBriefcase, HiCollection,
} from 'react-icons/hi';

const menuConfig = {
  super_admin: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/users', icon: HiUsers, label: 'User Management' },
    { path: '/roles', icon: HiShieldCheck, label: 'Role Management' },
    { path: '/departments', icon: HiOfficeBuilding, label: 'Departments' },
    { path: '/courses', icon: HiAcademicCap, label: 'Courses' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/corrections', icon: HiClipboardCheck, label: 'Corrections' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
    { path: '/audit-logs', icon: HiEye, label: 'Audit Logs' },
    { path: '/settings', icon: HiCog, label: 'Settings' },
  ],
  admin: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/users', icon: HiUsers, label: 'User Management' },
    { path: '/roles', icon: HiShieldCheck, label: 'Role Management' },
    { path: '/departments', icon: HiOfficeBuilding, label: 'Departments' },
    { path: '/courses', icon: HiAcademicCap, label: 'Courses' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/corrections', icon: HiClipboardCheck, label: 'Corrections' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
    { path: '/audit-logs', icon: HiEye, label: 'Audit Logs' },
    { path: '/settings', icon: HiCog, label: 'Settings' },
  ],
  receptionist: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/reception/new', icon: HiClipboardList, label: 'New Visitor Entry' },
    { path: '/reception/today', icon: HiCalendar, label: "Today's Visitors" },
    { path: '/reception/my-cases', icon: HiCollection, label: 'My Cases' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
  ],
  senior_receptionist: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/reception/new', icon: HiClipboardList, label: 'New Visitor Entry' },
    { path: '/reception/today', icon: HiCalendar, label: "Today's Visitors" },
    { path: '/reception/my-cases', icon: HiCollection, label: 'My Cases' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
  ],
  counsellor: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/counsellor/assigned', icon: HiUserGroup, label: 'Assigned Enquiries' },
    { path: '/counsellor/follow-ups', icon: HiCalendar, label: 'Follow-ups' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
  ],
  counselling_head: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/counsellor/assigned', icon: HiUserGroup, label: 'Assigned Enquiries' },
    { path: '/counsellor/follow-ups', icon: HiCalendar, label: 'Follow-ups' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
  ],
  department_staff: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/department/cases', icon: HiClipboardList, label: 'Department Cases' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
  ],
  hod: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/department/cases', icon: HiClipboardList, label: 'Department Cases' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
  ],
  accounts_staff: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/accounts/cases', icon: HiCurrencyRupee, label: 'Accounts Cases' },
    { path: '/accounts/payments', icon: HiDocumentText, label: 'Payments' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
  ],
  accounts_head: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/accounts/cases', icon: HiCurrencyRupee, label: 'Accounts Cases' },
    { path: '/accounts/payments', icon: HiDocumentText, label: 'Payments' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
  ],
  registrar_staff: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/registrar/cases', icon: HiDocumentText, label: 'Registrar Cases' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
  ],
  registrar: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/registrar/cases', icon: HiDocumentText, label: 'Registrar Cases' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
  ],
  admission_head: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/corrections', icon: HiClipboardCheck, label: 'Corrections' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
    { path: '/audit-logs', icon: HiEye, label: 'Audit Logs' },
  ],
  principal: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
    { path: '/audit-logs', icon: HiEye, label: 'Audit Logs' },
  ],
  auditor: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/reports', icon: HiChartBar, label: 'Reports' },
    { path: '/audit-logs', icon: HiEye, label: 'Audit Logs' },
  ],
  event_coordinator: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/counsellor/assigned', icon: HiBriefcase, label: 'My Cases' },
  ],
  placement_staff: [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/cases', icon: HiClipboardList, label: 'All Cases' },
    { path: '/counsellor/assigned', icon: HiBriefcase, label: 'My Cases' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const roleSlug = user?.role?.slug || 'receptionist';
  const menu = menuConfig[roleSlug] || menuConfig.receptionist;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-indigo-600">College ERP</h1>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/notifications"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <HiBell className="w-5 h-5" />
            Notifications
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

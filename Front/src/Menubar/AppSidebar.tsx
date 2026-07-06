import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const BRAND = '#280882';

interface SubItem {
  id: string;
  label: string;
  icon: string;
  tab: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: string[];
  subItems?: SubItem[];
}

const MENU: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    path: '/dashboard',
  },
  {
    id: 'master',
    label: 'Master Entry',
    icon: 'fas fa-database',
    path: '/master',
    roles: ['SUPER_ADMIN', 'MR', 'QMS_COORDINATOR'],
    subItems: [
      { id: 'master-dash',  label: 'Dashboard',           icon: 'fas fa-chart-pie',    tab: 'dashboard'    },
      { id: 'master-cert',  label: 'Certification Master',icon: 'fas fa-certificate',  tab: 'certification' },
      { id: 'master-dept',  label: 'Department Master',   icon: 'fas fa-building',     tab: 'department'   },
      { id: 'master-desig', label: 'Designation Master',  icon: 'fas fa-id-badge',     tab: 'designation'  },
      { id: 'master-emp',   label: 'Employee Master',     icon: 'fas fa-users',        tab: 'employee'     },
      { id: 'master-aud',   label: 'Auditor Master',      icon: 'fas fa-user-shield',  tab: 'auditor'      },
      { id: 'master-doc',   label: 'Document Master',     icon: 'fas fa-folder-open',  tab: 'document'     },
    ],
  },
  {
    id: 'issues',
    label: 'Issue Register',
    icon: 'fas fa-list-alt',
    path: '/issues',
    roles: ['SUPER_ADMIN', 'MR', 'QMS_COORDINATOR', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    subItems: [
      { id: 'issues-issues',    label: 'Quality Issues',          icon: 'fas fa-exclamation-circle', tab: 'issues'    },
      { id: 'issues-doc-issue', label: 'Document Issue Register', icon: 'fas fa-file-contract',    tab: 'doc-issue' },
      { id: 'issues-report',    label: 'Reports',                 icon: 'fas fa-file-alt',          tab: 'report'    },
    ],
  },
  {
    id: 'kpi',
    label: 'KPI',
    icon: 'fas fa-chart-bar',
    path: '/kpi',
    roles: ['SUPER_ADMIN', 'MR', 'QMS_COORDINATOR', 'DEPARTMENT_HEAD', 'TOP_MANAGEMENT'],
    subItems: [
      { id: 'kpi-dash',      label: 'Dashboard',        icon: 'fas fa-chart-pie',    tab: 'dashboard' },
      { id: 'kpi-objective', label: 'KPI Objectives',   icon: 'fas fa-bullseye',     tab: 'objective' },
      { id: 'kpi-monthly',   label: 'Monthly Entry',    icon: 'fas fa-calendar-day', tab: 'monthly'   },
      { id: 'kpi-review',    label: 'KPI Review',       icon: 'fas fa-chart-line',   tab: 'review'    },
      { id: 'kpi-capa',      label: 'Corrective Action',icon: 'fas fa-tools',        tab: 'capa'      },
      { id: 'kpi-analytics', label: 'Analytics',        icon: 'fas fa-chart-bar',    tab: 'analytics' },
      { id: 'kpi-reports',   label: 'Reports',          icon: 'fas fa-file-alt',     tab: 'reports'   },
    ],
  },
  {
    id: 'audit',
    label: 'Internal Audit',
    icon: 'fas fa-clipboard-check',
    path: '/audit',
    roles: ['SUPER_ADMIN', 'MR', 'QMS_COORDINATOR', 'AUDITOR', 'DEPARTMENT_HEAD'],
    subItems: [
      { id: 'audit-dash',     label: 'Dashboard',        icon: 'fas fa-chart-pie',            tab: 'dashboard'    },
      { id: 'audit-plan',     label: 'Audit Plan',       icon: 'fas fa-calendar-check',       tab: 'plans'        },
      { id: 'audit-sched',    label: 'Audit Schedule',   icon: 'fas fa-calendar-alt',         tab: 'schedule'     },
      { id: 'audit-obs',      label: 'Audit Observation',icon: 'fas fa-eye',                  tab: 'observations' },
      { id: 'audit-nc',       label: 'NC / CAR',         icon: 'fas fa-exclamation-triangle', tab: 'nc'           },
      { id: 'audit-feedback', label: 'Audit Feedback',   icon: 'fas fa-star',                 tab: 'feedback'     },
      { id: 'audit-reports',  label: 'Reports',          icon: 'fas fa-file-alt',             tab: 'reports'      },
      { id: 'audit-analytics',label: 'Analytics',        icon: 'fas fa-chart-bar',            tab: 'analytics'    },
    ],
  },
  {
    id: 'mrm',
    label: 'MRM',
    icon: 'fas fa-users',
    path: '/mrm',
    roles: ['SUPER_ADMIN', 'MR', 'TOP_MANAGEMENT', 'QMS_COORDINATOR'],
    subItems: [
      { id: 'mrm-dash',           label: 'Dashboard',           icon: 'fas fa-chart-pie',        tab: 'dashboard'    },
      { id: 'mrm-plan',           label: 'MRM Plan',            icon: 'fas fa-calendar',         tab: 'plans'        },
      { id: 'mrm-process-plan',   label: 'Process Review Plan', icon: 'fas fa-sitemap',          tab: 'process-plan' },
      { id: 'mrm-process-sheet',  label: 'Process Review Sheet',icon: 'fas fa-clipboard-list',   tab: 'process-sheet'},
      { id: 'mrm-minutes',        label: 'Minutes of Meeting',  icon: 'fas fa-file-signature',   tab: 'minutes'      },
      { id: 'mrm-action-tracker', label: 'Action Tracker',      icon: 'fas fa-tasks',            tab: 'action-tracker'},
      { id: 'mrm-kpi-review',     label: 'KPI Review',          icon: 'fas fa-chart-line',       tab: 'kpi-review'   },
      { id: 'mrm-audit-review',   label: 'Audit Review',        icon: 'fas fa-clipboard-check',  tab: 'audit-review' },
      { id: 'mrm-reports',        label: 'Reports',             icon: 'fas fa-file-alt',         tab: 'reports'      },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'fas fa-user-cog',
    path: '/users',
    roles: ['SUPER_ADMIN'],
  },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-expand active section
  useEffect(() => {
    const active = MENU.find(m => m.path !== '/dashboard' && location.pathname.startsWith(m.path));
    if (active?.subItems) setExpandedId(active.id);
  }, [location.pathname]);

  const userRole = user?.role || '';
  const visibleMenu = MENU.filter(m => !m.roles || m.roles.includes(userRole));

  const currentTab = new URLSearchParams(location.search).get('tab') || '';
  const isPathActive = (item: MenuItem) =>
    location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
  const isSubActive = (item: MenuItem, sub: SubItem) =>
    isPathActive(item) && currentTab === sub.tab;

  const go = (item: MenuItem, sub?: SubItem) => {
    if (sub) {
      navigate(`${item.path}?tab=${sub.tab}`);
    } else if (item.subItems?.length) {
      const willExpand = expandedId !== item.id;
      setExpandedId(willExpand ? item.id : null);
      if (willExpand) navigate(`${item.path}?tab=${item.subItems[0].tab}`);
    } else {
      navigate(item.path);
    }
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-[18px] left-4 z-50 p-2 rounded-lg shadow-md bg-white md:hidden"
          style={{ color: BRAND }}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} text-sm`} />
        </button>
      )}

      <aside
        className={`
          flex-shrink-0 h-full shadow-md border-r border-gray-200 bg-white transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          ${isMobile ? `fixed z-40 top-[70px] bottom-0 ${mobileOpen ? 'left-0' : '-left-72'}` : 'relative'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-3 border-b border-white/10"
            style={{ background: BRAND, minHeight: 56 }}
          >
            {!collapsed && (
              <span className="text-white font-bold text-sm tracking-wide truncate">QMS Platform</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
            >
              <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {visibleMenu.map(item => {
              const active = isPathActive(item);
              const expanded = expandedId === item.id;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => go(item)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active && !item.subItems
                        ? 'text-white'
                        : active
                        ? 'text-white'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-gray-900'
                    }`}
                    style={active ? { background: BRAND } : {}}
                  >
                    <i className={`${item.icon} w-4 text-center text-sm flex-shrink-0`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-[13px] leading-tight">{item.label}</span>
                        {item.subItems && (
                          <i
                            className={`fas fa-chevron-${expanded ? 'down' : 'right'} text-[10px] opacity-60 flex-shrink-0`}
                          />
                        )}
                      </>
                    )}
                  </button>

                  {!collapsed && item.subItems && expanded && (
                    <div className="mt-0.5 ml-4 pl-3 border-l-2 border-gray-100 space-y-0.5 pb-1">
                      {item.subItems.map(sub => {
                        const subActive = isSubActive(item, sub);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => go(item, sub)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] transition-all duration-150 ${
                              subActive
                                ? 'font-semibold'
                                : 'text-gray-500 hover:bg-purple-50 hover:text-gray-800'
                            }`}
                            style={subActive ? { color: BRAND, background: '#f5f3ff' } : {}}
                          >
                            <i className={`${sub.icon} text-[11px] w-3.5 text-center flex-shrink-0`} />
                            <span className="text-left leading-tight">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400 text-center">QMS Platform v2.0</p>
            </div>
          )}
        </div>
      </aside>

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

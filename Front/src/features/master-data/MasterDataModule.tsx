import { useSearchParams } from 'react-router-dom';
import CertificationPage from '../qms/CertificationPage';
import DepartmentPage from '../qms/DepartmentPage';
import DocumentPage from '../qms/DocumentPage';
import EmployeePage from '../qms/EmployeePage';
import AuditorPage from '../qms/AuditorPage';
import DesignationPage from '../qms/DesignationPage';
import MasterDashboard from './MasterDashboard';

const BRAND = '#280882';

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',            icon: 'fas fa-chart-pie'    },
  { id: 'certification',label: 'Certification Master',  icon: 'fas fa-certificate'  },
  { id: 'department',   label: 'Department Master',     icon: 'fas fa-building'     },
  { id: 'designation',  label: 'Designation Master',    icon: 'fas fa-id-badge'     },
  { id: 'employee',     label: 'Employee Master',       icon: 'fas fa-users'        },
  { id: 'auditor',      label: 'Auditor Master',        icon: 'fas fa-user-shield'  },
  { id: 'document',     label: 'Document Master',       icon: 'fas fa-folder-open'  },
];

export default function MasterDataModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setTab = (tab: string) => setSearchParams({ tab }, { replace: true });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage certifications, departments, employees, auditors, and documents
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
        >
          <i className="fas fa-database" style={{ color: BRAND }} />
          <span style={{ color: BRAND }} className="font-medium">Master Entry</span>
          <span className="text-gray-300">›</span>
          <span>{TABS.find(t => t.id === activeTab)?.label}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <nav className="flex min-w-max">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'text-[#280882] bg-purple-50/60'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                style={isActive ? { borderBottomColor: BRAND } : {}}
              >
                <i className={`${tab.icon} text-xs`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div key={activeTab}>
        {activeTab === 'dashboard'     && <MasterDashboard />}
        {activeTab === 'certification' && <CertificationPage />}
        {activeTab === 'department'    && <DepartmentPage />}
        {activeTab === 'designation'   && <DesignationPage />}
        {activeTab === 'employee'      && <EmployeePage />}
        {activeTab === 'auditor'       && <AuditorPage />}
        {activeTab === 'document'      && <DocumentPage />}
      </div>
    </div>
  );
}

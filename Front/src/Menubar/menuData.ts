import type { MenuSection } from './types';

export const QMSMenuData: MenuSection[] = [
  {
    id: 'master-data',
    title: 'Master Data',
    icon: 'fas fa-database',
    link: '/master-data',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    link: '/dashboard',
  },
  {
    id: 'certifications',
    title: 'Certifications',
    icon: 'fas fa-certificate',
    link: '/certifications',
  },
  {
    id: 'departments',
    title: 'Departments',
    icon: 'fas fa-building',
    link: '/departments',
  },
  {
    id: 'documents',
    title: 'Document Control',
    icon: 'fas fa-folder-open',
    link: '/documents',
  },
  {
    id: 'issue-register',
    title: 'Issue Register',
    icon: 'fas fa-list-alt',
    link: '/issue-register',
  },
  {
    id: 'kpi-master',
    title: 'KPI Master',
    icon: 'fas fa-chart-bar',
    link: '/kpi/masters',
  },
  {
    id: 'kpi-entry',
    title: 'KPI Entry',
    icon: 'fas fa-edit',
    link: '/kpi/entries',
  },
  {
    id: 'audit-plan',
    title: 'Audit Plans',
    icon: 'fas fa-calendar-check',
    link: '/audit/plans',
  },
  {
    id: 'audit-obs',
    title: 'Audit Observations',
    icon: 'fas fa-eye',
    link: '/audit/observations',
  },
  {
    id: 'nc-tracking',
    title: 'NC / CAPA',
    icon: 'fas fa-exclamation-triangle',
    link: '/audit/nc',
  },
  {
    id: 'mrm',
    title: 'MRM',
    icon: 'fas fa-users',
    link: '/mrm',
  },
  {
    id: 'users',
    title: 'User Management',
    icon: 'fas fa-user-cog',
    link: '/users',
  },
];

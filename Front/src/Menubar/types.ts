// types/menuTypes.ts
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  link?: string;
  submenu?: MenuItem[];
}

export interface MenuSection {
  id: string;
  title?: string;
  icon?: string;        // Added for section-level icon
  link?: string;        // Added for section-level link
  items?: MenuItem[];   // Made optional for simplified structure
}

export interface YouTubeStyleMenuProps {
  menuData: MenuSection[];
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  isCollapsible?: boolean;
  appName?: string;
}
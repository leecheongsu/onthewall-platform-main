import { Code } from '@mui/icons-material';
import NotificationAddOutlinedIcon from '@mui/icons-material/NotificationAddOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { ReactNode } from 'react';

type Menu = {
  cate: string;
  link: string;
  icon: ReactNode;
};

type SideMenu = {
  cate: string;
  subCate: string;
  link?: string;
  hasItem?: boolean;
  items?: Menu[];
  icon?: ReactNode;
};

export const SIDE_MENUS: SideMenu[] = [
  {
    cate: 'Manage',
    subCate: 'Overview',
    link: '/admin/manage/overview',
    icon: <DashboardOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Layout & Design',
    link: '/admin/manage/layout-design',
    icon: <AutoFixHighOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Projects',
    link: '/admin/manage/projects',
    icon: <AutoAwesomeOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Exhibitions',
    link: '/admin/manage/exhibitions',
    icon: <ColorLensOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Users',
    link: '/admin/manage/users',
    icon: <AdminPanelSettingsOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Orders',
    link: '/admin/manage/orders',
    icon: <ReceiptOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Promotions',
    link: '/admin/manage/promotions',
    icon: <Code />,
  },
  {
    cate: 'Manage',
    subCate: 'Notification',
    link: '/admin/manage/notification',
    icon: <NotificationAddOutlinedIcon />,
  },
  {
    cate: 'Manage',
    subCate: 'Space',
    link: '/admin/manage/space',
    icon: <DashboardCustomizeOutlinedIcon />,
  },
];

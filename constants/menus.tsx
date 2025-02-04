import { ReactNode } from 'react';
import OptimizeIcon from '@/images/icons/Optimize';
import PeopleSafeOneIcon from '@/images/icons/PeopleSafeOne';
import DashboardIcon from '@/images/icons/Dashboard';
import ImageMultiIcon from '@/images/icons/ImageMulti';
import SettingIcon from '@/images/icons/Setting';
import AdminIcon from '@/images/icons/AdminIcon';
import MemberIcon from '@/images/icons/MemberIcon';
import PublishIcon from '@/images/icons/PublishIcon';
import PendingIcon from '@/images/icons/PendingIcon';
import {
  ACCESS_ALL_PROJECT,
  ACCESS_ALL_USER,
  DENY_ENTERPRISE,
  DENY_FREE,
  DENY_USER,
  ONLY_BUSINESS,
  ONLY_ENTERPRISE,
  PERSONAL_BUSINESS,
} from '@/constants/acess';

type Menu = {
  cate: string;
  link: string;
  icon: ReactNode;
};
declare global {
  type StatusOfUser = 'superadmin' | 'owner' | 'admin' | 'user';
  type StatusOfProject = 'enterprise' | 'business' | 'personal' | 'free';
}

type SideMenu = {
  cate: string;
  subCate: string;
  link?: string;
  hasItem?: boolean;
  items?: Menu[];
  icon?: ReactNode;
  visibleTo: {
    user: Array<StatusOfUser>;
    project: Array<StatusOfProject>;
  };
};

export const SIDE_MENUS: SideMenu[] = [
  {
    cate: 'Manage',
    subCate: 'Overview',
    link: '/manage',
    icon: <DashboardIcon />,
    visibleTo: {
      user: DENY_USER,
      project: ACCESS_ALL_PROJECT,
    },
  },
  {
    cate: 'Manage',
    subCate: 'My Exhibitions',
    link: '/manage/my-exhibitions',
    icon: <PeopleSafeOneIcon />,
    visibleTo: {
      user: ACCESS_ALL_USER,
      project: ACCESS_ALL_PROJECT,
    },
  },
  {
    cate: 'Manage',
    subCate: 'Channel Setting',
    link: '/manage/channel-setting',
    icon: <SettingIcon />,
    visibleTo: {
      user: DENY_USER,
      project: PERSONAL_BUSINESS,
    },
  },
  {
    cate: 'Manage',
    subCate: 'Layout & Design',
    link: '/manage/layout-design',
    icon: <OptimizeIcon />,
    visibleTo: {
      user: DENY_USER,
      project: [...ONLY_BUSINESS, ...ONLY_ENTERPRISE],
    },
  },
  // {
  //   cate: 'Manage',
  //   subCate: 'Layout & Design',
  //   link: '/manage/layout-design',
  //   icon: <ImageMultiIcon />,
  //   visibleTo: {
  //     user: DENY_USER,
  //     project: ONLY_BUSINESS
  //   }
  // },
  {
    cate: 'Manage',
    subCate: 'Administrators',
    link: '/manage/administrators',
    icon: <AdminIcon />,
    visibleTo: {
      user: DENY_USER,
      project: DENY_FREE,
    },
  },
  {
    cate: 'Manage',
    subCate: 'Members',
    link: '/manage/members',
    icon: <MemberIcon />,
    visibleTo: {
      user: DENY_USER,
      project: ONLY_ENTERPRISE,
    },
  },
  {
    cate: 'Manage',
    subCate: 'Exhibition Status',
    link: '/manage/exhibition-status',
    icon: <PublishIcon />,
    visibleTo: {
      user: DENY_USER,
      project: DENY_FREE,
    },
  },
  {
    cate: 'Manage',
    subCate: 'Previous Exhibitions',
    link: '/manage/previous-exhibitions',
    icon: <PendingIcon />,
    visibleTo: {
      user: DENY_USER,
      project: ACCESS_ALL_PROJECT,
    },
  },
];

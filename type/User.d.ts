import { Timestamp } from 'firebase/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { COUNTRIES } from '@/constants/countryCode';

export interface TERMS {
  termC_1: boolean; // (필수) 이용약관 동의
  termC_2: boolean; // (필수) 개인정보 수집 및 이용 동의
}

export interface UserProjectList {
  id: string;
  status: 'owner' | 'admin' | 'user';
}

export class User {
  uid: string;

  social: string;
  email: string;
  userName: string;
  countryCodeText: string;
  countryCode: string;
  phone: string;

  avatar: string;
  information: string;

  survey: {
    referrer:
      | 'exhibition'
      | 'lecture'
      | 'education'
      | 'search'
      | 'etc'
      | 'none'
      | 'admin_invite'
      | 'user_invite'
      | 'old_user';
    refEtcText: string;
  };

  status: 'superadmin' | 'general'; //플랫폼의 Role

  projects: UserProjectList[];

  history?: {
    ip: string;
    useragent: string;
    country: string;
    date: Timestamp | null;
  };

  paymentStatus: {
    paid: boolean;
    billingKey: boolean;
  };

  alarmStatus: {
    email: boolean;
    kakao: boolean;
    marketing: boolean;
  };

  terms: TERMS;

  createdAt?: any;
  updatedAt?: any;

  // Project user only
  password?: string;

  // 채널 생성 전까지 임시 channelName holder
  channelName?: string;

  // 전시 할당된 갯수 및 현재 만든 전시 갯수
  assignedCount?: number;
  exhibitionCount?: number;

  constructor(userData: {
    uid: string;

    social: 'kakao' | 'google' | 'email';
    email: string;
    userName: string;
    countryCodeText: string;
    countryCode: string;
    phone: string;

    avatar: string;
    information: string;

    survey: {
      referrer: 'exhibition' | 'lecture' | 'education' | 'search' | 'etc' | 'none' | 'admin_invite' | 'user_invite';
      refEtcText: string;
    };

    status: 'superadmin' | 'general'; //플랫폼의 Role

    projects: UserProjectList[];

    history?: {
      ip: string;
      useragent: string;
      country: string;
      date: Timestamp | null;
    };

    paymentStatus: {
      paid: boolean;
      billingKey: boolean;
    };

    alarmStatus: {
      email: boolean;
      kakao: boolean;
      marketing: boolean;
    };

    terms: TERMS;

    createdAt?: any;
    updatedAt?: any;

    // Project user only
    password?: string;

    // 채널 생성 전까지 임시 channelName holder
    channelName?: string;

    // 전시 할당된 갯수 및 현재 만든 전시 갯수
    assignedCount?: number;
    exhibitionCount?: number;
  }) {
    this.uid = userData.uid;
    this.social = userData.social;
    this.email = userData.email;
    this.userName = userData.userName;
    this.countryCodeText = userData.countryCodeText;
    this.countryCode = userData.countryCode;
    this.phone = userData.phone;
    this.avatar = userData.avatar;
    this.information = userData.information;
    this.survey = userData.survey;
    this.status = userData.status;
    this.projects = userData.projects;
    this.history = userData.history;
    this.paymentStatus = userData.paymentStatus;
    this.alarmStatus = userData.alarmStatus;
    this.terms = userData.terms;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
    this.channelName = userData.channelName;
    this.assignedCount = userData.assignedCount;
    this.exhibitionCount = userData.exhibitionCount;

    if (userData.password !== undefined) {
      this.password = userData.password;
    }
  }

  static createUser(
    uid: string,
    userName: string,
    email: string,
    social: string = 'email',
    terms: TERMS,
    marketing: boolean,
    countryCodeText: string,
    phone: string,
    referrer: string,
    refEtcText: string,
    channelName: string,
    projects: UserProjectList[]
  ): User {
    return new User({
      uid: uid,

      social: social as 'kakao' | 'google' | 'email',
      email: email,
      userName: userName,
      countryCodeText: countryCodeText,
      countryCode: COUNTRIES.find((country) => country.name === countryCodeText)?.countryCode || '',
      phone: phone,

      avatar: '',
      information: '',

      survey: {
        referrer: referrer as 'exhibition' | 'lecture' | 'education' | 'search' | 'etc' | 'none' | 'admin_invite',
        refEtcText: refEtcText,
      },

      status: 'general', //플랫폼의 Role

      projects: projects,

      history: {
        ip: '',
        useragent: '',
        country: '',
        date: Timestamp.now(),
      },

      paymentStatus: {
        paid: false,
        billingKey: false,
      },

      alarmStatus: {
        email: true,
        kakao: true,
        marketing: marketing,
      },

      terms: terms,

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      channelName: channelName,

      assignedCount: 3, // 프로젝트 config의 initialAssignedCount 와 동일
      exhibitionCount: 0,
    });
  }

  static createProjectAdmin(
    uid: string,
    userName: string,
    email: string,
    social: string = 'email',
    terms: TERMS,
    countryCodeText: string,
    phone: string
  ): User {
    const emptyProject = {
      id: '',
      status: 'admin',
    };

    return new User({
      uid: uid,
      email: email,
      userName: userName,
      phone: phone,
      social: social as 'kakao' | 'google' | 'email',

      avatar: '',
      information: '',
      status: 'general',
      countryCodeText: countryCodeText,
      countryCode: COUNTRIES.find((country) => country.name === countryCodeText)?.countryCode || '',
      projects: [emptyProject as any],

      survey: {
        referrer: 'admin_invite',
        refEtcText: '',
      },
      history: {
        ip: '',
        useragent: '',
        country: '',
        date: Timestamp.now(),
      },
      paymentStatus: {
        paid: false,
        billingKey: false,
      },
      alarmStatus: {
        email: false,
        kakao: false,
        marketing: false,
      },
      terms: terms,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      channelName: '',
    });
  }

  static createProjectUser(
    userName: string,
    email: string,
    social: string = 'email',
    countryCodeText: string,
    phone: string,
    terms: TERMS,
    project: UserProjectList,
    password: string,
    initialAssignedCount: number
  ): User {
    return new User({
      uid: '',
      email: email,
      userName: userName,
      countryCodeText: countryCodeText,
      countryCode: COUNTRIES.find((country) => country.name === countryCodeText)?.countryCode || '',
      phone: phone,
      social: social as 'kakao' | 'google' | 'email',

      avatar: '',
      information: '',
      status: 'general',
      projects: [project],

      survey: {
        referrer: 'user_invite',
        refEtcText: '',
      },
      history: {
        ip: '',
        useragent: '',
        country: '',
        date: Timestamp.now(),
      },
      paymentStatus: {
        paid: false,
        billingKey: false,
      },
      alarmStatus: {
        email: false,
        kakao: false,
        marketing: false,
      },
      terms: terms,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      channelName: '',
      password: password,
      assignedCount: initialAssignedCount,
    });
  }

  static inviteProjectUser(uid: string, projectId: string, email: string, status: string, assignedCount: number): User {
    const invitedProject = {
      id: projectId,
      status: status,
    };

    return new User({
      uid: uid,
      email: email,
      userName: 'anonymous',
      countryCodeText: '',
      countryCode: '',
      phone: '',
      social: 'email',
      avatar: '',
      information: '',
      status: 'general',
      projects: [invitedProject as any],
      survey: {
        referrer: 'user_invite',
        refEtcText: '',
      },
      history: {
        ip: '',
        useragent: '',
        country: '',
        date: Timestamp.now(),
      },
      paymentStatus: {
        paid: false,
        billingKey: false,
      },
      alarmStatus: {
        email: false,
        kakao: false,
        marketing: false,
      },
      terms: {
        termC_1: false,
        termC_2: false,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      channelName: '',
      assignedCount: assignedCount,
      password: '',
      exhibitionCount: 0,
    });
  }
}

type UserProjectList = {
  id: string;
  // 개별 Project에서의 Role
  status: 'owner' | 'admin' | 'user';
};

declare global {
  type Social = 'kakao' | 'google' | 'email' | 'none';
  type UserStatus = 'superadmin' | 'general' | 'none';
  type UserInfo = {
    uid: string;

    // 회원가입 정보
    social: Social;
    email: string;
    userName: string;
    countryCodeText: string;
    countryCode: string;
    phone: string;

    // 프로필 정보. 현재 사용 x
    avatar: string;
    information: string;

    // 회원가입시 조사한 정보
    survey: {
      referrer: 'exhibition' | 'lecture' | 'education' | 'search' | 'etc' | 'none' | 'admin_invite' | 'user_invite' | 'old_user' | 'old_user_name_updated';
      refEtcText: string;
    };

    // Onthewall Platform Role
    status: UserStatus;

    // 소속 프로젝트 정보
    projects: UserProjectList[];

    // 최근 접속 기록
    history?: {
      ip: string;
      useragent: string;
      country: string;
      date: Timestamp;
    };

    paymentStatus: {
      paid: boolean;
      billingKey: boolean;
    };

    alarmStatus: {
      email: boolean;
      kakao: boolean;
      marketing: boolean;
    };

    terms: TERMS;

    createdAt?: any;
    updatedAt?: any;

    // Project user only
    password?: string;

    // 채널 생성 전까지 임시 channelName holder
    channelName?: string;
  };
}

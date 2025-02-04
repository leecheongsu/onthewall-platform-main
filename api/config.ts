import axios from 'axios';

export const Config = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FUNCTION_END_POINT || '',
  // baseURL: process.env.NEXT_PUBLIC_LOCAL_END_POINT || '',
});

Config.defaults.headers.patch['Content-Type'] = 'application/json';
Config.interceptors.response.use(
  (res) => {
    if (res && res.data) {
      return res;
    } else {
      return Promise.reject(new Error('Empty response or other error'));
    }
  },
  (error) => {
    // 에러 처리
    /* TODO: Error Handler */
    return Promise.reject(error);
  }
);

export const CloudApiConfig = axios.create({
  // baseURL: `${process.env.NEXT_PUBLIC_LOCAL_END_POINT}/rest` || '',
  baseURL: `${process.env.NEXT_PUBLIC_FUNCTION_END_POINT}/rest` || '',
});

CloudApiConfig.defaults.headers.patch['Content-Type'] = 'application/json';
CloudApiConfig.interceptors.response.use(
  (res) => {
    if (res && res.data) {
      return res;
    } else {
      return Promise.reject(new Error('Empty response or other error'));
    }
  },
  (error) => {
    // 에러 처리
    /* TODO: Error Handler */
    return Promise.reject(error);
  }
);

const createAxiosInstance = (baseURL: string, contentType: string) => {
  const instance = axios.create({ baseURL });

  instance.defaults.headers.patch['Content-Type'] = contentType;
  instance.interceptors.response.use(
    (res) => {
      if (res && res.data) {
        return contentType === 'text/html' ? res.data : res;
      } else {
        return Promise.reject(new Error('Empty response or other error'));
      }
    },
    (error) => {
      // TODO: Error Handler
      return Promise.reject(error);
    }
  );

  return instance;
};

const baseURL = process.env.NEXT_PUBLIC_MODULE_END_POINT || '';
// const baseURL = `http://127.0.0.1:5001/gd-virtual-staging/asia-northeast3`;

export const ModuleApiConfig = createAxiosInstance(baseURL, 'application/json');
export const ModuleJsonApiConfig = createAxiosInstance(`${baseURL}/otwm`, 'application/json');
export const ModuleTextApiConfig = createAxiosInstance(`${baseURL}/otwm`, 'text/html');

export const AuthErrorHandler = (e: any) => {
  switch (e.code) {
    case 'auth/user-not-found':
      alert('User not found');
      break;
    case 'auth/wrong-password':
      alert('Please check your password');
      break;
    case 'auth/too-many-requests':
      alert('Please try again later');
      break;
    case 'auth/cancelled-popup-request':
      console.log('Intractable bug')
      break;
    case 'user/no-data':
      alert(e.message);
      break;
    case 'ERR_BAD_REQUEST':
      alert(e.response.data.meta.message);
      break;
    default:
      alert('An unexpected error occurred');
  }
};

import { useState, useEffect } from 'react';

type CookieOptions = {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
};

type UseCookiesReturn = [
    (name: string) => string | undefined,
    (name: string, value: string, options?: CookieOptions) => void,
    (name: string) => void
];

const parseCookies = (cookieString?: string): Record<string, string> => {
    if (!cookieString) return {};

    return cookieString.split('; ').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=');
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        return cookies;
    }, {} as Record<string, string>);
};

export const useCookies = (): UseCookiesReturn => {
    const [cookies, setCookies] = useState<Record<string, string>>({});

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const initialCookies = parseCookies(document.cookie);
            setCookies(initialCookies);
        }
    }, []);

    const getCookie = (name: string): string | undefined => {
        return cookies[name];
    };

    const setCookie = (name: string, value: string, options?: CookieOptions): void => {
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (options) {
            if (options.path) {
                cookieString += `; path=${options.path}`;
            }
            if (options.expires) {
                cookieString += `; expires=${options.expires.toUTCString()}`;
            }
            if (options.maxAge) {
                cookieString += `; max-age=${options.maxAge}`;
            }
            if (options.domain) {
                cookieString += `; domain=${options.domain}`;
            }
            if (options.secure) {
                cookieString += `; secure`;
            }
            if (options.sameSite) {
                cookieString += `; samesite=${options.sameSite}`;
            }
        }

        if (typeof document !== 'undefined') {
            document.cookie = cookieString;
            setCookies(parseCookies(document.cookie));
        }
    };

    const removeCookie = (name: string): void => {
        setCookie(name, '', { maxAge: -1 });
    };

    return [getCookie, setCookie, removeCookie];
};

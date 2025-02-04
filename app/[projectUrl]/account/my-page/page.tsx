'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginInfo from '@/components/account/mypage/LoginInfo';
import UserInfo from '@/components/account/mypage/UserInfo';
import Subscribe from '@/components/account/mypage/Subscribe';
import Payments from '@/components/account/mypage/Payments';
import Settings from '@/components/account/mypage/Settings';

export default function Page() {
	const [currentTab, setCurrentTab] = useState('login-info');
	const searchParams = useSearchParams();

	useEffect(() => {
		const tab = searchParams?.get('tab') ?? 'login-info';
		setCurrentTab(tab);
	}, [searchParams?.get('tab')]);
	return (
		<>
			{currentTab === 'login-info' && <LoginInfo />}
			{currentTab === 'user-info' && <UserInfo />}
			{currentTab === 'subscribe' && <Subscribe />}
			{currentTab === 'payments' && <Payments />}
			{currentTab === 'settings' && <Settings />}
		</>
	);
}

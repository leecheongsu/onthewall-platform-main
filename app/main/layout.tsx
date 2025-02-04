'use client';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';

interface Props {
	children: ReactNode;
}

function MainLayout({ children }: Props) {
	const router = useRouter();
	useEffect(() => {
		router.push('/home');
	}, []);
	return <>{children}</>;
}

export default MainLayout;

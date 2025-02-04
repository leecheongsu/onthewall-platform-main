'use client';

import React, { ReactNode, useEffect } from 'react';

import Footer from '@/components/layouts/Footer';
import CommonHeader from '@/components/layouts/CommonHeader';
import styled from '@emotion/styled';
import { useDesignStore } from '@/store/design';

interface Props {
	children: ReactNode;
}

const AccountLayout = ({ children }: Props) => {
	const [height, setHeight] = React.useState(0);
	const { setDefaultDesignData } = useDesignStore(state => state);
	useEffect(() => {
		const updateHeight = () => {
			const footer = document.querySelector('footer')?.clientHeight || 0;
			setHeight(footer);
		};
		updateHeight();
		setDefaultDesignData();
	}, []);
	return (
		<>
			<CommonHeader />
			<Container height={height}>{children}</Container>
			<Footer />
		</>
	);
};

export default AccountLayout;

const Container = styled.section<{ height?: any }>`
	padding: 60px 20px 0;
	max-width: 1200px;
	width: 100vw;
	margin: 0 auto;
	min-height: calc(100vh - ${props => props?.height}px);
	display: flex;
	justify-content: center;
	align-items: flex-start;
`;

'use client';
import React, { ReactNode, useEffect } from 'react';

import Footer from '@/components/layouts/Footer';
import ManagePageHeader from '@/components/layouts/ManagePageHeader';
import styled from '@emotion/styled';

interface Props {
	children: ReactNode;
}

const AccountLayout = ({ children }: Props) => {
	const [height, setHeight] = React.useState(0);

	useEffect(() => {
		const updateHeight = () => {
			const footer = document.querySelector('footer')?.clientHeight || 0;
			setHeight(footer);
		};
		updateHeight();
	}, []);

	return (
		<>
			<ManagePageHeader />
			<Container height={height}>
				<section>{children}</section>
			</Container>
			<Footer />
		</>
	);
};

export default AccountLayout;

const Container = styled.section<{ height?: any }>`
	min-height: calc(100vh - ${props => props?.height}px);
	padding-top: 60px;
`;

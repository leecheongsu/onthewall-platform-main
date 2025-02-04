'use client';
import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

// lib
import { useTranslation } from 'react-i18next';

import MyPageNav from '@/components/account/mypage/MyPageNav';
import LoginGuard from '@/components/Guard/LoginGuard';
import { useDesignStore } from '@/store/design';

interface Props {
	children: ReactNode;
}

const AccountLayout = ({ children }: Props) => {
	const { i18n, t } = useTranslation();
	const { theme } = useDesignStore(state => state);
	return (
		<>
			<LoginGuard>
				<Container style={{ backgroundColor: theme.secondary }}>
					<Header>{t('My Page')}</Header>
					<Body>
						<MyPageNav />
						<Contents>{children}</Contents>
					</Body>
				</Container>
			</LoginGuard>
		</>
	);
};

export default AccountLayout;

const Container = styled.div`
	height: calc(100vh - 260px);
	display: flex;
	flex-direction: column;
`;

const Header = styled.div`
	font-size: 24px;
	font-weight: bold;
	padding: 20px;
	text-align: center;
`;
const Body = styled.div`
	display: flex;
	justify-content: center;
	gap: 24px;
	@media screen and (max-width: 768px) {
		flex-direction: column;
		gap: 0;
		align-items: center;
		// 위아래 순서 변경
	}
`;
const Contents = styled.section`
	background-color: white;
	width: 760px;
	max-width: calc(100vw - 238px);
	min-height: 500px;
	max-height: calc(100vh - 441px);
	overflow: auto;

	// scrollbar style
	&::-webkit-scrollbar {
		width: 4px;
	}
	&::-webkit-scrollbar-thumb {
		background-color: #d1d5db;
		border-radius: 4px;
	}
	&::-webkit-scrollbar-track {
		background-color: #f2f4f9;
	}
	@media screen and (max-width: 768px) {
		max-width: calc(100vw - 52px);
	}
`;

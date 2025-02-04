'use client';
import React from 'react';
import styled from '@emotion/styled';

type Props = {
	children: React.ReactNode;
};

function layout({ children }: Props) {
	const [height, setHeight] = React.useState(0);

	React.useEffect(() => {
		const updateHeight = () => {
			const footer = document.querySelector('footer')?.clientHeight || 0;
			setHeight(footer);
		};
		updateHeight();
	}, []);
	return <Container height={height}>{children}</Container>;
}

export default layout;

const Container = styled.section<{ height?: any }>`
	padding: 0 20px;
	max-width: 1200px;
	width: 100vw;
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: calc(100vh - ${props => props?.height + 60}px);
`;

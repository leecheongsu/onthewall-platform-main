import React from 'react';
import styled from '@emotion/styled';
type Props = {
	height?: number;
};

function EmptySpace({ height = 30 }: Props) {
	return <Container height={height}></Container>;
}

export default EmptySpace;

const Container = styled.div<Props>`
	height: ${props => props.height}px;
`;

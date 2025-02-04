import React from 'react';
import styled from '@emotion/styled';

type Props = {
	header?: string;
	type?: 'number' | 'fraction'; // 숫자, 분수
	value?: Array<number>;
	imageSrc?: string;
	description?: string;
	increase?: boolean;
};

function DashboardCard({
	header = 'Active exhibitions',
	type = 'fraction',
	value = [12, 30],
	imageSrc = '',
	description = '8.5% Up from yesterday',
	increase = true,
}: Props) {
	return (
		<Container>
			<Top>
				<Left>
					<Header>{header}</Header>
					<Info>
						<Value1>{value[0]}</Value1>
						{type === 'fraction' && <Value2> / {value[1]}</Value2>}
					</Info>
				</Left>
				<Right>
					<Image src={imageSrc} />
				</Right>
			</Top>
			{/* <Bottom>
				<Description>{description}</Description>
			</Bottom> */}
		</Container>
	);
}

export default DashboardCard;

const Container = styled.div`
	width: 100%;
	height: 141px;
	padding: 30px;
	background-color: white;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const Header = styled.h2`
	font-size: 16px;
	font-weight: 500;
	margin-bottom: 20px;
	color: #88909c;
`;

const Info = styled.div`
	font-size: 28px;
	font-weight: 500;
	color: #2d3748;
	line-height: 20px;
`;

const Value1 = styled.span`
	font-size: 28px;
	font-weight: 500;
	color: #202224;
`;
const Value2 = styled.span`
	font-size: 16px;
	font-weight: 500;
	color: #202224;
`;

const Description = styled.div`
	font-size: 16px;
	color: #12163c;
	font-weight: 600;
`;

const Top = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
`;

const Left = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0px;
`;

const Right = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Image = styled.img`
	width: 60px;
	height: 60px;
	object-fit: cover;
`;

const Bottom = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

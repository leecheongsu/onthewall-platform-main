"use client";

//react
import { useEffect, useState } from "react";

// lib
import Skeleton from "react-loading-skeleton";

//style
import styled from "@emotion/styled";

interface Props {
	channelData: string;
}

const ChannelBanner = ({ channelData }: Props) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (channelData) {
			setTimeout(() => {
				setLoading(false);
			}, 1000);
		}
	}, [channelData]);

	return (
		// 임시 배너 없어질 예정
		<Wrapper>
			<Box>
				{loading ? <Skeleton height={200} /> : <img src={channelData} className="Channel_banner" />}
			</Box>
		</Wrapper>
	);
};

export default ChannelBanner;

const Wrapper = styled.div`
	border-radius: 6px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	height: 200px;
	overflow: hidden;
	border-radius: 6px;

	@media (max-width: 768px) {
		height: auto;
	}
`;

const Box = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 10px;
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}
`;

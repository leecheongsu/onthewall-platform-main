import styled from "@emotion/styled";

interface Props {
	value: string;
}

function ManageTitle({ value }: Props) {
	return <Text>{value}</Text>;
}

export default ManageTitle;

const Text = styled.h2`
	color: #0f1a2a;
	font-feature-settings: "clig" off, "liga" off;
	font-size: 24px;
	font-style: normal;
	font-weight: 700;
	line-height: 40px;
	letter-spacing: -1px;
	margin-bottom: 20px;
`;

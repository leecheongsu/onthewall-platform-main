import styled from "@emotion/styled";
import React from "react";
import { Button } from "@mui/material";

interface ToastProps {
	label: string;
	onClick: () => void;
}

interface Props {
	state: boolean;
	toastConf: ToastProps[];
}

function Toast({ state, toastConf }: Props) {
	return (
		<>
			{state && (
				<Box>
					{toastConf.map((props, index) => {
						return (
							<LabelButton
								key={index}
								type="button"
								onClick={props.onClick}
								// theme="primary"
								// variant="contained"
							>
								{props.label}
							</LabelButton>
						);
					})}
				</Box>
			)}
		</>
	);
}

export default Toast;

const Box = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 4px;
	background-color: #fff;
	box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
	position: absolute;
	z-index: 999;
	left: 50%;
	transform: translateX(-50%);
	min-width: 250px;
	gap: 5px;
	padding: 10px;
`;

const LabelButton = styled(Button)`
	color: #000000;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: 22px;
	width: 100%;
	&:hover {
		background-color: #fff;
	}
`;

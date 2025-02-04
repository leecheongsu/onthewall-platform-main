import React, { useState } from "react";

// lib
import { SketchPicker } from "react-color";
import { useTranslation } from "react-i18next";

// mui
import { Button } from "@mui/material";

// style
import styled from "@emotion/styled";

interface StyleProps {
	color: string;
}

type Props = {
	color: string;
	setColor: React.Dispatch<string>;
};

function ColorButton({ color, setColor }: Props) {
	const { i18n, t } = useTranslation();
	const [open, setOpen] = useState(false);

	const toggleModal = () => {
		setOpen(prev => !prev);
	};

	return (
		<>
			<Root>
				<Wapper onClick={toggleModal}>
					<ColorPresenter color={color} />
				</Wapper>
				{open && (
					<Button
						variant="outlined"
						onClick={() => setOpen(false)}
						sx={{
							wordBreak: "keep-all",
							marginLeft: "10px",
							color: color,
							borderColor: color,
						}}
					>
						{t("Select")}
					</Button>
				)}
				{open && (
					<div style={{ position: "absolute", top: "0px", left: "140px", zIndex: 10 }}>
						<SketchPicker
							color={color}
							disableAlpha={true}
							onChangeComplete={color => {
								setColor(color.hex);
							}}
							onChange={color => {
								setColor(color.hex);
							}}
						/>
					</div>
				)}
			</Root>
		</>
	);
}

export default ColorButton;

const Root = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 10px;
`;

const Wapper = styled.div`
	border: 1px solid grey;
	border-radius: 3px;
	cursor: pointer;
	display: inline-block;
`;

const ColorPresenter = styled.div`
	background-color: ${(props: { color: string }) => props.color};
	width: 35px;
	height: 35px;
	margin: 6px;
`;

import React from "react";
import { Tabs, Tab } from "@mui/material";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
type Props = {
	value: number;
	setValue: React.Dispatch<React.SetStateAction<number>>;
};

function TabsComponent({ value, setValue }: Props) {
	const { t } = useTranslation();
	return (
		<>
			<Tabs variant="standard" value={value}>
				<Tab
					label={t("Exhibition")}
					value={0}
					onClick={() => {
						setValue(0);
					}}
				/>
				<Tab
					label={t("Information")}
					value={1}
					onClick={() => {
						setValue(1);
					}}
				/>
			</Tabs>
			<TabBorder />
		</>
	);
}

export default TabsComponent;
const TabBorder = styled.div`
	width: 100%;
	height: 2px;
	background-color: #efefef;
	margin-top: -2px;
`;

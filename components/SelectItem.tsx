import React, { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
type SelectItem = {
	title: string;
	value: any;
};
type Props = {
	items: Array<SelectItem>;
	onChange: (e: any) => void;
	value: any;
	label?: string;
	fullWidth?: boolean;
	bgColor?: string;
	minWidth?: number;
	name?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
};

function SelectItem({
	items,
	onChange,
	value,
	label,
	fullWidth,
	bgColor = '',
	minWidth = 120,
	name = '',
	style,
	disabled,
}: Props) {
	return (
		<Box sx={{ width: fullWidth ? '100%' : minWidth, minWidth }}>
			<FormControl variant="outlined" size="small" fullWidth>
				<InputLabel
					id={`${label}-label`}
					style={{ backgroundColor: bgColor !== '' ? bgColor : 'white' }}
				>
					{label}
				</InputLabel>
				<Select
					labelId={`${label}-label`}
					value={value}
					onChange={onChange}
					IconComponent={ExpandMoreIcon}
					style={{ width: '100%', ...style }}
					disabled={disabled}
					name={name}
					MenuProps={{
						disableScrollLock: true,
					}}
				>
					{items.map((item: SelectItem, index) =>
						!item.value ? null : (
							<MenuItem value={item.value} key={index}>
								{item.title}
							</MenuItem>
						),
					)}
				</Select>
			</FormControl>
		</Box>
	);
}

export default SelectItem;

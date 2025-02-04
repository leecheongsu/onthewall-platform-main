import React from 'react';
import { TextField } from '@mui/material';
type Props = {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	disabled?: boolean;
	setValue?: React.Dispatch<React.SetStateAction<string>>;
	[key: string]: any;
};

function _TextField({ value, onChange, placeholder, disabled, setValue, ...rest }: Props) {
	return (
		<TextField
			size="small"
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			disabled={disabled}
			{...rest}
		/>
	);
}

export default _TextField;

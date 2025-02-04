import * as React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

type Props = {
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	[key: string]: any;
};

export default function CustomizedSwitches({ checked, onChange, ...rest }: Props) {
	return <AntSwitch size="small" checked={checked} onChange={onChange} {...rest} />;
}

const AntSwitch = styled(Switch)(({ theme }) => ({
	width: 24,
	height: 12,
	padding: 0,
	display: 'flex',
	margin: 8,
	'&:active': {
		'& .MuiSwitch-thumb': {
			width: 15,
		},
		'& .MuiSwitch-switchBase.Mui-checked': {
			transform: 'translateX(9px)',
		},
	},
	'& .MuiSwitch-switchBase': {
		padding: 2,
		'&.Mui-checked': {
			transform: 'translateX(12px)',
			color: '#fff',
			'& + .MuiSwitch-track': {
				opacity: 1,
			},
		},
	},
	'& .MuiSwitch-thumb': {
		boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
		// margin: ,
		width: 8,
		height: 8,
		borderRadius: 4,
		transition: theme.transitions.create(['width'], {
			duration: 200,
		}),
	},
	'& .MuiSwitch-track': {
		borderRadius: 16 / 2,
		opacity: 1,
		backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
		boxSizing: 'border-box',
	},
}));

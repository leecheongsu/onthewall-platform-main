import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { isValidEmail } from '@/utils/validation';
import FormInput from '@/components/FormInput';
import CheckIcon from '@/images/icons/Check';
import PlusIcon from '@/images/icons/Plus';
import { Button, Chip, MenuItem, Select } from '@mui/material';
import CircleWarningIcon from '@/images/icons/CircelWanring';
import { useDesignStore } from '@/store/design';
import NoticeIcon from '@/images/icons/Notice';
import { useTranslation } from 'react-i18next';

interface Props {
	value: string[];
	setValue: (value: string[]) => void;
	maxCount: number;
}

export const Invite = ({ value, setValue, maxCount }: Props) => {
	const { i18n, t } = useTranslation();
	const color = useDesignStore(state => state.theme);
	const [email, setEmail] = useState('');

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setEmail(value);
	};

	const handleAddButton = () => {
		if(value.length === maxCount) {
			alert('No more invites administrators')
			return;
		}

		if (isValidEmail(email) && value.length < maxCount) {
			setValue([...value, email]);
			setEmail('');
		}
	};

	const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddButton();
		}
	};

	const handleOnDelete = (index: number) => {
		setValue(value.filter((_, i) => i !== index));
	};

	return (
		<>
			<ButtonBox color={color.primary}>
				<TextButton onClick={handleAddButton} theme="primary" variant="outlined">
					<PlusIcon className="w-3 h-3" />
					{''}
					{t('Add')}
				</TextButton>
			</ButtonBox>
			<FormInput
				name="email"
				width="calc(100% * 2/3)"
				placeholder={t('Enter E-mail')}
				value={email}
				onChange={handleChange}
				onKeyDown={handleOnKeyDown}
			/>
			<ChipBox>
				{value.map((email, index) => (
					<SizedChip key={index} label={email} onDelete={() => handleOnDelete(index)} />
				))}
			</ChipBox>
		</>
	);
};

export interface RemoveCancelProps {
	action: 'Remove' | 'Cancel';
	name?: string;
	role?: string;
}

export const RemoveCancel = ({ name, action, role = 'administrators' }: RemoveCancelProps) => {
	const { i18n, t } = useTranslation();
	const color = useDesignStore(state => state.theme);
	const [title, setTitle] = useState('');
	const [text, setText] = useState('');

	useEffect(() => {
		if (action === 'Remove') {
			setTitle(t(`Are you sure you want to remove ${name} <br /> from the ${role}?`));
			setText(t(`This action cannot be undone.`));
		} else {
			setTitle(t('Are you sure you want to <br /> cancel the invitation?'));
			setText(t('Once canceled, the invitation cannot be used.'));
		}
	}, []);

	return (
		<Box>
			<Notice color={color.primary}>
				<NoticeIcon className="w-10 h-10" />
			</Notice>
			<Title dangerouslySetInnerHTML={{ __html: title }} />
			<Text>{text}</Text>
		</Box>
	);
};

export interface ModifyProps {
	name?: string;
	max?: number;
	selected: number;
	onSelected: (v: number) => void;
}

export const Modify = ({ name, max = 10, selected, onSelected }: ModifyProps) => {
	const { i18n, t } = useTranslation();
	const menuItems = [0, ...Array.from({ length: max }, (_, index) => index + 1)];
	const [maxCount, setMaxCount] = useState(selected);

	const handleMaxCount = (v: number) => {
		setMaxCount(v);
		onSelected(v);
	};

	return (
		<SelectBox>
			<Typography>
				{t('User Name')} : {name}
			</Typography>
			<CustomSelect value={maxCount} onChange={e => handleMaxCount(Number(e.target.value))}>
				{menuItems.map(item => (
					<MenuItem key={item} value={item}>
						{item}
					</MenuItem>
				))}
			</CustomSelect>
		</SelectBox>
	);
};

const ButtonBox = styled.div<{ color?: any }>`
	width: calc(100% * 2 / 3);
	display: flex;
	justify-content: flex-end;
	margin-bottom: -0.5rem;
	& svg {
		stroke: ${props => props.color};
	}
`;

const Notice = styled.div<{ color?: any }>`
	margin-bottom: 1rem;
	& svg {
		stroke: ${props => props.color};
	}
`;

const TextButton = styled(Button)`
	font-size: 13px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
`;

const ChipBox = styled.div`
	width: calc(100% * 2 / 3);
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
`;

const SizedChip = styled(Chip)`
	padding-left: 0.25rem;
	padding-right: 0.25rem;
	font-size: 10px;
`;

const Box = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	text-align: center;
`;

const Title = styled.span`
	color: #1e2a3b;
	text-align: center;
	font-size: 24px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
`;

const Text = styled.span`
	font-size: 14px;
	margin-top: 0.75rem;
	margin-bottom: 2rem;
`;

const Typography = styled.span`
	color: #1e2a3b;
	text-align: center;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 180%;
	letter-spacing: -0.32px;
	margin-bottom: 3vh;
`;

const SelectBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const CustomSelect = styled(Select)`
	display: flex;
	width: 153px;
	height: 53px;
	padding: 10px 20px;
	align-items: center;
	gap: 10px;
	flex-shrink: 0;
	color: #64748b;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: 22px;
	border: 1px solid #ccc;
	border-radius: 5px;
	margin-bottom: 3vh;
`;

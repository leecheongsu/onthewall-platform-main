interface Props {
	className?: string;
}

const UserIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className={className}
				viewBox="0 0 24 24"
				fill="none"
				style={{ width: '22px', height: '22px' }}
			>
				<path
					d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z"
					stroke="#333333"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M21 22C21 17.0294 16.9706 13 12 13C7.02945 13 3 17.0294 3 22"
					stroke="#333333"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</>
	);
};

export default UserIcon;

interface Props {
	className?: string;
}

const DashboardIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 25"
				fill="none"
				className={className}
				style={{ width: '22px', height: '22px' }}
			>
				<path d="M9 3.5H3V9.5H9V3.5Z" stroke="#333333" strokeWidth="1.5" strokeLinejoin="round" />
				<path
					d="M9 15.5H3V21.5H9V15.5Z"
					stroke="#333333"
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
				<path
					d="M21 15.5H15V21.5H21V15.5Z"
					stroke="#333333"
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
				<path
					d="M21 3.5H15V9.5H21V3.5Z"
					stroke="#333333"
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
				<path d="M12 3.5V12.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
				<path d="M12 15.5V21.5" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
				<path d="M12 12.5H3" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
				<path d="M21 12.5H15" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
			</svg>
		</>
	);
};

export default DashboardIcon;

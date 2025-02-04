interface Props {
	className?: string;
}

const PeopleSafeOneIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className={className}
				viewBox="0 0 24 25"
				fill="none"
				style={{ width: '22px', height: '22px' }}
			>
				<path
					d="M12 9.5C13.933 9.5 15.5 7.933 15.5 6C15.5 4.067 13.933 2.5 12 2.5C10.067 2.5 8.5 4.067 8.5 6C8.5 7.933 10.067 9.5 12 9.5Z"
					stroke="#333333"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M2 21C2 16.5817 6.02945 13 11 13"
					stroke="#333333"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M14 15.1C14 14.5667 17.5 13.5 17.5 13.5C17.5 13.5 21 14.5667 21 15.1C21 19.3667 17.5 21.5 17.5 21.5C17.5 21.5 14 19.3667 14 15.1Z"
					stroke="#333333"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</>
	);
};

export default PeopleSafeOneIcon;

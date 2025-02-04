interface Props {
	className?: string;
	isActive?: boolean;
}

const ArrowDownIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				width="36"
				height="36"
				viewBox="0 0 36 36"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={className}
				style={{ width: '22px', height: '22px' }}
			>
				<rect width="36" height="36" rx="5" fill="#f0f0f0" />
				<path
					d="M11.6236 28H7.68608L14.8551 7.63636H19.4091L26.5881 28H22.6506L17.2116 11.8125H17.0526L11.6236 28ZM11.7528 20.0156H22.4915V22.9787H11.7528V20.0156Z"
					fill="black"
				/>
			</svg>
		</>
	);
};

export default ArrowDownIcon;

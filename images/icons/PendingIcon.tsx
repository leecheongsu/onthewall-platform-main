interface Props {
	className?: string;
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
				style={{ width: "22px", height: "22px" }}
			>
				<rect width="36" height="36" rx="5" fill="#f0f0f0" />
				<g clipPath="url(#clip0_5446_9091)">
					<path
						d="M8.66797 7.33325V9.99992H27.3346V7.33325H8.66797ZM8.66797 20.6666H14.0013V28.6666H22.0013V20.6666H27.3346L18.0013 11.3333L8.66797 20.6666Z"
						fill="black"
					/>
				</g>
				<defs>
					<clipPath id="clip0_5446_9091">
						<rect width="32" height="32" fill="white" transform="translate(2 1)" />
					</clipPath>
				</defs>
			</svg>
		</>
	);
};

export default ArrowDownIcon;

interface Props {
	className?: string;
}

const Delete = ({ className }: Props) => {
	return (
		<>
			<svg
				width="31"
				height="31"
				viewBox="0 0 31 31"
				fill="none"
				strokeWidth={1.5}
				stroke="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				className={`${className}`}
			>
				<g clipPath="url(#clip0_5533_10535)">
					<path d="M5.8125 6.4585V28.4168H25.1875V6.4585H5.8125Z" />
					<path d="M12.9141 12.9165V21.3123" />
					<path d="M18.0781 12.9165V21.3123" />
					<path d="M2.58594 6.4585H28.4193" />
					<path d="M10.3281 6.4585L12.4523 2.5835H18.58L20.6615 6.4585H10.3281Z" />
				</g>
				<defs>
					<clipPath id="clip0_5533_10535">
						<rect width="31" height="31" fill="white" />
					</clipPath>
				</defs>
			</svg>
		</>
	);
};

export default Delete;

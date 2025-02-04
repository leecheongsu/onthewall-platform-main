interface Props {
	className?: string;
	[key: string]: any;
}

const OptimizeIcon = ({ className, ...rest }: Props) => {
	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className={className}
				viewBox="0 0 24 25"
				fill="none"
				style={{ width: '22px', height: '22px' }}
				{...rest}
			>
				<path
					d="M9.4998 4.5L13.9998 8.5L19.0159 5.5549L16.4998 11L20.9998 15L14.9998 14.5L12.7498 19.5L11.4998 14L5.5 13.5L10.7539 10.325L9.4998 4.5Z"
					stroke="#333333"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path d="M4 21.5103L11.5 14" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
			</svg>
		</>
	);
};

export default OptimizeIcon;

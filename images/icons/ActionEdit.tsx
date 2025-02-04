interface Props {
	className?: string;
}

const ActionEditIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				width="19"
				height="19"
				viewBox="0 0 19 19"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				className={className}
			>
				<g clipPath="url(#clip0_5533_10664)">
					<path d="M2.375 13.6562V16.625H5.34375L14.0996 7.86917L11.1308 4.90042L2.375 13.6562ZM4.68667 15.0417H3.95833V14.3133L11.1308 7.14083L11.8592 7.86917L4.68667 15.0417ZM16.3954 4.45708L14.5429 2.60458C14.3846 2.44625 14.1867 2.375 13.9808 2.375C13.775 2.375 13.5771 2.45417 13.4267 2.60458L11.9779 4.05333L14.9467 7.02208L16.3954 5.57333C16.7042 5.26458 16.7042 4.76583 16.3954 4.45708Z" />
				</g>
				<defs>
					<clipPath id="clip0_5533_10664">
						<rect width="19" height="19" fill="white" />
					</clipPath>
				</defs>
			</svg>
		</>
	);
};

export default ActionEditIcon;

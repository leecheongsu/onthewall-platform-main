interface Props {
	className?: string;
}

const ModifyIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				width="5"
				height="18"
				viewBox="0 0 5 18"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				className={className}
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M4.5 2C4.5 3.10455 3.60455 4 2.5 4C1.39545 4 0.5 3.10455 0.5 2C0.5 0.89543 1.39545 0 2.5 0C3.60455 0 4.5 0.89543 4.5 2ZM2.5 11C3.60455 11 4.5 10.1046 4.5 9C4.5 7.89545 3.60455 7 2.5 7C1.39545 7 0.5 7.89545 0.5 9C0.5 10.1046 1.39545 11 2.5 11ZM2.5 18C3.60455 18 4.5 17.1045 4.5 16C4.5 14.8954 3.60455 14 2.5 14C1.39545 14 0.5 14.8954 0.5 16C0.5 17.1045 1.39545 18 2.5 18Z"
				/>
			</svg>
		</>
	);
};

export default ModifyIcon;

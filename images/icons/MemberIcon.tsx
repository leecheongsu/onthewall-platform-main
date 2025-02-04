interface Props {
	className?: string;
}

const UserIcon = ({ className }: Props) => {
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
					d="M7.00852 7.63636H11.5227L17.5682 22.392H17.8068L23.8523 7.63636H28.3665V28H24.8267V14.0099H24.6378L19.0099 27.9403H16.3651L10.7372 13.9801H10.5483V28H7.00852V7.63636Z"
					fill="black"
				/>
			</svg>
		</>
	);
};

export default UserIcon;

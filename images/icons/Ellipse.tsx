interface Props {
	className?: string;
}

const EllipseIcon = ({ className }: Props) => {
	return (
		<>
			<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
				<circle cx="3" cy="3" r="3" fill={className} />
			</svg>
		</>
	);
};

export default EllipseIcon;

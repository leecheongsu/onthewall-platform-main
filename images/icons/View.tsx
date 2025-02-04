interface Props {
	className?: string;
}

const ViewIcon = ({ className }: Props) => {
	return (
		<>
			<svg
				viewBox="0 0 20 20"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				className={`${className}`}
			>
				<path d="M3.68248 10.4489L3.68135 10.4529C3.59907 10.762 3.28172 10.9466 2.97242 10.8646C2.47267 10.7322 2.56065 10.1557 2.56065 10.1557L2.58113 10.0845C2.58113 10.0845 2.6114 9.98703 2.63578 9.91624C2.6845 9.77478 2.75901 9.57703 2.86494 9.34171C3.07622 8.87233 3.4158 8.24606 3.93097 7.61786C4.97157 6.34895 6.7209 5.08691 9.49779 5.08691C12.2747 5.08691 14.024 6.34895 15.0646 7.61786C15.5798 8.24606 15.9194 8.87233 16.1306 9.34171C16.2366 9.57703 16.3111 9.77478 16.3598 9.91624C16.3842 9.98703 16.4022 10.0439 16.4144 10.0845C16.4206 10.1049 16.4253 10.1212 16.4287 10.1331L16.4328 10.1478L16.4341 10.1526L16.4346 10.1544L16.4349 10.1557C16.517 10.4652 16.3326 10.7826 16.0232 10.8646C15.7142 10.9466 15.3973 10.7629 15.3146 10.4543L15.3142 10.4529L15.3131 10.4489L15.3046 10.4199C15.2963 10.3926 15.2829 10.3498 15.2636 10.2938C15.2249 10.1816 15.1632 10.0171 15.0734 9.8176C14.8933 9.41742 14.6037 8.88427 14.1681 8.35306C13.3071 7.30314 11.868 6.24633 9.49779 6.24633C7.12756 6.24633 5.68849 7.30314 4.82748 8.35306C4.39184 8.88427 4.10232 9.41742 3.92218 9.8176C3.8324 10.0171 3.77063 10.1816 3.732 10.2938C3.7127 10.3498 3.69924 10.3926 3.691 10.4199L3.68248 10.4489ZM9.49788 8.56516C7.89706 8.56516 6.59934 9.86288 6.59934 11.4637C6.59934 13.0645 7.89706 14.3622 9.49788 14.3622C11.0987 14.3622 12.3964 13.0645 12.3964 11.4637C12.3964 9.86288 11.0987 8.56516 9.49788 8.56516ZM7.75876 11.4637C7.75876 10.5032 8.53739 9.72458 9.49788 9.72458C10.4584 9.72458 11.237 10.5032 11.237 11.4637C11.237 12.4242 10.4584 13.2028 9.49788 13.2028C8.53739 13.2028 7.75876 12.4242 7.75876 11.4637Z" />
			</svg>
		</>
	);
};

export default ViewIcon;

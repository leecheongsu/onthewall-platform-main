interface Props {
    className?: string;
}

const SettingIcon = ({className}: Props) => {
    return <>
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" 	style={{ width: '22px', height: '22px' }}>
            <g clipPath="url(#clip0_4737_6363)">
                <path d="M24 0H0V24H24V0Z" fill="white" fillOpacity="0.01"/>
                <path
                    d="M9.1419 21.5854C7.46635 21.0866 5.9749 20.1604 4.79393 18.9333C5.2345 18.4111 5.5 17.7365 5.5 16.9998C5.5 15.343 4.15685 13.9998 2.5 13.9998C2.39977 13.9998 2.3007 14.0047 2.203 14.0143C2.0699 13.3636 2 12.6899 2 11.9998C2 10.9545 2.16039 9.94667 2.4579 8.99952C2.47191 8.99972 2.48594 8.99982 2.5 8.99982C4.15685 8.99982 5.5 7.65667 5.5 5.99982C5.5 5.52417 5.3893 5.07437 5.1923 4.67481C6.34875 3.5995 7.76025 2.79477 9.32605 2.36133C9.8222 3.33385 10.8333 3.99982 12 3.99982C13.1667 3.99982 14.1778 3.33385 14.674 2.36133C16.2398 2.79477 17.6512 3.5995 18.8077 4.67481C18.6107 5.07437 18.5 5.52417 18.5 5.99982C18.5 7.65667 19.8432 8.99982 21.5 8.99982C21.5141 8.99982 21.5281 8.99972 21.5421 8.99952C21.8396 9.94667 22 10.9545 22 11.9998C22 12.6899 21.9301 13.3636 21.797 14.0143C21.6993 14.0047 21.6002 13.9998 21.5 13.9998C19.8432 13.9998 18.5 15.343 18.5 16.9998C18.5 17.7365 18.7655 18.4111 19.2061 18.9333C18.0251 20.1604 16.5336 21.0866 14.8581 21.5854C14.4714 20.3757 13.338 19.4998 12 19.4998C10.662 19.4998 9.5286 20.3757 9.1419 21.5854Z"
                    stroke="#333333" strokeWidth="1.5" strokeLinejoin="round"/>
                <path
                    d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                    stroke="#333333" strokeWidth="1.6" strokeLinejoin="round"/>
            </g>
            <defs>
                <clipPath id="clip0_4737_6363">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    </>
}

export default SettingIcon
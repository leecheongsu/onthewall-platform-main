
interface Props {
    className?: string;
}

const ArrowDownIcon = ({className} : Props) => {
    return <>
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_4737_6393)">
                <path d="M16 10.5L12 14.5L8 10.5" stroke="#0F1A2A" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
                <clipPath id="clip0_4737_6393">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    </>
}

export default ArrowDownIcon
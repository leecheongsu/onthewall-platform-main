interface Props {
    className?: string;
}

const ArrowLeftIcon = ({className}: Props) => {
    return <>
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 5 10" fill="none">
            <path d="M4.5 9L0.5 5L4.5 1" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </>
}

export default ArrowLeftIcon

interface Props {
    className?: string;
}

const CircleWarningIcon = ({className} : Props) => {
    return <>
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="39" height="39" viewBox="0 0 39 39" fill="none">
            <circle cx="19.498" cy="19.4999" r="15.8786" stroke="#115DE6" strokeWidth="2.78571"/>
            <rect x="17.8281" y="10.0295" width="3.34286" height="12.2571" rx="1.67143" fill="#115DE6"/>
            <rect x="17.2734" y="24.5134" width="4.45714" height="4.45714" rx="2.22857" fill="#115DE6"/>
        </svg>
    </>
}

export default CircleWarningIcon
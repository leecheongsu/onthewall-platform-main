
interface Props {
    className?: string;
}

const PersonCircleIcon = ({className} : Props) => {
    return <>
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 40 40" fill="none">
            <path
                d="M20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36ZM16 14C16 11.7909 17.7909 10 20 10C22.2091 10 24 11.7909 24 14C24 16.2091 22.2091 18 20 18C17.7909 18 16 16.2091 16 14ZM15 20L25 20C26.6569 20 28 21.3431 28 23C28 25.2322 27.0821 27.0205 25.5757 28.2296C24.0932 29.4196 22.1062 30 20 30C17.8938 30 15.9068 29.4196 14.4243 28.2296C12.9179 27.0205 12 25.2322 12 23C12 21.3432 13.3431 20 15 20Z"
                fill="#CBD4E1"/>
        </svg>
    </>
}

export default PersonCircleIcon
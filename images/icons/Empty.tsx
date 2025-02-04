interface Props {
  className?: string;
}

const Empty = ({ className }: Props) => {
  return (
    <>
      <svg width="73" height="73" viewBox="0 0 73 73" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="69" height="69" rx="8" stroke="#CBD4E1" strokeWidth="4" strokeDasharray="6 6" />
        <line x1="26" y1="32" x2="26" y2="36" stroke="#CBD4E1" strokeWidth="4" strokeLinecap="round" />
        <line x1="45" y1="32" x2="45" y2="36" stroke="#CBD4E1" strokeWidth="4" strokeLinecap="round" />
        <path d="M30 47C31.92 45.4908 37.008 43.3778 42 47" stroke="#CBD4E1" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </>
  );
};

export default Empty;

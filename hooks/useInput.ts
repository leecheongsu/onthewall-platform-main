import { useState } from 'react';

function useInput(initialValue = '') {
	const [value, setValue] = useState(initialValue);
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};
	return { value, setValue, onChange };
}

export default useInput;

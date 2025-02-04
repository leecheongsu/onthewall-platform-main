import React, { useCallback } from 'react';

function useCombinedRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
	return useCallback(
		(element: T) => {
			refs.forEach(ref => {
				if (!ref) return;
				if (typeof ref === 'function') {
					ref(element);
				} else {
					(ref as React.MutableRefObject<T | null>).current = element;
				}
			});
		},
		[refs],
	);
}

export default useCombinedRefs;

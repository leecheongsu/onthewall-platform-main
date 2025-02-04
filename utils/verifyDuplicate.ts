import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const verifyDuplicate = async (collectionName: string, target: string, value: any) => {
	const snap = await getDocs(
		query(
			collection(db, collectionName),
			where(target, '==', value),
			where('isDeleted', '==', false),
		),
	);
	return snap.size > 0;
};

export default verifyDuplicate;

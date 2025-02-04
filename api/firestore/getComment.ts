import { db } from "@/lib/firebase";
import { doc, getDocs, collectionGroup, where, query, updateDoc } from "firebase/firestore";

// 댓글 전부 가져오기
export async function Comments(docIds: string[]) {
	try {
		for (const docId of docIds) {
			const commentCollectionRef = collectionGroup(db, "Comment");

			const isNotDeletedQuery = query(
				commentCollectionRef,
				where("channelId", "==", docId),
				where("isDeleted", "==", false),
			);
			const snapshot = await getDocs(isNotDeletedQuery);

			const totalCommentCount = snapshot.size;
			const exhibitionDocRef = doc(db, "Exhibition", docId);
			await updateDoc(exhibitionDocRef, { commentCount: totalCommentCount });
		}
	} catch (error) {
		console.error("Error copying comments: ", error);
	}
}

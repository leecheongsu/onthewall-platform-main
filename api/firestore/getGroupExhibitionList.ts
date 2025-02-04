import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, where, query } from "firebase/firestore";

// 클라이언트 아이디로 섹션 전시회 리스트 가져오기
export async function GroupExhibitionList(projectId: string) {
	try {
		const query1 = query(
			collection(db, "SpecialExhibitionList"),
			where("clientId", "==", projectId),
			where("isDeleted", "==", false),
		);

		const snapshot = await getDocs(query1);

		const groupExhibitionList: Array<GroupExhibitionList> = [];
		snapshot.forEach(doc => {
			groupExhibitionList.push({ ...doc.data(), id: doc.id } as GroupExhibitionList);
		});
		return groupExhibitionList;
	} catch (e) {
		console.log("Get GroupExhibitionList Error : ", e);
	}
}

// 전달받은 문서이름으로 전시회 리스트 가져오기
export async function GroupExhibitionDocs(docId: string) {
	try {
		const docRef = doc(db, "SpecialExhibitionList", docId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				title: docSnap.data().title,
				exhibitions: docSnap.data().exhibitions || [],
				description: docSnap.data().description || "",
				layout: docSnap.data().layout || "",
			};
		}
	} catch (e) {
		console.error("Get GroupExhibitionDocument Error: ", e);
		return null;
	}
}

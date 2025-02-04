import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { KEY } from "@/constants/globalDesign";

// 어드민에 있는 채널 가져오기
export async function getChannel(docId: string) {
	try {
		const GlobalRef = doc(db, "GlobalDesign", KEY);
		const ChannelRef = doc(GlobalRef, "Section", docId);
		const snapshot = await getDoc(ChannelRef);
		if (snapshot.exists()) {
			const data = snapshot.data();
			if (data.isDeleted === false) {
				return data;
			} else {
				console.log("Document is marked as deleted.");
				return null;
			}
		} else {
			console.log("No such document!");
			return null;
		}
	} catch (e) {
		console.log("Get ExhibitionList Error : ", e);
	}
}

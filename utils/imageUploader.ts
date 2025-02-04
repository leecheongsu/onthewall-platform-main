// //*************************************************************** */
// // imageUploader
// // 이미지 업로드 함수
// // path: 업로드 경로
// // selectedFile: 업로드할 파일
// // compression: 압축할 사이즈 배열
// // return: 업로드된 이미지 url과 filename 배열
// //*************************************************************** */
// import imageCompression from "browser-image-compression";
// import ShortUniqueId from "short-unique-id";
// import { storage } from "@/lib/firebase";
//
// const imageUploader = async (
// 	path: string,
// 	selectedFile: File,
// 	compression: Array<number>,
// ): Promise<Array<{ name: string; url: string; path: string; compression: string }>> => {
// 	// 이미지 압축
// 	const compressionPromise = compression.map(async quality => {
// 		return await imageCompression(selectedFile, {
// 			maxWidthOrHeight: quality,
// 		});
// 	});
//
// 	const compressedFile = await Promise.all(compressionPromise);
// 	console.log(compressedFile);
// 	// 각각 이미지 이름 변경 및 업로드
// 	return new Promise(resolve => {
// 		const RandomText = new ShortUniqueId({ length: 5 }).randomUUID();
// 		const fileName = selectedFile.name;
// 		// 확장자, 파일명 분리
// 		const fileNameArray = fileName.split(".");
// 		const extension = fileNameArray.pop();
// 		const docId = fileNameArray.join(".");
//
// 		// 파일명 저장
// 		const fileNamesWithoutRandomText = compressedFile.map((_, i) => {
// 			return `${docId}_${compression[i]}.${extension}`;
// 		});
// 		fileNamesWithoutRandomText.unshift(`${docId}.${extension}`);
//
// 		// 파일명 변경
// 		const originalFileName = `${docId}_${RandomText}.${extension}`;
// 		const fileNames = compressedFile.map((_, i) => {
// 			return `${docId}_${RandomText}_${compression[i]}.${extension}`;
// 		});
// 		fileNames.unshift(originalFileName);
//
// 		// storage ref 생성
// 		const storageRefs = fileNames.map(fileName => {
// 			return storage.ref(`${path}/${fileName}`);
// 		});
//
// 		// storage에 업로드
// 		const tasks = storageRefs.map((storageRef, i) => {
// 			if (i === 0) return storageRef.put(selectedFile);
// 			else return storageRef.put(compressedFile[i - 1]);
// 		});
// 		Promise.all(tasks).then(() => {
// 			// upload 후 download url 가져오기
// 			const downloadURLs = storageRefs.map(storageRef => {
// 				return storageRef.getDownloadURL();
// 			});
//
// 			Promise.all(downloadURLs).then(urls => {
// 				resolve(
// 					urls.map((url, i) => {
// 						return {
// 							url,
// 							name: fileNamesWithoutRandomText[i],
// 							path: `${path}/${fileNames[i]}`,
// 							compression: `${i === 0 ? "original" : compression[i - 1]}`,
// 						};
// 					}),
// 				);
// 			});
// 		});
// 	});
// };
//
// export default imageUploader;

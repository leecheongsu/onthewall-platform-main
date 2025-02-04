import React, { ReactElement, useState, useRef, useEffect } from "react";
import { storageRef, storage, uploadBytes, getDownloadURL, StorageReference } from "@/lib/firebase";
import ShortUniqueId from "short-unique-id";
import { useTranslation } from "react-i18next";
import { Button, CircularProgress } from "@mui/material";

interface Props {
	videoData: {
		path: string;
		url: string;
		fileName: string;
	};
	setVideoData: React.Dispatch<any>;
	isLoading?: boolean;
	setLoading?: any;
}

export default function VideoUploadButton(props: Props): ReactElement {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { videoData, setVideoData, isLoading, setLoading } = props;
	const { t } = useTranslation();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const fileSelectedHandler = (event: any) => {
		setLoading(true);
		const file = event.target.files[0];
		if (!file) {
			setLoading(false);
			return;
		}

		if (!file.type.includes("video")) {
			alert(t("Please upload your video file."));
			setLoading(false);
			return;
		}

		const MAX_VIDEO_SIZE = 150;
		if (file.size > 1048576 * MAX_VIDEO_SIZE) {
			alert(
				t("Please upload video no larger than. {{size}}MB .", {
					size: MAX_VIDEO_SIZE,
				}),
			);
			setLoading(false);
			return;
		}

		setSelectedFile(file);
	};

	const callUploadFun = () => {
		fileInputRef.current?.click();
	};

	// 파일 업로드 관련 로직
	const fileUploadHandler = async (selectedFileName: string): Promise<string> => {
		return new Promise(resolve => {
			const randomText = new ShortUniqueId().randomUUID(8);
			const fileName = `${selectedFileName}_${randomText}`;
			const storageRef1 = storageRef(storage, `videos/${fileName}`);
			const task1 = uploadBytes(storageRef1, selectedFile!);
			task1.then(() => resolve(fileName));
		});
	};

	const onVideoSubmit = async () => {
		if (!selectedFile) return;

		const uploadedFileName = await fileUploadHandler(selectedFile.name);
		const videoPath = `videos/${uploadedFileName}`;

		getDownloadURL(storageRef(storage, videoPath)).then(videoUrl => {
			setVideoData({ url: videoUrl, path: videoPath, fileName: selectedFile.name });
			setLoading(false);
		});
	};

	useEffect(() => {
		if (selectedFile) {
			onVideoSubmit();
		}
	}, [selectedFile]);

	return (
		<>
			{isLoading ? (
				<CircularProgress />
			) : (
				<Button onClick={callUploadFun} variant="outlined">
					{videoData?.url ? t("Change Video") : t("Select Video")}
				</Button>
			)}
			<input
				ref={fileInputRef}
				type="file"
				accept="video/*"
				style={{ display: "none" }}
				name="videoFile"
				id="videoFile"
				onChange={fileSelectedHandler}
			/>
		</>
	);
}

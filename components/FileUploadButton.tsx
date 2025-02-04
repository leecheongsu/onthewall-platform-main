import React, { ReactElement } from "react";
import imageCompression from "browser-image-compression";
import ShortUniqueId from "short-unique-id";
import { storageRef, storage, uploadBytes, getDownloadURL, StorageReference } from "@/lib/firebase";

// hooks
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import styled from "@emotion/styled";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";

// components
import { Button, CircularProgress } from "@mui/material";

interface Props {
	fileData: {
		path: string;
		url: string;
		fileName: string;
	};
	setFileData: React.Dispatch<any>;
	isLoading?: boolean;
	setLoading?: any;
}
export default function FileUploadButton(props: Props): ReactElement {
	const { i18n, t } = useTranslation();
	const { fileData, setFileData, isLoading, setLoading } = props;
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fileSelectedHandler = (event: any) => {
		if (setLoading) {
			setLoading(true);
			if (!event.target.files[0]) {
				setLoading(false);
				return false;
			}
		}

		let fileTypeText = event.target.files[0].type;
		if (
			fileTypeText.includes("image") ||
			fileTypeText.includes("video") ||
			fileTypeText.includes("audio")
		) {
			alert(t("Cannot upload images, videos, or audio files."));
			setLoading(false);
			return false;
		}

		const MAX_FILE_SIZE = 20;
		if (event.target.files[0].size > 1048576 * MAX_FILE_SIZE) {
			alert(
				t("{{size}}MB 이하의 파일을 업로드해주세요.", {
					size: MAX_FILE_SIZE,
				}),
			);
			setLoading(false);
			return false;
		}

		setSelectedFile(event.target.files[0]);
		return true;
	};

	const cancelNowfileUploadCase = () => {
		setSelectedFile(null);
	};

	const callUploadFun = () => {
		fileInputRef.current?.click();
	};

	// 파일 업로드 관련 로직 시작
	const fileUploadHandler = async (selectedFileName: string): Promise<{ originalFile: string }> => {
		if (!selectedFile) {
			throw new Error("No file selected.");
		}

		return new Promise(resolve => {
			const RandomText = new ShortUniqueId({ length: 10 }).randomUUID();
			// 파일명을 확장자를 포함하여 분리
			const filenameArray = selectedFileName.split(".");
			const fileExtension = filenameArray.pop();
			const selectedFileNameWithoutExtension = filenameArray.join(".");
			// 새로운 파일명 생성
			const originalFileName = `${selectedFileNameWithoutExtension}_${RandomText}_original.${fileExtension}`;
			const storageRef1: StorageReference = storageRef(storage, `uploads/${originalFileName}`);

			const task1 = uploadBytes(storageRef1, selectedFile);
			task1.then(() => {
				resolve({
					originalFile: originalFileName,
				});
			});
		});
	};

	// 파일 업로드 관련 로직 끝
	const onFileSubmit = async () => {
		if (selectedFile !== null) {
			const uploadedFileNames = await fileUploadHandler(selectedFile.name);
			const fileName = "originalFile";
			const filePath = `uploads/${uploadedFileNames[fileName]}`;
			const originalFileName = selectedFile.name;

			const storageReference: StorageReference = storageRef(storage, filePath);

			getDownloadURL(storageReference)
				.then((fileUrl: string) => {
					setFileData({
						url: fileUrl,
						path: filePath,
						fileName: originalFileName,
					});
					setLoading(false);
				})
				.catch(error => {
					console.error("Error getting download URL:", error);
					setLoading(false);
				});
		}
	};

	useEffect(() => {
		if (!selectedFile) {
			return;
		}
		onFileSubmit();
	}, [selectedFile]);

	return (
		<>
			{isLoading ? (
				<CircularProgress />
			) : (
				<StyledButton
					onClick={callUploadFun}
					variant="outlined"
					color="primary"
					sx={{
						fontSize: "14px",
					}}
				>
					<FolderCopyIcon style={{ fontSize: "14px" }} />
					{t("Upload File")}
				</StyledButton>
			)}
			<input
				ref={fileInputRef}
				type="file"
				accept="*/*"
				style={{ display: "none" }}
				name="file"
				id="file"
				onChange={fileSelectedHandler}
			/>
		</>
	);
}

const StyledButton = styled(Button)`
	font-size: 14px;
	display: flex;
	align-items: center;
	border-radius: 25px;
	gap: 5px;
`;

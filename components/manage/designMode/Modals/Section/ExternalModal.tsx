import React, { useEffect, useState } from "react";
import Image from "next/image";

// lib
import { useTranslation } from "react-i18next";

// style
import {
	Box,
	Title,
	Row,
	Column,
	Label,
	Value,
	CloseButton,
} from "@/components/manage/designMode/Modals/style";

// mui
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { CardMedia } from "@mui/material";

// icons
import CloseIcon from "@mui/icons-material/Close";

// components
import ImageUploadButton from "@/components/ImageUploadButton";

interface Props {
	open: boolean;
	onClose: () => void;
	selectedItems: any[];
	setSelectedItems: (data: any[]) => void;
}

export default function ExternalModal({ open, onClose, selectedItems, setSelectedItems }: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");

	const [titleError, setTitleError] = useState("");
	const [urlError, setUrlError] = useState("");

	const [isLoading, setLoading] = useState(false);
	const [imageData, setImageData] = useState({
		originalImage: { path: "", url: "" },
		thumbnailImage: { path: "", url: "" },
		compressedImage: { path: "", url: "" },
	});

	const addItem = () => {
		let isValid = true;

		if (!title.trim()) {
			setTitleError(t("Title is required"));
			isValid = false;
		}

		if (!url.trim()) {
			setUrlError(t("url is required"));
			isValid = false;
		} else if (!url.startsWith("http://") && !url.startsWith("https://")) {
			setUrlError(t("URL must start with http:// or https://"));
			isValid = false;
		}

		if (!isValid) {
			return;
		}

		const newItem = {
			type: "link",
			title,
			url,
			id: "",
			originalPosterImage: {
				path: imageData.originalImage.path,
				url: imageData.originalImage.url,
			},
		};
		setSelectedItems([...selectedItems, newItem]);
		onClose();
	};

	return (
		<>
			<Modal open={open} onClose={onClose}>
				<Box className="External">
					<CloseButton onClick={onClose}>
						<CloseIcon />
					</CloseButton>

					<Title>{t("External Link")}</Title>
					<Row>
						<Label>
							{t("Title")}
							<span>*</span>
						</Label>
						<Value>
							<TextField
								fullWidth
								size="small"
								variant="outlined"
								placeholder={t("Enter Title")}
								value={title}
								onChange={e => {
									setTitle(e.target.value);
									if (e.target.value.trim()) {
										setTitleError("");
									}
								}}
								error={!!titleError}
								helperText={titleError}
							/>
						</Value>
					</Row>
					<Row>
						<Label>
							{t("URL")}
							<span>*</span>
						</Label>
						<Value>
							<TextField
								fullWidth
								size="small"
								variant="outlined"
								placeholder={t("Enter URL")}
								value={url}
								onChange={e => {
									setUrl(e.target.value);
									if (
										e.target.value.trim() &&
										(e.target.value.startsWith("http://") || e.target.value.startsWith("https://"))
									) {
										setUrlError("");
									}
								}}
								error={!!urlError}
								helperText={urlError}
							/>
						</Value>
					</Row>
					<Row>
						<Label>{t("Thumbnail")}</Label>
						<Column>
							{imageData.originalImage.url && (
								<CardMedia
									component="img"
									src={imageData.originalImage.url}
									sx={{ marginBottom: "10px" }}
								/>
							)}
							<ImageUploadButton
								imageData={imageData}
								setImageData={setImageData}
								isLoading={isLoading}
								setLoading={setLoading}
							/>
						</Column>
					</Row>

					<Button
						variant="contained"
						color="primary"
						fullWidth
						sx={{ textTransform: "capitalize", fontSize: "1rem", marginTop: "20px" }}
						onClick={() => {
							addItem();
						}}
						disabled={isLoading}
					>
						{t("Add")}
					</Button>
				</Box>
			</Modal>
		</>
	);
}

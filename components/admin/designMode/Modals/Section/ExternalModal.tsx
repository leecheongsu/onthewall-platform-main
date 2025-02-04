import React, { useState } from "react";

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

export default function AddExternalModal({
	open,
	onClose,
	selectedItems,
	setSelectedItems,
}: Props) {
	const { t } = useTranslation();
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [isLoading, setLoading] = useState(false);
	const [imageData, setImageData] = useState({
		originalImage: { path: "", url: "" },
		thumbnailImage: { path: "", url: "" },
		compressedImage: { path: "", url: "" },
	});

	const addItem = () => {
		const newItem = {
			type: "external",
			title,
			url,
			id: "",
			originalPosterImage: {
				path: imageData.originalImage.path,
				url: imageData.originalImage.url,
			},
		};
		setSelectedItems([...selectedItems, newItem]);
	};

	return (
		<>
			<Modal open={open} onClose={onClose}>
				<Box className="External">
					<CloseButton onClick={onClose}>
						<CloseIcon />
					</CloseButton>

					<Title>{t("External Link (Admin)")}</Title>
					<Row>
						<Label>{t("Title")}</Label>
						<Value>
							<TextField
								fullWidth
								size="small"
								variant="outlined"
								placeholder={t("Enter Title")}
								value={title}
								onChange={e => setTitle(e.target.value)}
							/>
						</Value>
					</Row>
					<Row>
						<Label>{t("URL")}</Label>
						<Value>
							<TextField
								fullWidth
								size="small"
								variant="outlined"
								placeholder={t("Enter URL")}
								value={url}
								onChange={e => setUrl(e.target.value)}
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
							onClose();
							addItem();
						}}
					>
						{t("Add")}
					</Button>
				</Box>
			</Modal>
		</>
	);
}

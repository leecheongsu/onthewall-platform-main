import { ImageResponse } from "next/og";
import { getMetadataByProjectUrl } from "@/api/firestore/getMetadata";
import { DEFAULT_IMAGES } from "@/constants/defaultLayoutInfo";
import Image from "next/image";

export const alt = "onthewall-cloud";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";
export const runtime = "edge" || "safari" || "chrome";

interface Props {
	params: {
		projectUrl: string;
	};
}

export default async function OpengraphImage({ params: { projectUrl } }: Props) {
	const metadata = await getMetadataByProjectUrl(projectUrl);
	const OpenGraphUrl = metadata?.ogUrl || DEFAULT_IMAGES.ogUrl;

	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 128,
					background: "white",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Image
					src={OpenGraphUrl}
					alt={alt}
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
			</div>
		),
		{
			...size,
		},
	);
}

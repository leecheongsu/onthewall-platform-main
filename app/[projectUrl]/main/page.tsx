import Section from "./components/section";
import {
	getExhibitionMetadataByProjectUrl,
	getMetadataByProjectUrl,
} from "@/api/firestore/getMetadata";
import { META } from "@/constants/metadata";
import { Metadata } from "next";

interface Props {
	params: {
		projectUrl: string;
	};
}

export async function generateMetadata({ params: { projectUrl } }: Props): Promise<Metadata> {
	try {
		const projectMetadata = await getMetadataByProjectUrl(projectUrl);
		const exhibitionsMetadata = await getExhibitionMetadataByProjectUrl(projectUrl);

		const ogUrl = projectMetadata.ogUrl ?? META.ogUrl;
		const CLOUD_URL = `${process.env.NEXT_PUBLIC_ONTHEWALL_CLOUD_URL}/${projectUrl}`;
		4;

		let title = projectMetadata.title || META.title;
		let description = projectMetadata.description || META.description;

		if (exhibitionsMetadata.length > 0) {
			const exhibitionTitles = exhibitionsMetadata.map((v: any) => v.title).slice(0, 5).join(", ");

			description = `${description}. - ${exhibitionTitles}`;
		}

		return {
			metadataBase: new URL(
				"https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/paintings",
			),
			alternates: {
				canonical: CLOUD_URL,
			},
			title: title,
			description: description,
			openGraph: {
				title: title,
				description: description,
				url: ogUrl,
				siteName: title,
				images: [
					{
						url: ogUrl,
						width: 800,
						height: 600,
					},
				],
				locale: "en_US",
				type: "website",
			},
			icons: [
				projectMetadata.faviconUrl
			]
		};
	} catch (error) {
		console.error("Error fetching metadata:", error);
		return {} as Metadata;
	}
}

export default async function Page({ params: { projectUrl } }: Props) {
	const metadata = await getMetadataByProjectUrl(projectUrl);

	return (
		<>
			<Section projectUrl={projectUrl} data={metadata} />
		</>
	);
}

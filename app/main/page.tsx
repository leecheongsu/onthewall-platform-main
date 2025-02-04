import { getProjectUrls } from '@/api/firestore/getProject';
import Link from 'next/link';
import React from 'react';
import Loading from '@/app/loading';

export default async function Page() {
	const data = await getProjectUrls();
	if (!data) return null;

	return (
		<>
			<Loading />
			<div>
				<ul style={{ listStyleType: 'none', paddingInlineStart: '20px' }}>
					{data.map((url: string, index: number) => (
						<li key={index} style={{ display: 'none'}}>
							<Link href={`${process.env.NEXT_PUBLIC_ONTHEWALL_CLOUD_URL}/${url}`}>{url}</Link>
						</li>
					))}
				</ul>
			</div>
		</>
	);
}

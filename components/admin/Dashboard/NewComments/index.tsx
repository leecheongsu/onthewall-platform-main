import React, { use, useEffect } from "react";
import Card from "../Card";
import { moduleApis } from "@/api/module";
import styled from "@emotion/styled";
import { CircularProgress } from "@mui/material";
import CommentsItem from "./CommentsItem";
import { useProjectStore } from "@/store/project";
import { useTranslation } from "react-i18next";
type Props = {};

function NewComments({}: Props) {
	const { t } = useTranslation();
	const { projectId } = useProjectStore();
	const [comments, setComments] = React.useState<Comment[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	useEffect(() => {
		setIsLoading(true);
		moduleApis.getCommentsByProjectId(projectId, { page: 1, pageSize: 10 }).then(res => {
			const comments = res.data?.comments || [];
			if (comments.length > 0) {
				setComments(comments);
				const promises = comments.map((comment: any) => {
					return moduleApis.getExhibitionById(comment.channelId).then(res => {
						setComments((prev: any[]) => {
							const index = prev.findIndex((c: any) => c.id === comment.id);
							prev[index].exhibition = res.data;
							return [...prev];
						});
					});
				});

				Promise.all(promises).then(() => {
					setIsLoading(false);
				});
			} else {
				setIsLoading(false);
			}
		});
	}, []);

	return (
		<Card header={t("New Comments")}>
			<Container>
				{isLoading && (
					<PlaceHolder>
						<CircularProgress />
					</PlaceHolder>
				)}
				{!isLoading && comments.length === 0 && <PlaceHolder>{t("No comments found")}</PlaceHolder>}
				{!isLoading &&
					comments.map((comment: any) => <CommentsItem key={comment.id} data={comment} />)}
			</Container>
		</Card>
	);
}

export default NewComments;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 230px;
	overflow-y: auto;
	scroll-snap-type: y mandatory;
	//scrollbar style
	::-webkit-scrollbar {
		width: 4px;
	}
	::-webkit-scrollbar-thumb {
		background-color: #888;
		border-radius: 4px;
	}
	::-webkit-scrollbar-track {
		background-color: #f1f1f1;
	}
`;
const PlaceHolder = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 240px;
`;

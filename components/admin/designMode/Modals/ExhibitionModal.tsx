import React, { use, useEffect, useState } from "react";

// data
import { moduleApis } from "@/api/module";
import { getAdminExhibitionListAll } from "@/api/firestore/getExhibitions";

// store
import { useProjectStore } from "@/store/project";

// lib
import moment from "moment";
import { useTranslation } from "react-i18next";

// style
import styled from "@emotion/styled";
import { Box, Title, CloseButton } from "@/components/manage/designMode/Modals/style";

// mui
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import { CircularProgress } from "@mui/material";

// icons
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@/images/icons/Check";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Props {
	open: boolean;
	onClose: () => void;
	selectedItems: any[];
	setSelectedItems: (data: any[]) => void;
}

export default function ExhibitionModal({ open, onClose, selectedItems, setSelectedItems }: Props) {
	const { t } = useTranslation();
	const { projectId } = useProjectStore();
	// const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
	const [pageSize, setPageSize] = useState(5);
	const [page, setPage] = useState(0);
	const [isLoading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [paginatedData, setPaginatedData] = useState([]);

	const handleChangePage = (event: unknown, newPage: number) => {
		// setPaginationModel(prev => ({ ...prev, page: newPage }));
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		// setPaginationModel({
		// 	pageSize: parseInt(event.target.value, 10),
		// 	page: 0,
		// });
		setPageSize(parseInt(event.target.value, 10));
		setPage(0);
	};
	const convertTimestampToDate = (timestamp: any) => {
		return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
	};

	const addItem = (item: any) => {
		const newItem = { ...item, type: "onthewall" };
		if (!selectedItems.some(i => i.id === newItem.id)) {
			setSelectedItems([...selectedItems, newItem]);
		}
	};

	const fetchData = async () => {
		// const res = await moduleApis.getExhibitionsByProjectId(projectId);
		const snap = await getDocs(
			query(collection(db, "Exhibition"), where("isDeleted", "==", false)),
		);
		const exhibitions: any = [];
		snap.forEach(doc => {
			if (doc.exists()) {
				exhibitions.push({ ...doc.data(), id: doc.id });
			}
		});

		console.log("exhibitions", exhibitions);

		setData(exhibitions);
	};

	const fetchAdminData = async () => {
		getAdminExhibitionListAll().then(res => {
			setData(res);
		});
	};
	useEffect(() => {
		console.log("afowiejfoiawjefoij");
		const result = data.slice(page * pageSize, page * pageSize + pageSize);
		console.log(result);
		setPaginatedData(result);
	}, [page, pageSize, data]);

	useEffect(() => {
		console.log("open", open);
		if (!open) return;
		setLoading(true);
		// if (projectId) {
		fetchData().then(() => {
			setLoading(false);
		});
		// } else {
		// fetchAdminData();
		// }
	}, [open]);

	// useEffect(() => {
	// 	if (data) {
	// 		setTimeout(() => {
	// 			setLoading(false);
	// 		}, 800);
	// 	}
	// }, [data]);

	return (
		<>
			<Modal open={open} onClose={onClose}>
				<Box className="Exhibition">
					<CloseButton onClick={onClose}>
						<CloseIcon />
					</CloseButton>

					<Title>{t("Exhibitions")}</Title>
					{isLoading ? (
						<CircularProgress />
					) : (
						<>
							<Table>
								<TableHead sx={{ backgroundColor: "#DBE8FF" }}>
									<TableRow>
										<TableCell align="center" sx={{ width: 350 }}>
											{t("Title")}
										</TableCell>
										<TableCell align="center">{t("User Name")}</TableCell>
										<TableCell align="center">{t("Created At")}</TableCell>
										<TableCell align="center">{t("Status")}</TableCell>
										<TableCell align="center" sx={{ width: 120 }}></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{paginatedData.length === 0 ? (
										<TableRow>
											<TableCell align="center" colSpan={5}>
												{t("No data.")} <br />
												{t("please create an exhibition first, and then create a group section.")}
											</TableCell>
										</TableRow>
									) : (
										paginatedData.map((item: any, index) => (
											<TableRow key={index}>
												<TableCell align="center">
													<Subtitle>{item.title}</Subtitle>
												</TableCell>
												<TableCell align="center">{item.author}</TableCell>
												<TableCell align="center">
													{item.createdAt
														? moment(convertTimestampToDate(item.createdAt)).format(
																"YYYY년 MM월 DD일",
														  )
														: t("No Created date")}
												</TableCell>
												<TableCell align="center">{item.status}</TableCell>
												<TableCell align="center">
													<StyledButton
														color="primary"
														variant="outlined"
														disabled={selectedItems.some(i => i.id === item.id)}
														onClick={() => {
															addItem(item);
														}}
													>
														{selectedItems.some(i => i.id === item.id) ? <CheckIcon /> : "Add"}
													</StyledButton>
												</TableCell>
											</TableRow>
										))
									)}
									{}
								</TableBody>
							</Table>
							<TablePagination
								rowsPerPageOptions={[5, 10, 20, 30, 50, 100, 200]}
								component="div"
								count={data.length}
								rowsPerPage={pageSize}
								page={page}
								onPageChange={handleChangePage}
								onRowsPerPageChange={handleChangeRowsPerPage}
								sx={{ backgroundColor: "#fff" }}
							/>
						</>
					)}
				</Box>
			</Modal>
		</>
	);
}

const StyledButton = styled(Button)`
	border-radius: 25px;
	& svg {
		width: 22px;
		height: 22px;
	}
`;

const Subtitle = styled.p`
	width: 100%;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	font-size: 1rem;
	width: 350px;
`;

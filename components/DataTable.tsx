import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
} from "@mui/material";
import { TableData } from "@/type/Table";
import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

const NotExist = () => {
	const { i18n, t } = useTranslation();
	return (
		<>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell align="center" colSpan={3}>
							-
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					<TableRow>
						<RowCell align="center" colSpan={3}>
							<br />
							<ExistLabel>{t("Not Exists Data")}</ExistLabel>
							<br />
							<br />
						</RowCell>
					</TableRow>
				</TableBody>
			</Table>
		</>
	);
};

const withNotExist = (WrappedComponent: React.ComponentType<TableData>) => (props: TableData) => {
	if (!props.headers || !props.data || props.headers.length === 0 || props.data.length === 0)
		return <NotExist />;
	return <WrappedComponent {...props} />;
};

function DataTable({ headers, data }: TableData) {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	// const [order, setOrder] = useState<'asc' | 'desc'>('asc');
	// const [orderBy, setOrderBy] = useState<string | null>(null);

	// const handleRequestSort = (property: string) => {
	//     const isAsc = orderBy === property && order === 'asc';
	//     setOrder(isAsc ? 'desc' : 'asc');
	//     setOrderBy(property);
	// };

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	// const sortedData = () => {
	//     if (!orderBy) return data;
	//     return data.slice().sort((a, b) => {
	//         const aValue = a.columns.find(col => col.id === orderBy)?.label;
	//         const bValue = b.columns.find(col => col.id === orderBy)?.label;
	//
	//         if (aValue == null || bValue == null) return 0;
	//
	//         if (aValue < bValue) {
	//             return order === 'asc' ? -1 : 1;
	//         }
	//         if (aValue > bValue) {
	//             return order === 'asc' ? 1 : -1;
	//         }
	//         return 0;
	//     });
	// };

	return (
		<>
			<Wrapper>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							{headers.map(cell => (
								<HeadCell key={cell.id} style={{ minWidth: cell.minWidth }} align={cell.align}>
									{cell.label}
									{/*<TableSortLabel*/}
									{/*    active={orderBy === cell.id}*/}
									{/*    direction={orderBy === cell.id ? order : 'asc'}*/}
									{/*    onClick={() => handleRequestSort(cell.id)}*/}
									{/*>*/}
									{/*    {cell.label}*/}
									{/*</TableSortLabel>*/}
								</HeadCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{/*{sortedData()*/}
						{data
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((row, rowIndex) => (
								<TableRow key={rowIndex} hover>
									{row.columns.map((cell, cellIndex) => {
										return (
											<RowCell
												key={`${rowIndex}-${cell.id}-${cellIndex}`}
												align={cell.align}
												style={{ minWidth: cell.minWidth }}
											>
												{cell.label || cell.children}
											</RowCell>
										);
									})}
								</TableRow>
							))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[10, 25, 100]}
					component="div"
					count={data.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Wrapper>
		</>
	);
}

export default withNotExist(DataTable);

const Wrapper = styled.div`
	& table {
		border-radius: 5px;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
	}
`;

const HeadCell = styled(TableCell)`
	font-weight: 500;
	font-size: 0.875rem;
	line-height: 1.5rem;
	display: table-cell;
	vertical-align: inherit;
	background: #dbe8ff;
	border-bottom: 1px solid rgba(224, 224, 224, 1);
	padding: 16px;
	color: rgba(0, 0, 0, 0.87);
	z-index: 2;
`;
const RowCell = styled(TableCell)`
	font-weight: 500;
	font-size: 0.875rem;
	line-height: 1.5rem;
	display: table-cell;
	vertical-align: inherit;
	background: #ffffff;
	padding: 16px;
	color: rgba(0, 0, 0, 0.87);
	z-index: 2;
`;
const ExistLabel = styled.span`
	color: rgba(0, 0, 0, 0.2);
	font-size: 1.2rem;
`;

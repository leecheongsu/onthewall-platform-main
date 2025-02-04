import {ReactNode} from "react";

type Cell = {
    id: string;
    label?: string;
    minWidth?: number;
    align?: 'left' | 'center' | 'right';
    children?: ReactNode;
}

type Row = {
    columns: Cell[];
}

type TableData = {
    headers: Cell[];
    data: Row[];
}
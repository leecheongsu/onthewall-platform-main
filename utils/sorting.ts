import {compareFormattedDates} from "@/utils/date";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export type Order = 'asc' | 'desc';

/**
 * Note. date 형식도 parse해서 비교 처리함.
 */
export function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: string }, b: { [key in Key]: string }) => number {
    return (a, b) => {
        if (orderBy === 'createdAt') {
            const formattedDateA = a[orderBy];
            const formattedDateB = b[orderBy];
            return (order === 'desc'
                ? compareFormattedDates(formattedDateB, formattedDateA)
                : compareFormattedDates(formattedDateA, formattedDateB));
        }

        if (a[orderBy] < b[orderBy]) {
            return order === 'asc' ? -1 : 1;
        }
        if (a[orderBy] > b[orderBy]) {
            return order === 'asc' ? 1 : -1;
        }
        return 0;
    };
}

export function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}
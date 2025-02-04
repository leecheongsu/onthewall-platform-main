export const DashDateFormatter = (og: any) => {
    let date: Date;

    if (typeof og === 'object') {
        const seconds = og._seconds;
        const nanoseconds = og._nanoseconds;
        date = new Date(seconds * 1000 + nanoseconds / 1000000);
    } else {
        date = new Date(og);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${month} - ${day} - ${year}`;
}

export const parseFormattedDate = (formattedDate: string): Date => {
    const [month, day, year] = formattedDate.split(' - ').map(Number);
    return new Date(year, month - 1, day);
};

export const compareFormattedDates = (a: string, b: string): number => {
    const dateA = parseFormattedDate(a);
    const dateB = parseFormattedDate(b);
    return dateA.getTime() - dateB.getTime();
};

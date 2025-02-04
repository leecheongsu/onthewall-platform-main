import { Timestamp } from 'firebase/firestore';
const getTimestampByDayBefore = (day: number) => {
  return Timestamp.fromDate(new Date(Date.now() - day * 24 * 60 * 60 * 1000));
};

export default getTimestampByDayBefore;

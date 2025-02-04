// 날짜 범위를 선택할 수 있는 DateRange 컴포넌트
import * as React from 'react';
import Box from '@mui/joy/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';

type Props = {
  fromDate: any;
  setFromDate: React.Dispatch<React.SetStateAction<any>>;
  toDate: any;
  setToDate: React.Dispatch<React.SetStateAction<any>>;
};

export default function DateRange({ fromDate, setFromDate, toDate, setToDate }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box display="flex" gap={2}>
        <DatePicker
          label="From"
          value={fromDate}
          onChange={(newValue) => {
            setFromDate(newValue);
            if (moment(newValue).isAfter(toDate)) {
              setToDate(null); // fromDate가 toDate보다 크면 toDate 초기화
            }
          }}
          slotProps={{ textField: { size: 'small', style: { width: 150 } } }}
          disableFuture
          maxDate={toDate} // toDate 이후는 선택 불가
        />
        <DatePicker
          label="To"
          value={toDate}
          onChange={(newValue) => setToDate(newValue)}
          slotProps={{ textField: { size: 'small', style: { width: 150 } } }}
          disableFuture
          minDate={fromDate} // fromDate 이전은 선택 불가
        />
      </Box>
    </LocalizationProvider>
  );
}

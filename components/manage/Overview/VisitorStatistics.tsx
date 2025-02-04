import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
// chart
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import Card from './StatisticsCard';
import { CircularProgress } from '@mui/material';
import { moduleApis } from '@/api/module';
import { useProjectStore } from '@/store/project';
import { useLanguageStore } from '@/store/language';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

interface VisitorStatistic {
  createdAt: Date;
  count: number;
}

type Props = {};

const INITIAL_OPTIONS = [
  { value: 'view', label: 'View' },
  { value: 'pageView', label: 'Page View' },
  { value: 'like', label: 'Like' },
  { value: 'comment', label: 'Comment' },
];

const VisitorStatistics: React.FC<Props> = ({}) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const optionState = useState<'view' | 'pageView' | 'like' | 'comment'>('view');
  const { projectId } = useProjectStore((state) => state);
  const [selectOptions, setSelectOptions] = useState(INITIAL_OPTIONS);
  const [graphData, setGraphData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: t('Visitor Count'),
        data: [],
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  });
  const [options, setOptions] = useState<ChartOptions<'line'>>({
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  });
  // 한달전
  const dateMonthAgo = moment(new Date()).subtract(1, 'months');
  const [fromDate, setFromDate] = useState<any>(dateMonthAgo);
  const [toDate, setToDate] = useState<any>(moment(new Date()));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const from = fromDate.format('YYYY-MM-DD');
      const to = toDate.format('YYYY-MM-DD');
      const res = await moduleApis.getViewLogsByProjectId(projectId, { type: optionState[0], from, to });
      const data = res.data?.views ?? [];
      const max = Math.max(...data.map((stat: VisitorStatistic) => stat.count));
      setOptions((prev) => ({
        ...prev,
        scales: {
          ...prev.scales,
          y: {
            ...prev.scales!.y,
            max: Math.round(max * 1.3) + 1,
          },
        },
      }));
      const chartData: ChartData<'line'> = {
        labels: (data as { date: any; count: number }[]).map((stat) => new Date(stat.date + ' 24:00')),
        datasets: [
          {
            label: t('Visitor Count'),
            data: (data as { date: any; count: number }[]).map((stat) => stat.count),
            fill: true,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1,
          },
        ],
      };
      setGraphData(chartData);
      setIsLoading(false);
    };
    fetchData();
  }, [optionState[0], projectId, t, fromDate, toDate]);

  useEffect(() => {
    if (language === 'kr') {
      setSelectOptions([
        { value: 'view', label: '조회수' },
        { value: 'pageView', label: '페이지뷰' },
        { value: 'like', label: '좋아요' },
        { value: 'comment', label: '댓글' },
      ]);
    } else {
      setSelectOptions(INITIAL_OPTIONS);
    }
  }, [language]);

  const handleClickDownload = () => {
    // CSV 데이터로 변환
    const csvRows = [];

    // 헤더 추가
    const headers = ['Date', 'Visitor Count'];
    csvRows.push(headers.join(','));

    // 데이터 추가
    graphData.labels?.forEach((label, index) => {
      const date = moment(new Date(label as string)).format('YYYY-MM-DD'); // 날짜 형식으로 변환
      const count = graphData.datasets[0].data[index];
      csvRows.push([date, count].join(','));
    });

    // CSV 문자열 생성
    const csvString = csvRows.join('\n');

    // 다운로드 트리거
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'visitor_statistics.csv');
    a.click();
  };

  return (
    <Card
      header={t(`Statistics`)}
      selectOptions={selectOptions}
      selectState={optionState}
      fromDate={fromDate}
      setFromDate={setFromDate}
      toDate={toDate}
      setToDate={setToDate}
      onDownloadClick={handleClickDownload}
    >
      <ChartWrapper>
        {isLoading && (
          <PlaceHolder>
            <CircularProgress />
          </PlaceHolder>
        )}
        {!isLoading && <StyledLine data={graphData} options={options} />}
      </ChartWrapper>
    </Card>
  );
};

export default VisitorStatistics;

const ChartWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const StyledLine = styled(Line)`
  width: 100% !important;
  height: 200px !important;
`;

const PlaceHolder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 200px;
  width: 100%;
`;

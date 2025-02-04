// import React, { useEffect, useState } from 'react';
// import styled from '@emotion/styled';
// import { useTranslation } from 'react-i18next';
// // chart
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   TimeScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartOptions,
//   ChartData,
// } from 'chart.js';
// import 'chartjs-adapter-date-fns';
// import Card from './Card';
// import { CircularProgress } from '@mui/material';
// import { moduleApis } from '@/api/module';
// import { useProjectStore } from '@/store/project';

// ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

// interface VisitorStatistic {
//   createdAt: Date;
//   count: number;
// }

// type Props = {};

// const VisitorStatistics: React.FC<Props> = ({}) => {
//   const { t } = useTranslation();
//   const { projectId } = useProjectStore((state) => state);
//   const [graphData, setGraphData] = useState<ChartData<'line'>>({
//     labels: [],
//     datasets: [
//       {
//         label: 'Visitor Count',
//         data: [],
//         fill: true,
//         backgroundColor: 'rgba(75,192,192,0.2)',
//         borderColor: 'rgba(75,192,192,1)',
//         tension: 0.1,
//       },
//     ],
//   });
//   const [options, setOptions] = useState<ChartOptions<'line'>>({
//     scales: {
//       x: {
//         type: 'time',
//         time: {
//           unit: 'day',
//         },
//       },
//       y: {
//         beginAtZero: true,
//         max: 100,
//       },
//     },
//     responsive: true,
//     maintainAspectRatio: false,
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     setIsLoading(true);
//     const fetchData = async () => {
//       const res = await moduleApis.getViewLogsByProjectId(projectId, {  type: 'view' });
//       const data = res.data?.views ?? [];
//       const max = Math.max(...data.map((stat: VisitorStatistic) => stat.count));
//       setOptions((prev) => ({
//         ...prev,
//         scales: {
//           ...prev.scales,
//           y: {
//             ...prev.scales!.y,
//             max: Math.round(max * 1.3) + 1,
//           },
//         },
//       }));
//       const chartData: ChartData<'line'> = {
//         labels: (data as { date: any; count: number }[]).map((stat) => new Date(stat.date + ' 24:00')),
//         datasets: [
//           {
//             label: t('Visitor Count'),
//             data: (data as { date: any; count: number }[]).map((stat) => stat.count),
//             fill: true,
//             backgroundColor: 'rgba(75,192,192,0.2)',
//             borderColor: 'rgba(75,192,192,1)',
//             tension: 0.1,
//           },
//         ],
//       };
//       setGraphData(chartData);
//       setIsLoading(false);
//     };
//     fetchData();
//   }, []);

//   return (
//     <Card header={t('Visitor Statistics')}>
//       <ChartWrapper>
//         {isLoading && (
//           <PlaceHolder>
//             <CircularProgress />
//           </PlaceHolder>
//         )}
//         {!isLoading && <StyledLine data={graphData} options={options} />}
//       </ChartWrapper>
//     </Card>
//   );
// };

// export default VisitorStatistics;

// const ChartWrapper = styled.div`
//   flex: 1;
//   display: flex;
//   align-items: center;
// `;

// const StyledLine = styled(Line)`
//   width: 100% !important;
//   height: 200px !important;
// `;

// const PlaceHolder = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex: 1;
//   height: 200px;
//   width: 100%;
// `;

import React from 'react';

type Props = {};

function VisitorStatistics({}: Props) {
  return <div>VisitorStatistics</div>;
}

export default VisitorStatistics;

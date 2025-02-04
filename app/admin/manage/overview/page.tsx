'use client';
import React, { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { getDocs, collection, where, query } from 'firebase/firestore';
import styled from '@emotion/styled';
import { Button } from '@mui/material';

type Props = {};

const Page = (props: Props) => {
  const [show, setShow] = React.useState(false);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [totalExhibitions, setTotalExhibitions] = React.useState(0);
  const [usersInThisMonth, setUsersInThisMonth] = React.useState(0);
  const [exhibitionsInThisMonth, setExhibitionsInThisMonth] = React.useState(0);
  const [totalViews, setTotalViews] = React.useState(0);
  const [todayViews, setTodayViews] = React.useState(0);
  const [usersIn2024, setUsersIn2024] = React.useState(0);
  const [exhibitionsIn2024, setExhibitionsIn2024] = React.useState(0);
  const [exhibitionsOver50views, setExhibitionsOver50views] = React.useState(0);
  const [exhibitionsOver100views, setExhibitionsOver100views] = React.useState(0);
  const [exhibitionsOver300views, setExhibitionsOver300views] = React.useState(0);
  const [averageExhibitionsOver50views, setAverageExhibitionsOver50views] = React.useState(0);
  const [averageExhibitionsOver100views, setAverageExhibitionsOver100views] = React.useState(0);
  const [averageExhibitionsOver300views, setAverageExhibitionsOver300views] = React.useState(0);

  const [totalLikes, setTotalLikes] = React.useState(0);

  useEffect(() => {
    if (!show) return;
    const fetchUsers = async () => {
      const q = collection(db, 'User');
      const querySnapshot = await getDocs(q);
      setTotalUsers(querySnapshot.size);
    };

    const fetchUsersInThisMonth = async () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const q = collection(db, 'User');
      const q2 = query(q, where('createdAt', '>=', thisMonth));
      const querySnapshot = await getDocs(q2);
      setUsersInThisMonth(querySnapshot.size);
    };
    const fetchExhibitionsInThisMonth = async () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const q = collection(db, 'Exhibition');
      const q2 = query(q, where('createdAt', '>=', thisMonth));
      const querySnapshot = await getDocs(q2);
      setExhibitionsInThisMonth(querySnapshot.size);
    };
    const fetchExhibitions = async () => {
      const q = collection(db, 'Exhibition');
      const querySnapshot = await getDocs(q);
      setTotalExhibitions(querySnapshot.size);
      let totalViews = 0;
      let todayViews = 0;
      let totalLikes = 0;
      querySnapshot.forEach((doc) => {
        if (doc.data().views.totalView !== undefined) {
          totalViews += doc.data().views.totalView;
        }
        if (doc.data().views.todayView !== undefined) {
          todayViews += doc.data().views.todayView;
        }
        if (doc.data().like !== undefined) {
          totalLikes += doc.data().like ?? 0;
        }
      });

      setTotalLikes(totalLikes);
      setTotalViews(totalViews);
      setTodayViews(todayViews);
    };
    const fetchUsersIn2024 = async () => {
      const q = collection(db, 'User');
      const q2 = query(q, where('createdAt', '>=', new Date(2024, 0, 1)));
      const querySnapshot = await getDocs(q2);
      setUsersIn2024(querySnapshot.size);
    };
    const fetchExhibitionsIn2024 = async () => {
      const q = collection(db, 'Exhibition');
      const q2 = query(q, where('createdAt', '>=', new Date(2024, 0, 1)));
      const querySnapshot = await getDocs(q2);
      setExhibitionsIn2024(querySnapshot.size);
    };
    const fetchExhibitionsOver = async (num: number) => {
      const q = collection(db, 'Exhibition');
      const q2 = query(q, where('views.totalView', '>=', num));
      const querySnapshot = await getDocs(q2);
      let views: number = 0;
      querySnapshot.forEach((doc) => {
        if (doc.data().views.totalView !== undefined) views += doc.data().views.totalView;
      });

      return { views, querySnapshot };
    };

    fetchExhibitionsOver(50).then((result) => {
      setExhibitionsOver50views(result.querySnapshot.size);
      setAverageExhibitionsOver50views(result.views / result.querySnapshot.size);
    });

    fetchExhibitionsOver(100).then((result) => {
      setExhibitionsOver100views(result.querySnapshot.size);
      setAverageExhibitionsOver100views(result.views / result.querySnapshot.size);
    });

    fetchExhibitionsOver(300).then((result) => {
      setExhibitionsOver300views(result.querySnapshot.size);
      setAverageExhibitionsOver300views(result.views / result.querySnapshot.size);
    });

    fetchUsers();
    fetchExhibitions();

    fetchUsersIn2024();
    fetchExhibitionsIn2024();

    fetchUsersInThisMonth();
    fetchExhibitionsInThisMonth();
  }, [show]);
  return (
    <Container>
      <H1>Overview</H1>
      <Button onClick={() => setShow(true)}>Show</Button>
      <H2>Total</H2>
      <p>Users: {totalUsers}</p>
      <p>Exhibitions: {totalExhibitions}</p>
      <p>Total views: {totalViews}</p>
      <p>Today views: {todayViews}</p>
      <p>Total likes: {totalLikes}</p>
      <br />
      <H2>This Month</H2>
      <p>Users in this month: {usersInThisMonth}</p>
      <p>Exhibitions in this month: {exhibitionsInThisMonth}</p>

      <br />
      <H2>2024</H2>
      <p>Users in 2024: {usersIn2024}</p>
      <p>Exhibitions in 2024: {exhibitionsIn2024}</p>
      <br />
      <H2>Exhibitions</H2>
      <p>Exhibitions over 50 views: {exhibitionsOver50views}</p>
      <p>Average views: {Math.round(averageExhibitionsOver50views)}</p>
      <p>Exhibitions over 100 views: {exhibitionsOver100views}</p>
      <p>Average views: {Math.round(averageExhibitionsOver100views)}</p>
      <p>Exhibitions over 300 views: {exhibitionsOver300views}</p>
      <p>Average views: {Math.round(averageExhibitionsOver300views)}</p>
    </Container>
  );
};

export default Page;

const Container = styled.div`
  padding: 20px;
`;
const H1 = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const H2 = styled.h2`
  font-size: 20px;
  margin-bottom: 10px;
`;

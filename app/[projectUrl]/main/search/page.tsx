'use client';
import React, { useEffect } from 'react';
import SearchComponent from '@/components/home/search/SearchComponent';
import { useProjectStore } from '@/store/project';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
type Props = {};

function page({}: Props) {
  const { projectId } = useProjectStore();
  // useEffect(() => {
  //   getDocs(query(collection(db, 'Exhibition'), where('cloudData.clientId', '==', 'jncf'))).then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       updateDoc(doc.ref, { projectId: 'mzkxBnybPdIoMVQ4wmVh' });
  //     });
  //   });
  // }, []);
  return (
    <>
      <SearchComponent projectId={projectId} />
    </>
  );
}

export default page;

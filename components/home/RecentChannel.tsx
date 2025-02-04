import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import RightIcon from '@/images/icons/Right';
import { useProjectStore } from '@/store/project';
import LinkToast from '@/components/LinkToast';
import { useMobileViewStore } from '@/store/mobile';

// data
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

// components
import GroupChannel from '@/components/GroupChannel';

type Props = {};
const RecentChannel = ({}: Props) => {
  const { t } = useTranslation();

  const title = t('Recent Channel');
  const description = t('This is a newly created channel on ONTHEWALL.');
  const type = 'RECENT_CHANNEL';

  const [channel, setChannel] = useState([]);

  useEffect(() => {
    const cache = new Map(); // 캐시를 위한 Map 객체

    const fetchData = async () => {
      const projectsRef = collection(db, 'Project');
      const q = query(projectsRef, where('tier', 'in', ['personal', 'business']));

      try {
        const querySnapshot = await getDocs(q);
        const projectList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((project: any) => project.currentExhibitionCount >= 2 && project.viewCount >= 50);

        const channelDataPromises = projectList.map(async (project) => {
          if (cache.has(project.id)) {
            // 캐시에 이미 데이터가 있는 경우, 캐시된 값을 사용
            return cache.get(project.id);
          } else {
            const projectDesignRef = doc(db, 'ProjectDesign', project.id);
            const docSnapshot = await getDoc(projectDesignRef);

            if (docSnapshot.exists()) {
              const docData = docSnapshot.data();
              const updatedData = {
                ...project,
                ...docData.channelData,
              };
              // 데이터를 캐시에 저장
              cache.set(project.id, updatedData);
              return updatedData;
            } else {
              console.error(`Document with id ${project.id} does not exist.`);
              return project;
            }
          }
        });

        const updatedProjects: any = await Promise.all(channelDataPromises);
        setChannel(updatedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchData();
  }, []);

  return <GroupChannel title={title} description={description} type={type} channel={channel} />;
};
export default RecentChannel;

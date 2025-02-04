'use client';

import { useProjectStore } from '@/store/project';
import { useDesignStore } from '@/store/design';
import { ReactNode, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, Timestamp, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  children: ReactNode;
}

const ProjectLayout = ({ children }: Props) => {
  const param = useParams<{ projectUrl: string }>();
  const router = useRouter();

  const { fetchProjectDataByUrl, fetchProjectDataStatus, updateInfo, projectId, projectUrl } = useProjectStore();
  const { fetchDesignDataByProjectUrl } = useDesignStore();

  const [pass, setPass] = useState(false);

  useEffect(() => {
    if (param?.projectUrl !== projectUrl) {
      updateInfo('fetchProjectDataStatus', 'wait');
    }
  }, [param?.projectUrl]);
  useEffect(() => {
    if (param?.projectUrl && fetchProjectDataStatus === 'wait') {
      fetchProjectDataByUrl(param?.projectUrl);
      fetchDesignDataByProjectUrl(param?.projectUrl);
    }
  }, [fetchProjectDataStatus]);

  useEffect(() => {
    if (fetchProjectDataStatus === 'error') {
      updateInfo('fetchProjectDataStatus', 'wait');
      router.push('/home');
    }
  }, [fetchProjectDataStatus]);

  useEffect(() => {
    if (fetchProjectDataStatus === 'done') {
      // pass 처리
      setPass(true);

      const views = JSON.parse(sessionStorage.getItem('viewProject') ?? '[]');
      // view 카운트
      // PageViewLog-YYYY-MM-DD
      if (views.includes(projectId)) return;
      const date = Timestamp.now().toDate().toISOString().slice(0, 10);
      const docId = `PageViewLog-${date}`;
      const docRef = doc(db, 'Project', projectId, 'PageViewLog', docId);
      setDoc(
        docRef,
        {
          count: increment(1),
          date,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      updateDoc(doc(db, 'Project', projectId), {
        pageViewCount: increment(1),
        updatedAt: Timestamp.now(),
      });

      sessionStorage.setItem('viewProject', JSON.stringify(views.concat(projectId)));

      return;
    }
  }, [fetchProjectDataStatus]);

  if (!pass) return null;
  return <>{children}</>;
};

export default ProjectLayout;

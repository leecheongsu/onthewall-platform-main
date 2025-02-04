'use client';

import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { ComponentType, useEffect, useState } from 'react';

const withAuth = (WrappedComponent: ComponentType<any>, requiredStatus: string[], requiredTier: string[]) => {
  return (props: any) => {
    const { status, projectsMap, ownProjectIds } = useUserStore();
    const { tier, projectId } = useProjectStore();
    const projectUrl = useParams<{ projectUrl: string }>()?.projectUrl;
    const [passedUrl, setPassedUrl] = useState<string | null>(null);
    const router = useRouter();
    const [pass, setPass] = useState(false);

    useEffect(() => {
      if (!projectUrl) return;

      if (passedUrl === projectUrl) return;
      // status가 superadmin인 경우 패스하기 위함.
      if (status === 'general') {
        // projectId는 projectUrl로부터 가져와야하기 때문에 시간이 걸림. 그래서 projectUrl로 검증함.
        const ownProjectUrls = ownProjectIds.map((id) => projectsMap[id]?.data?.projectUrl);
        // 없을 때 처리
        if (!ownProjectUrls.includes(projectUrl)) {
          const yes = confirm('You are not authorized to access this page. Do you want to go to your project page?');
          if (yes) {
            // 본인 페이지로 이동
            router.push(`/${ownProjectUrls[0]}/manage`);
            return;
          } else {
            // 홈으로 이동.
            router.push(`/home`);
            return;
          }
        }
      }

      setPassedUrl(projectUrl);
    }, [status, tier, projectsMap, projectUrl, projectId, ownProjectIds]);

    useEffect(() => {
      // projectId가 있을 때 처리
      if (!projectId) return;

      if (projectUrl !== projectsMap[projectId]?.data.projectUrl) return;
      // 소속 프로젝트 일 경우. 본인이 들어갈 수 있는 페이지인지 확인.

      setPass(false);
      const userStatus = projectsMap[projectId]?.status;

      if (!requiredStatus.includes(userStatus) || (tier && !requiredTier.includes(tier))) {
        router.push(`/${projectUrl}/manage`);
        return;
      }
      setPass(true);
    }, [projectId, passedUrl, status, tier, projectsMap]);

    if (!pass) return null;
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

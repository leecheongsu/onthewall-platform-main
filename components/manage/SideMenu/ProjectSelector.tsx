'use client';
// project를 선택할 수 있는 컴포넌트입니다.
// 하나의 프로젝트만 있을 경우 해당 프로젝트의 이름만 나타냅니다.
// project를 선택하면 다른 프로젝트로 이동합니다.
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Select, Option } from '@mui/joy';
import { useRouter } from 'next/navigation';

type Props = {};

function ProjectSelector({}: Props) {
  const { projectId } = useProjectStore((state) => state);
  const { projectsMap, projects } = useUserStore((state) => state);
  const [projectsList, setProjectsList] = React.useState<any[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (projects.length > 0) setIsLoading(false);
    setProjectsList([]);
    const p: any = [];
    projects.forEach((project) => {
      if (projectsMap[project.id]?.data?.channelName) {
        p.push(projectsMap[project.id]);
      }
    });
    setProjectsList(p);
    setIsLoading(false);
  }, [projects]);
  const handleClick = (id: string) => {
    router.push(`/${projectsMap[id].data.projectUrl}/manage`);
  };
  if (isLoading) return <></>;
  return (
    <Container>
      <StyledSelect value={projectId} variant="plain">
        {projectsList.map((project) => (
          <StyledOption key={project.id} value={project.id} onClick={() => handleClick(project.id)}>
            {projectsMap[project.id]?.data.channelName}
          </StyledOption>
        ))}
      </StyledSelect>
    </Container>
  );
}

export default ProjectSelector;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  flex-direction: column;
  font-weight: 500;
  color: var(--Neutral-100);
`;

const StyledSelect = styled(Select)`
  width: 100%;
  height: 100%;
  font-weight: 500;
  color: var(--Neutral-100);
  padding: 10px;
`;
const StyledOption = styled(Option)`
  font-weight: 500;
  color: var(--Neutral-100);
`;

const ChannelName = styled.div`
  font-weight: 500;
  color: var(--Neutral-100);
  border-radius: 5px;
  display: inline-block;
  width: 100%;
`;

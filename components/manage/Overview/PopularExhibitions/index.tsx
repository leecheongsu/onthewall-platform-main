import React, { useEffect } from 'react';
import Card from '../Card';
import styled from '@emotion/styled';
import { moduleApis, moduleActionApis } from '@/api/module';
import { useProjectStore } from '@/store/project';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ThinExhibitionCard from './ThinExhibitionCard';

type Props = {};

function PopularExhibitions({}: Props) {
  const { t } = useTranslation();
  const [exhibitions, setExhibitions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { projectId } = useProjectStore((state) => state);

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const { data } = (await moduleApis.getExhibitionsByProjectId(projectId, 'totalViews', 3, 1, 'main')) as any;
      setExhibitions(data.exhibitions ?? []);
      setIsLoading(false);
    };
    fetchData();
  }, [projectId]);

  return (
    <Card header={t('Popular Exhibitions')}>
      {isLoading && (
        <PlaceHolder>
          <CircularProgress />
        </PlaceHolder>
      )}
      {/* 아무것도 없을 때 */}
      {!isLoading && exhibitions.length === 0 && <PlaceHolder>{t('No exhibitions found')}</PlaceHolder>}
      {!isLoading && (
        <div>
          {exhibitions.map((exhibition: any) => (
            <ThinExhibitionCard data={exhibition} key={exhibition.id} />
          ))}

          {/* 개수가 모자랄 때 */}
          {exhibitions.length > 0 &&
            exhibitions.length < 3 &&
            Array.from({ length: 3 - exhibitions.length }).map((_, index) => <ExhibitionCardPlaceholder key={index} />)}
        </div>
      )}
    </Card>
  );
}

export default PopularExhibitions;

const PlaceHolder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 240px;
`;

const ExhibitionCardPlaceholder = styled.div`
  height: 70px;
`;

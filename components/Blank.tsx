import React from 'react';

// store
import { useMobileViewStore } from '@/store/mobile';

// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

interface Props {
  data: any;
  isMain?: boolean;
}

export default function Blank({ data, isMain }: Props) {
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();

  return (
    <Box className={isMain ? 'main' : mobileView ? 'mobile' : ''} height={data?.height}>
      {mobileView || isMain ? (
        ''
      ) : (
        <BlankMessage>
          {data?.height < 60 ? (
            ''
          ) : (
            <>
              <p>{t('The height is set as default.')}</p>
              <p>{t('If you want to change it, you can adjust the height through the edit button.')}</p>
            </>
          )}
        </BlankMessage>
      )}
    </Box>
  );
}

const Box = styled.div<{ height?: number }>`
  height: ${(props) => (props.height !== undefined ? props.height : 60)}px;
  text-align: center;
  border: 2px dashed #6fa0d2;
  color: #6fa0d2;
  font-size: 0.95rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${(props) => ((props.height as any) < 60 ? 0 : 8)}px;

  &.main {
    border: none;
  }
  &.mobile {
    height: ${(props) => (props.height !== undefined ? props.height / 2 : 30)}px;
  }

  @media (max-width: 768px) {
    height: ${(props) => (props.height !== undefined ? props.height / 2 : 30)}px;
  }
`;

const BlankMessage = styled.div`
  p {
    margin: 0;
  }
`;

'use client';
import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import Section from '@/main/section';
import AddSection from '@/components/manage/designMode/MainDisplay/AddSection';
import { useTranslation } from 'react-i18next';
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/MainHeader';
import Total from '@/components/GroupExhibition/Total';
import { useMobileViewStore } from '@/store/mobile';

type Props = {
  data: any[];
  setData: (data: any[]) => void;
};

function MainDisplay({ data, setData }: Props) {
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();

  const getOrder = useCallback(
    (index: number, isPrev: boolean = false): number => {
      if (isPrev) {
        if (index === 0) {
          return data[0].order - 1;
        } else {
          return (data[index].order + data[index - 1].order) / 2;
        }
      } else {
        if (index === data.length - 1) {
          return data[data.length - 1].order + 1;
        } else {
          return (data[index].order + data[index + 1].order) / 2;
        }
      }
    },
    [data]
  );

  return (
    <Wrapper mobileView={mobileView}>
      <Navbar />
      <Container>
        {data.length !== 0 ? (
          (data as any)
            .sort((a: any, b: any) => {
              if (a.order === b.order) {
                return b.updatedAt - a.updatedAt;
              }
              return a.order - b.order;
            })
            .map((section: any, idx: number) => {
              if (idx === 0) {
                return (
                  <React.Fragment key={`section-group-${idx}`}>
                    <AddSection
                      order={getOrder(idx, true)}
                      data={data}
                      setData={setData}
                      key={`add-section-top-${idx}`}
                      idx={idx}
                    />
                    <Section key={`section-${idx}`} data={section} setData={setData} />
                    <AddSection
                      order={getOrder(idx)}
                      data={data}
                      setData={setData}
                      key={`add-section-bottom-${idx}`}
                      idx={idx + 1}
                    />
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={`section-group-${idx}`}>
                    <Section key={`section-${idx}`} data={section} setData={setData} />
                    <AddSection
                      order={getOrder(idx)}
                      data={data}
                      setData={setData}
                      key={`add-section-bottom-${idx}`}
                      idx={idx + 1}
                    />
                  </React.Fragment>
                );
              }
            })
        ) : (
          <AddSection order={0} data={data} setData={setData} />
        )}
        <Total />
      </Container>
      <Footer />
    </Wrapper>
  );
}

export default MainDisplay;

const Wrapper = styled.div<{ mobileView?: boolean }>`
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: ${(props) => (props.mobileView ? '430px' : '100%')};
  margin: 0 auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
  max-width: 1200px;
  padding-bottom: 60px;
`;

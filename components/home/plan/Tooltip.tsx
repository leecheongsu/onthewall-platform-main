import React, { useEffect, useState } from 'react';

// data
import { TooltipDataKR, TooltipDataEN } from '@/constants/plan';

// store
import { useLanguageStore } from '@/store/language';

// lib
import { useTranslation } from 'next-i18next';

// style
import styled from '@emotion/styled';

type Props = {
  category?: any;
};

const Tooltip = ({ category }: Props) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [tooltipText, setTooltipText] = useState('');

  useEffect(() => {
    switch (category) {
      case 'Channel':
        setTooltipText(TooltipDataEN.Channel);
        break;
      case 'Custom Page':
        setTooltipText(TooltipDataEN.CustomPage);
        break;
      case 'Site Settings':
        setTooltipText(TooltipDataEN.SiteSetting);
        break;
      case '채널':
        setTooltipText(TooltipDataKR.Channel);
        break;
      case '커스텀 페이지':
        setTooltipText(TooltipDataKR.CustomPage);
        break;
      case '사이트 기본설정':
        setTooltipText(TooltipDataKR.SiteSetting);
        break;
    }
    console.log('category', category);
  }, [category, language]);

  return <Box>{tooltipText}</Box>;
};

export default Tooltip;

const Box = styled.p`
  position: absolute;
  left: 50%;
  top: 50%;
  background-color: white;
  padding: 15px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  word-break: keep-all;
  word-wrap: break-word;
  min-width: 200px;
  z-index: 100;
  font-size: 1rem;
  font-weight: 400;
`;

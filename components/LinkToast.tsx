import React from 'react';

// store
import { useToastStore } from '@/store/toast';

// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

type Props = {};

const LinkToast = ({}: Props) => {
  const { t } = useTranslation();
  const isToastVisible = useToastStore((state) => state.isToastVisible);
  return <Toast className={`${isToastVisible ? 'on' : 'off'}`}>{t('Link has been copied!')}</Toast>;
};

export default LinkToast;

const Toast = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 40px);
  background-color: #333;
  color: #fff;
  padding: 7px 25px;
  border-radius: 25px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.2s ease, transform 0.2s ease;
  width: max-content;
  &.on {
    z-index: 11;
    opacity: 1;
    transform: translate(-50%, -25px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
`;

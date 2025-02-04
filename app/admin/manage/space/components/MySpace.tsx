'use client';

import React from 'react';
// data
import { MYSPACE } from '@/constants/space';

//lib
import { useTranslation } from 'react-i18next';

//mui + styled
import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';

type Props = {
  initialValues: any;
  setInitialValues: any;
};

const MySpace = ({ initialValues, setInitialValues }: Props) => {
  const { t } = useTranslation();

  return (
    <Content>
      {MYSPACE.map((field, index) => (
        <Box key={index}>
          <Label>{t(field.label)}</Label>
          <Description>{t(field.description)}</Description>
          <TextField
            fullWidth
            size="small"
            name={field.name}
            variant="outlined"
            placeholder={t(field.placeholder)}
            onChange={(e) => setInitialValues({ ...initialValues, [field.name]: e.target.value })}
          />
        </Box>
      ))}
    </Content>
  );
};

export default MySpace;

const Box = styled.div`
  margin-bottom: 28px;
  & .MuiFormHelperText-root {
    color: #ff3848;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 15px;
  line-height: 24px;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 13px;
  line-height: 20px;
  color: #414141;
  padding-bottom: 16px;
`;

const Content = styled.div`
  padding: 12px;
  min-width: 640px;
  max-width: 900px;
`;

const ImageField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const Thumbnail = styled.div`
  width: 290px;
  height: 160px;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

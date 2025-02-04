'use client';

import React from 'react';

// data
import { NEWSPACE } from '@/constants/space';

//lib
import { useTranslation } from 'react-i18next';

//mui + styled
import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { CardMedia } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// components
import ImageUploadButton from '@/components/ImageUploadButton';

type Props = {
  imageData: any;
  setImageData: any;
  initialValues: any;
  setInitialValues: any;
  isLoading: any;
  setLoading: any;
};

const NewSpace = ({ imageData, setImageData, initialValues, setInitialValues, isLoading, setLoading }: Props) => {
  const { t } = useTranslation();

  return (
    <Content>
      {NEWSPACE.map((field: any, idx: number) => (
        <Box key={idx}>
          {field.name === 'projectUrl' && initialValues.isPublic === true ? null : (
            <>
              <Label>{t(field.label)}</Label>
              <Description>{t(field.description)}</Description>
            </>
          )}

          {field.type === 'thumbnail' && (
            <ImageField>
              <Thumbnail>
                {imageData.originalImage.url && <CardMedia component="img" src={imageData.originalImage.url} />}
              </Thumbnail>
              <ImageUploadButton
                imageData={imageData}
                setImageData={setImageData}
                isLoading={isLoading}
                setLoading={setLoading}
              />
            </ImageField>
          )}

          {(field.type === 'text' || (field.name === 'projectUrl' && !initialValues.isPublic)) && (
            <TextField
              fullWidth
              size="small"
              name={field.name}
              variant="outlined"
              placeholder={t(field.placeholder || '')}
              onChange={(e) => setInitialValues({ ...initialValues, [field.name]: e.target.value })}
            />
          )}

          {field.type === 'select' && (
            <Select
              value={String(initialValues[field.name])}
              onChange={(event) => {
                const newValue = event.target.value === 'true';
                setInitialValues({ ...initialValues, [field.name]: newValue });
              }}
              size="small"
            >
              {field.options.map((option: any, idx: number) => (
                <MenuItem key={idx} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      ))}
    </Content>
  );
};

export default NewSpace;

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

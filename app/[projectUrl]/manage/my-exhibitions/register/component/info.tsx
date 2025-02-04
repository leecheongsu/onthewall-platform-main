import React, { useState, useEffect } from 'react';

// api
import { moduleApis } from '@/api/module';

// store
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { useDesignStore } from '@/store/design';

// lib
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { TextField } from '@mui/material';

// icons
import ChevronLeft from '@/images/icons/ChevronLeft';
import ChevronRight from '@/images/icons/ChevronRight';

// comp
import ImageUploadButton from '@/components/ImageUploadButton';
import { useRouter } from 'next/navigation';
import { updateExhibitionCount } from '@/api/firestore/getProject';
import { DENY_USER } from '@/constants/acess';
import getBuilderLink from '@/utils/getBuilderLink';

interface Props {
  showcase: any;
  setActiveStep: any;
}

const Info = ({ showcase, setActiveStep }: Props) => {
  const { i18n, t } = useTranslation();
  const { projectId, projectUrl } = useProjectStore();
  const { uid, projectsMap } = useUserStore();
  const theme = useDesignStore((state) => state.theme);
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const [imageData, setImageData] = useState({
    originalImage: { path: '', url: '' },
    thumbnailImage: { path: '', url: '' },
    compressedImage: { path: '', url: '' },
  });

  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
  });

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t('Please enter the exhibition name')).max(20, t('Please enter within 20 characters')),
  });

  // 전시회 생성 로직
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const data = {
        uid: uid,
        projectId,
        spaceId: showcase.space.id,
        title: values.title,
        author: '',
        description: values.description,
        isPrivate: false,
        isHidden: false,
        posterImage: {
          compressed: {
            path: imageData.compressedImage.path,
            url: imageData.compressedImage.url,
          },
          original: {
            path: imageData.originalImage.path,
            url: imageData.originalImage.url,
          },
          thumbnail: {
            path: imageData.thumbnailImage.path,
            url: imageData.thumbnailImage.url,
          },
        },
        config: {},
      };
      // 전시회 생성
      const res = await moduleApis.createExhibition(data);
      // 전시회 생성 개수 추가
      updateExhibitionCount(projectId, status);
      if (res) {
        const { token, exhibitionId } = (res as any).data;
        if (!token || !exhibitionId) {
          alert(t('Failed to create exhibition'));
        } else {
          getBuilderLink(projectId, exhibitionId, projectsMap[projectId].status, token).then((builderLink) => {
            window.open(builderLink);
            router.push(`/${projectUrl}/manage/my-exhibitions`);
          });
        }
      }
    } catch (e) {
      console.error('what???', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Container>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <StyledForm>
              <StyledTr>
                <Label>
                  {t('Title')} <span>*</span>
                </Label>
                <StyledTd>
                  <Field
                    name="title"
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    size="small"
                    helperText={<StyledErrorMessage name="title" component="div" className="error" />}
                  />
                </StyledTd>
              </StyledTr>

              <StyledTr>
                <Label>{t('Image')}</Label>
                <StyledTd>
                  <ImageUploadButton
                    imageData={imageData}
                    setImageData={setImageData}
                    isLoading={isLoading}
                    setLoading={setLoading}
                    imageUpload={imageData.compressedImage.url}
                  />
                  {imageData.compressedImage.url !== '' && (
                    <img
                      src={imageData.compressedImage.url}
                      alt="Image"
                      className="Image"
                      style={{ marginTop: '10px' }}
                    />
                  )}
                </StyledTd>
              </StyledTr>

              <StyledTr>
                <Label>{t('Description')}</Label>
                <StyledTd>
                  <Field
                    name="description"
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    helperText={<StyledErrorMessage name="description" component="div" className="error" />}
                  />
                </StyledTd>
              </StyledTr>
              <Buttons>
                <Button
                  theme={theme.primary}
                  onClick={() => {
                    setActiveStep(0);
                  }}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t('Prev')}
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading} theme={theme.primary}>
                  {t('Create Exhibition')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Buttons>
            </StyledForm>
          )}
        </Formik>
      </Container>
    </>
  );
};

export default Info;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 800px;
  max-width: calc(100vw - 80px);
  padding: 50px;
  box-sizing: border-box;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 10px;
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTr = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Button = styled.button<{ theme: any }>`
  background-color: ${(props) => props.theme};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #d3d3d3;
  }
`;

const Label = styled.label`
  flex: 1;
  margin: 5px 0;

  & span {
    color: #ff3848;
  }
`;

const StyledTd = styled.div`
  flex: 3;
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: #ff3848;
  font-size: 14px;
  margin-top: 5px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & button {
    display: flex;
    align-items: center;
    padding: 10px 15px;
  }

  & svg {
  }
`;

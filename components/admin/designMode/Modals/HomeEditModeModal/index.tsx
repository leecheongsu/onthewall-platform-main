import { useEffect, useState } from 'react';

// api

// data
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';

// store
import { useProjectStore } from '@/store/project';

// lib
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { Modal, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

// comp
import { getMetadataByProjectId } from '@/api/firestore/getMetadata';
import ImageUploadButton from '@/components/ImageUploadButton';
import CloseIcon from '@/images/icons/Close';
import { useDesignStore } from '@/store/design';

interface Props {
  open: boolean;
  onClose: () => void;
}

const images = {
  originalImage: { path: '', url: '' },
  thumbnailImage: { path: '', url: '' },
  compressedImage: { path: '', url: '' },
};

export default function HomeEditModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const projectDesign = useDesignStore((state) => state);
  const { projectId } = useProjectStore((state) => ({
    projectId: state.projectId,
  }));

  const [isLogoLoading, setLogoLoading] = useState(false);
  const [isFavLoading, setFavLoading] = useState(false);
  const [isOgLoading, setOgLoading] = useState(false);

  const [logo, setLogo] = useState(images);
  const [favicon, setFavicon] = useState(images);
  const [ogUrl, setOgUrl] = useState(images);

  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    ogUrl: '',
    faviconUrl: '',
    logoUrl: '',
    footer: {
      company: '',
      copyright: '',
      company_en: '',
      copyright_en: '',
      blog: '',
      facebook: '',
      homepage: '',
      instagram: '',
    },
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const updatedValues = {
        ...values,
        id: projectId,
        ogUrl,
        logoUrl: logo.originalImage.url,
        faviconUrl: favicon.originalImage.url,
      };
      delete updatedValues.bannerUrl;

      const projectCollectionRef = collection(db, 'ProjectDesign');
      const q = query(projectCollectionRef, where('id', '==', projectId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, updatedValues);

        // const sectionCollectionRef = collection(docRef, "Section");
        // const q2 = query(sectionCollectionRef, orderBy("order", "asc"), limit(1));
        // const querySnapshot2 = await getDocs(q2);
        // if (querySnapshot2.size === 1) {
        // 	const docRef = querySnapshot2.docs[0].ref;
        // 	await updateDoc(docRef, { "desktop.url": banner.originalImage.url });
        // }

        onClose();
        // window.location.reload();
      } else {
        console.error('No document with the specified projectId found.');
      }
    } catch (e) {
      console.error('Error updating metadata: ', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: any) => {
    const { checked } = e.target;
    setInitialValues({
      ...initialValues,
      footer: {
        ...initialValues.footer,
      },
    });
  };

  // data fetching
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const metadata = await getMetadataByProjectId(projectId);

        setInitialValues({
          title: metadata.title,
          description: metadata.description,
          ogUrl: metadata.ogUrl,
          faviconUrl: metadata.faviconUrl,
          logoUrl: metadata.logoUrl,
          footer: {
            company: metadata.footer.company,
            copyright: metadata.footer.copyright,
            company_en: metadata.footer.company_en,
            copyright_en: metadata.footer.copyright_en,
            blog: metadata.footer.blog,
            facebook: metadata.footer.facebook,
            homepage: metadata.footer.homepage,
            instagram: metadata.footer.instagram,
          },
        });

        setLogo({
          originalImage: { path: '', url: metadata.logoUrl },
          thumbnailImage: { path: '', url: '' },
          compressedImage: { path: '', url: '' },
        });
        setFavicon({
          originalImage: { path: '', url: metadata.faviconUrl },
          thumbnailImage: { path: '', url: '' },
          compressedImage: { path: '', url: '' },
        });
        setOgUrl({
          originalImage: { path: '', url: metadata.ogUrl },
          thumbnailImage: { path: '', url: '' },
          compressedImage: { path: '', url: '' },
        });
      };
      fetchData();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box>
        <ModalHeader>
          <Title>{t('Site Settings')}</Title>
          <CloseButton onClick={onClose}>
            <CloseIcon className="h-5 w-5" />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
            {({ isSubmitting }) => (
              <StyledForm>
                <StyledTr>
                  <StyledTd>
                    <h3>{t('General')}</h3>
                  </StyledTd>
                </StyledTr>

                <div style={{ padding: '0 10px', marginBottom: '30px' }}>
                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Title')}</Label>
                      <Field
                        placeholder={t('Enter Title')}
                        name="title"
                        as={TextField}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="title" component="div" className="error" />}
                      />
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('Description')}</Label>
                      <Field
                        placeholder={t('Enter Description for your website')}
                        name="description"
                        as={TextField}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        multiline
                        rows={1}
                        size="small"
                        helperText={<StyledErrorMessage name="description" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>

                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Logo')}</Label>
                      <ImageThumbnail>
                        <img
                          src={!logo.originalImage.url ? projectDesign.logoUrl : logo.originalImage.url}
                          alt="logo"
                          className="logo"
                        />
                      </ImageThumbnail>
                      <ImageUploadButtonWrap>
                        <ImageUploadButton
                          isLoading={isLogoLoading}
                          setLoading={setLogoLoading}
                          setImageData={setLogo}
                          imageData={logo}
                          label={logo.originalImage.url ? t('Change Image') : t('Upload Logo Image')}
                        />
                      </ImageUploadButtonWrap>
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('Favicon')}</Label>
                      <ImageThumbnail>
                        <img
                          src={!favicon.originalImage.url ? projectDesign.faviconUrl : favicon.originalImage.url}
                          alt="favicon"
                          className="favicon"
                        />
                      </ImageThumbnail>
                      <ImageUploadButtonWrap>
                        <ImageUploadButton
                          isLoading={isFavLoading}
                          setLoading={setFavLoading}
                          setImageData={setFavicon}
                          imageData={favicon}
                          label={favicon.originalImage.url ? t('Change Image') : t('Upload Favicon Image')}
                        />
                      </ImageUploadButtonWrap>
                    </StyledTd>
                  </StyledTr>

                  <StyledTr>
                    <StyledTd>
                      <Label>{t('OpenGraph Image')}</Label>
                      <ImageThumbnail>
                        <img
                          src={!ogUrl.originalImage.url ? projectDesign.ogUrl : ogUrl.originalImage.url}
                          alt="ogUrl"
                          className="ogUrl"
                        />
                      </ImageThumbnail>
                      <ImageUploadButtonWrap>
                        <ImageUploadButton
                          isLoading={isOgLoading}
                          setLoading={setOgLoading}
                          setImageData={setOgUrl}
                          imageData={ogUrl}
                          label={ogUrl.originalImage.url ? t('Change Image') : t('Upload OpenGraph Image')}
                        />
                      </ImageUploadButtonWrap>
                    </StyledTd>
                  </StyledTr>
                </div>

                <StyledTr>
                  <StyledTd>
                    <h3>{t('Footer')}</h3>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            initialValues.footer.company_en || initialValues.footer.copyright_en !== '' ? true : false
                          }
                          onChange={handleChange}
                          sx={{
                            '& .MuiSvgIcon-root': { fontSize: 18, marginLeft: '10px' },
                            padding: '5px',
                          }}
                        />
                      }
                      label={t('Add English')}
                    />
                  </StyledTd>
                </StyledTr>

                <div style={{ padding: '0 10px', marginBottom: '30px' }}>
                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Company')}</Label>
                      <Field
                        name="footer.company"
                        as={TextField}
                        variant="standard"
                        placeholder={t('Enter Company name, Email, Phone number ... etc.')}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        helperText={<StyledErrorMessage name="footer.company" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>

                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Copyright')}</Label>
                      <Field
                        name="footer.copyright"
                        as={TextField}
                        placeholder={t('Enter Copyright')}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="footer.copyright" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>
                </div>
                {(initialValues.footer.company_en !== '' || initialValues.footer.copyright_en !== '') && (
                  <div style={{ padding: '0 10px', marginBottom: '30px' }}>
                    <StyledTr>
                      <StyledTd>
                        <Label>{t('Company_en')}</Label>
                        <Field
                          name="footer.company_en"
                          as={TextField}
                          variant="standard"
                          placeholder={t('Enter Company name, Email, Phone number ... etc.')}
                          InputProps={{
                            disableUnderline: true,
                          }}
                          fullWidth
                          size="small"
                          multiline
                          rows={3}
                          helperText={<StyledErrorMessage name="footer.company_en" component="div" className="error" />}
                        />
                      </StyledTd>
                    </StyledTr>

                    <StyledTr>
                      <StyledTd>
                        <Label>{t('Copyright_en')}</Label>
                        <Field
                          name="footer.copyright_en"
                          as={TextField}
                          placeholder={t('Enter Copyright')}
                          variant="standard"
                          InputProps={{
                            disableUnderline: true,
                          }}
                          fullWidth
                          size="small"
                          helperText={
                            <StyledErrorMessage name="footer.copyright_en" component="div" className="error" />
                          }
                        />
                      </StyledTd>
                    </StyledTr>
                  </div>
                )}

                <StyledTr>
                  <StyledTd>
                    <h3>{t('SNS')}</h3>
                  </StyledTd>
                </StyledTr>

                <div style={{ padding: '0 10px', marginBottom: '30px' }}>
                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Blog')}</Label>
                      <Field
                        name="footer.blog"
                        as={TextField}
                        variant="standard"
                        placeholder={t('Enter Blog URL')}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="footer.blog" component="div" className="error" />}
                      />
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('Facebook')}</Label>
                      <Field
                        name="footer.facebook"
                        as={TextField}
                        placeholder={t('Enter Facebook URL')}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="footer.facebook" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>

                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Instagram')}</Label>
                      <Field
                        name="footer.instagram"
                        as={TextField}
                        placeholder={t('Enter Instagram URL')}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="footer.instagram" component="div" className="error" />}
                      />
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('Home page')}</Label>
                      <Field
                        name="footer.homepage"
                        as={TextField}
                        variant="standard"
                        placeholder={t('Enter Home page URL')}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="footer.homepage" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>
                </div>
                <StyledButton type="submit" disabled={isSubmitting} color="primary" variant="contained">
                  {t('Submit')}
                </StyledButton>
              </StyledForm>
            )}
          </Formik>
        </ModalContent>
      </Box>
    </Modal>
  );
}

const Box = styled.div`
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 800px;
  height: 80vh;
  overflow-y: auto;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  outline: none;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  position: absolute;
  left: 0;
  top: 0;
  height: 71px;
  width: 100%;
  background-color: #fff;
  z-index: 1;
`;

const ModalContent = styled.div`
  padding: 90px 20px 20px 20px;
  height: 100%;
  overflow-y: auto;
  // scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f4;
  }
`;

const CloseButton = styled.div`
  cursor: pointer;
`;
const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;

  text-align: center;
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  flex: 1;
  margin-bottom: 6.5px;
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #071437;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  width: 120px;
  cursor: pointer;
  margin: auto;
`;

const ImageThumbnail = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 0.475rem;
  justify-content: center;
  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
`;

const ImageUploadButtonWrap = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const StyledTr = styled.div`
  display: flex;
  margin: 0;
  gap: 20px;
  margin-bottom: 1.25rem;
`;

const StyledTd = styled.div`
  flex: 3;
  width: 100%;
  display: flex;
  flex-direction: column;

  & input,
  & textarea {
    background-color: #f9f9f9;
    padding-bottom: 0;
    padding: 0.775rem 1rem;
    border-radius: 0.475rem;
  }
  & input:focus,
  & textarea:focus {
    background-color: #f1f1f4;
  }

  & img.favicon {
    width: 20px;
    height: 20px;
  }
  & div {
    font-size: 14px;
    padding: 0;
  }
  & p {
    margin-top: 0px;
  }
  & h3 {
    font-size: 18px;
    font-weight: 500;
    padding-bottom: 10px;
    border-bottom: 1px solid #f1f4f9;
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: #ff3848;
  font-size: 14px;
  margin-top: 5px;
`;

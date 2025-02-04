import { useEffect, useState } from 'react';

// data
import { getProjectUrls } from '@/api/firestore/getProject';
import { FOOTER_INFO } from '@/constants/defaultLayoutInfo';
import { KEY } from '@/constants/globalDesign';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
import ModalBox from '@/components/Modal';
import { ReservedWords } from '@/constants/projectUrl';
import CloseIcon from '@/images/icons/Close';
import { useDesignStore } from '@/store/design';
import { useUserStore } from '@/store/user';
import { Info } from '@mui/icons-material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Tooltip } from '@mui/joy';
import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  onClose: () => void;
  globalData?: any;
  setGlobalData?: any;
}

const images = {
  originalImage: { path: '', url: '' },
  thumbnailImage: { path: '', url: '' },
  compressedImage: { path: '', url: '' },
};

export default function HomeEditModal({ open, onClose, globalData, setGlobalData }: Props) {
  const projectDesign = useDesignStore((state) => state);
  const isSuperAdmin = window.location.pathname.includes('/admin');
  const { t } = useTranslation();
  const router = useRouter();
  const { projectId, projectUrl, tier } = useProjectStore((state) => state);
  const { updateProjectMap } = useUserStore((state) => state);

  const [isLogoLoading, setLogoLoading] = useState(false);
  const [isFavLoading, setFavLoading] = useState(false);
  const [isOgLoading, setOgLoading] = useState(false);

  const [logo, setLogo] = useState(images);
  const [favicon, setFavicon] = useState(images);
  const [ogUrl, setOgUrl] = useState(images);

  const [projectUrlModal, setProjectUrlModal] = useState(false);

  const [initialValues, setInitialValues] = useState({
    projectUrl: '',
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
    const ensureHttps = (url: string) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    };
    try {
      const updatedValues = {
        ...values,
        id: globalData ? KEY : projectId,
        ogUrl: ogUrl.originalImage.url,
        logoUrl: logo.originalImage.url,
        faviconUrl: favicon.originalImage.url,
        footer: {
          ...values.footer,
          blog: ensureHttps(values.footer.blog),
          facebook: ensureHttps(values.footer.facebook),
          instagram: ensureHttps(values.footer.instagram),
          homepage: ensureHttps(values.footer.homepage),
        },
      };

      const collectionRef = isSuperAdmin ? collection(db, 'GlobalDesign') : collection(db, 'ProjectDesign');
      const queryKey = isSuperAdmin ? KEY : projectId;
      const q = query(collectionRef, where('id', '==', queryKey));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, updatedValues);
        // superadmin이 아닌 경우 프로젝트 디자인 업데이트
        if (!isSuperAdmin) {
          projectDesign.updateInfo('title', updatedValues.title);
          projectDesign.updateInfo('description', updatedValues.description);
          projectDesign.updateInfo('logoUrl', updatedValues.logoUrl);
          projectDesign.updateInfo('faviconUrl', updatedValues.faviconUrl);
          projectDesign.updateInfo('ogUrl', updatedValues.ogUrl);
          projectDesign.updateInfo('footer', updatedValues.footer);
          alert(t('Successfully updated'));
        } else {
          // superadmin인 경우 글로벌 데이터 업데이트
          setGlobalData(updatedValues);
          alert(t('Successfully updated'));
        }
        onClose();
      } else {
        console.error('No document with the specified projectId or KEY found.');
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

  useEffect(() => {
    //console.log("globalData", globalData);
  }, [globalData]);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const metadata = await getMetadataByProjectId(projectId);

        setInitialValues({
          projectUrl: projectUrl,
          title: globalData ? globalData.title : metadata.title,
          description: globalData ? globalData.description : metadata.description,
          ogUrl: globalData ? globalData.ogUrl : metadata.ogUrl,
          faviconUrl: globalData ? globalData.faviconUrl : metadata.faviconUrl,
          logoUrl: globalData ? globalData.logoUrl : metadata.logoUrl,
          footer: {
            company: globalData
              ? globalData.footer.company
              : metadata.footer.company !== ''
              ? metadata.footer.company
              : FOOTER_INFO.company,
            copyright: globalData
              ? globalData.footer.copyright
              : metadata.footer.copyright !== ''
              ? metadata.footer.copyright
              : FOOTER_INFO.copyright,
            company_en: globalData
              ? globalData.footer.company_en
              : metadata.footer.company_en !== ''
              ? metadata.footer.company_en
              : FOOTER_INFO.company_en,
            copyright_en: globalData
              ? globalData.footer.copyright_en
              : metadata.footer.copyright_en !== ''
              ? metadata.footer.copyright_en
              : FOOTER_INFO.copyright_en,
            blog: globalData ? globalData.footer.blog : metadata.footer.blog,
            facebook: globalData ? globalData.footer.facebook : metadata.footer.facebook,
            homepage: globalData ? globalData.footer.homepage : metadata.footer.homepage,
            instagram: globalData ? globalData.footer.instagram : metadata.footer.instagram,
          },
        });

        setLogo({
          originalImage: { path: '', url: globalData ? globalData.logoUrl : metadata.logoUrl },
          thumbnailImage: { path: '', url: '' },
          compressedImage: { path: '', url: '' },
        });
        setFavicon({
          originalImage: {
            path: '',
            url: globalData ? globalData.faviconUrl : metadata.faviconUrl,
          },
          thumbnailImage: { path: '', url: '' },
          compressedImage: { path: '', url: '' },
        });
        setOgUrl({
          originalImage: { path: '', url: globalData ? globalData.ogUrl : metadata.ogUrl },
          thumbnailImage: { path: '', url: '' },
          compressedImage: { path: '', url: '' },
        });
      };
      fetchData();
    }
  }, [open]);

  const onSubmitChangeProjectUrl = async (url: string) => {
    console.log('url updated');

    // update project url
    const docRef = doc(db, 'Project', projectId);
    await updateDoc(docRef, {
      projectUrl: url,
    });
    updateProjectMap(projectId);
    setTimeout(() => {
      router.push(`/${url}/manage/layout-design`);
    }, 1000);
  };

  // projectUrl validate
  const isUrlExist = async (url: string) => {
    let isExist = false;
    await getProjectUrls().then((res) => {
      if (!res) return;
      res.find((ele: string) => {
        if (ele === url) {
          isExist = true;
        }
      });
    });
    return isExist;
  };
  const validateInput = (name: string, value: string) => {
    switch (name) {
      case 'projectUrl':
        // 최소 5자리, 최대 20자리, 영문 대소문자, 숫자만 허용
        // return /^[a-zA-Z][a-zA-Z0-9]{0,19}$/.test(value);
        return /^[a-zA-Z0-9]{5,20}$/.test(value);
      default:
        return true;
    }
  };
  const handleSaveProjectUrl = async (url: string) => {
    // validate
    // 변경되지 않았으면 변경 불가
    if (projectUrl === url) return;

    // 형식 확인
    if (!validateInput('projectUrl', url)) {
      alert(t('형식이 잘못되었습니다. (5~20자리, 영문 대소문자, 숫자만 허용)'));
      return;
    }
    // 사용할 수 없는 url 확인
    if (ReservedWords.includes(url)) {
      alert(t('사용할 수 없는 URL입니다.'));
      return;
    }
    // 중복된 url이 있는지 확인
    await isUrlExist(url).then((res) => {
      if (res) {
        alert(t('중복된 URL이 존재합니다.'));
      } else {
        // 중복된 url이 없으면 변경 가능
        setProjectUrlModal(true);
      }
    });
  };
  return (
    <>
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
              {({ isSubmitting, values }) => (
                <StyledForm>
                  <StyledTr>
                    <StyledTd>
                      <h3>{t('General')}</h3>
                    </StyledTd>
                  </StyledTr>

                  <div style={{ padding: '0 10px', marginBottom: '30px' }}>
                    <StyledTr>
                      <StyledTd2>
                        <Label>
                          {t('Custom Page Url')}
                          <Tooltip
                            title={t(
                              'This word is used for custom page, channel and manage link. This function is available for personal or higher plan.'
                            )}
                            placement="right"
                          >
                            <Info style={{ width: 16, color: '#5f5f5f', marginLeft: 6 }} />
                          </Tooltip>
                        </Label>
                        <ProjectUrl>
                          <span>https://onthewall.io/</span>
                          <Field
                            placeholder={t('Enter Title')}
                            name="projectUrl"
                            as={TextField}
                            variant="standard"
                            InputProps={{
                              disableUnderline: true,
                            }}
                            fullWidth
                            size="small"
                            helperText={<StyledErrorMessage name="projectUrl" component="div" className="error" />}
                            disabled={tier === 'free'}
                          />
                          <StyledButton2
                            variant="contained"
                            onClick={() => handleSaveProjectUrl(values.projectUrl)}
                            disabled={projectUrl === values.projectUrl}
                          >
                            {t('Save')}
                          </StyledButton2>
                        </ProjectUrl>
                      </StyledTd2>
                    </StyledTr>
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
                      <h3>
                        {t('Footer')} |
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                initialValues.footer.company_en || initialValues.footer.copyright_en !== ''
                                  ? true
                                  : false
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
                      </h3>
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
                            helperText={
                              <StyledErrorMessage name="footer.company_en" component="div" className="error" />
                            }
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
                  <ModalBox
                    state={projectUrlModal}
                    setState={() => setProjectUrlModal(false)}
                    size="lg"
                    modalConf={{
                      title: t('정말 URL을 변경하시겠습니까?'),
                      content: t('변경하시면 커스텀 페이지, 채널 페이지 및 관리페이지의 URL이 모두 변경됩니다.'),
                      backdropClick: true,
                      blindFilter: true,
                      handleCenterButton: {
                        title: t('Confirm'),
                        onClick: () => onSubmitChangeProjectUrl(values.projectUrl),
                      },
                    }}
                  >
                    <div>{t('변경 후 페이지가 새로고침 됩니다.')}</div>
                    <ModalChild>
                      <LinkBox>{`https://onthewall.io/${projectUrl}`}</LinkBox>
                      <ArrowDownwardIcon style={{ marginTop: -10 }} />
                      <LinkBox>{`https://onthewall.io/${values.projectUrl}`}</LinkBox>
                    </ModalChild>
                  </ModalBox>
                </StyledForm>
              )}
            </Formik>
          </ModalContent>
        </Box>
      </Modal>
    </>
  );
}

const Box = styled.div`
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
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
const StyledTd2 = styled.div`
  flex: 3;
  width: 400px;
  max-width: 100vw;
  display: flex;
  flex-direction: column;

  & input,
  & textarea {
    background-color: #f9f9f9;
    padding-bottom: 0;
    border-bottom: 1px solid black;
    padding-bottom: 1px;
    /* padding: 0.775rem 1rem; */
    /* border-radius: 0.475rem; */
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

const ProjectUrl = styled.div`
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 0.475rem;
  padding: 12px;
  & span {
    font-size: 14px;
    padding: 0 10px;
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: #ff3848;
  font-size: 14px;
  margin-top: 5px;
`;
const StyledButton2 = styled(Button)`
  min-width: 100px;
  margin-left: 10px;
`;

const LinkBox = styled.div`
  padding: 10px 20px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  border-radius: 5px;
  max-width: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 16px;
`;

const ModalChild = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
`;

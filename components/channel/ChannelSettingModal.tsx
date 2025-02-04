import React, { useState, useEffect, use } from 'react';

// data
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { DEFAULT_INFO, DEFAULT_IMAGES, DEFAULT_URL } from '@/constants/defaultChannelInfo';
import { getProjectUrls } from '@/api/firestore/getProject';
// store
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';

// lib
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { Modal, TextField } from '@mui/material';
import { Button } from '@mui/material';
import { Checkbox } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import ModalBox from '@/components/Modal';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { ReservedWords } from '@/constants/projectUrl';
import { Tooltip } from '@mui/joy';
import { Info } from '@mui/icons-material';

// comp
import ImageUploadButton from '@/components/ImageUploadButton';

// icons
import CloseIcon from '@/images/icons/Close';
import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  setData: any;
}

const images = {
  originalImage: { path: '', url: '' },
  thumbnailImage: { path: '', url: '' },
  compressedImage: { path: '', url: '' },
};

export default function ChannelSettingModal({ open, onClose, data, setData }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { projectId, tier, projectUrl } = useProjectStore();
  const { updateProjectMap } = useUserStore((state) => state);
  const [isLoading, setLoading] = useState(false);
  const [mobileViewLoading, setMobileViewLoading] = useState(false);
  const [isThumbLoading, setThumbLoading] = useState(false);
  const [mobileSelect, setMobileViewSelect] = useState(false);

  const [imageData, setImageData] = useState(images);
  const [mobileData, setMobileViewData] = useState(images);
  const [thumbData, setThumbData] = useState(images);
  const [projectUrlModal, setProjectUrlModal] = useState(false);
  const [initialValues, setInitialValues] = useState({
    projectUrl: '',
    title: '',
    description: '',
    information: '',
    bannerData: {
      desktop: { url: '' },
      mobile: { url: '' },
    },
    thumbnail: '',
    blog: '',
    x: '',
    homepage: '',
    instagram: '',
    facebook: '',
    shop: '',
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const ensureHttps = (url: string) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    };

    try {
      const projectCollectionRef = collection(db, 'ProjectDesign');
      const q = query(projectCollectionRef, where('id', '==', projectId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        const updatedValues = {
          'channelData.title': values.title,
          'channelData.description': values.description,
          'channelData.information': values.information,
          'channelData.bannerData.desktop.url': imageData.originalImage.url,
          'channelData.bannerData.mobile.url': mobileData.originalImage.url,
          'channelData.thumbnail': thumbData.originalImage.url,
          'channelData.blog': values.blog ? ensureHttps(values.blog) : '',
          'channelData.x': values.x ? ensureHttps(values.x) : '',
          'channelData.homepage': values.homepage ? ensureHttps(values.homepage) : '',
          'channelData.instagram': values.instagram ? ensureHttps(values.instagram) : '',
          'channelData.facebook': values.facebook ? ensureHttps(values.facebook) : '',
          'channelData.shop': values.shop ? ensureHttps(values.shop) : '',
        };

        await updateDoc(docRef, updatedValues);

        const exhibitionCollectionRef = collection(db, 'Project');
        const exhibitionQuery = query(exhibitionCollectionRef, where('id', '==', projectId));
        const exhibitionSnapshot = await getDocs(exhibitionQuery);

        if (!exhibitionSnapshot.empty) {
          exhibitionSnapshot.forEach(async (exhibitionDoc) => {
            await updateDoc(exhibitionDoc.ref, {
              channelName: values.title,
            });
          });
        }

        setData({
          title: values.title,
          description: values.description,
          information: values.information,
          bannerData: {
            desktop: { url: imageData.originalImage.url },
            mobile: { url: mobileData.originalImage.url },
          },
          thumbnail: thumbData.originalImage.url,
          blog: values.blog,
          x: values.x,
          homepage: values.homepage,
          instagram: values.instagram,
          shop: values.shop,
        });
        alert(t('Successfully updated'));
        onClose();
        window.location.reload();
      } else {
        console.error('No document with the specified projectId found.');
      }
    } catch (e) {
      console.error('Error updating metadata: ', e);
    } finally {
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (data || open) {
      setInitialValues({
        projectUrl: projectUrl,
        title: data ? data.title : DEFAULT_INFO.title,
        description: data ? data.description : DEFAULT_INFO.description,
        information: data ? data.information : DEFAULT_INFO.information,
        bannerData: {
          desktop: {
            url: data ? data.bannerData.desktop.url : DEFAULT_IMAGES.bannerData.desktop.url,
          },
          mobile: { url: data ? data.bannerData.mobile.url : DEFAULT_IMAGES.bannerData.mobile.url },
        },
        thumbnail: data ? data.thumbnail : DEFAULT_IMAGES.thumbnail,
        blog: data ? data.blog : DEFAULT_URL.blog,
        x: data ? data.x : DEFAULT_URL.x,
        homepage: data ? data.homepage : DEFAULT_URL.homepage,
        instagram: data ? data.instagram : DEFAULT_URL.instagram,
        facebook: data ? data.facebook : DEFAULT_URL.facebook,
        shop: data ? data.shop : DEFAULT_URL.shop,
      });
      setImageData({
        originalImage: {
          path: '',
          url: data ? data.bannerData.desktop.url : DEFAULT_IMAGES.bannerData.desktop.url,
        },
        thumbnailImage: { path: '', url: '' },
        compressedImage: { path: '', url: '' },
      });
      setMobileViewData({
        originalImage: {
          path: '',
          url: data ? data.bannerData.mobile.url : DEFAULT_IMAGES.bannerData.mobile.url,
        },
        thumbnailImage: { path: '', url: '' },
        compressedImage: { path: '', url: '' },
      });
      setThumbData({
        originalImage: { path: '', url: data ? data.thumbnail : DEFAULT_IMAGES.thumbnail },
        thumbnailImage: { path: '', url: '' },
        compressedImage: { path: '', url: '' },
      });
      setMobileViewSelect(data.bannerData.mobile.url ? true : false);
    }
  }, [open, data]);

  // projectUrl change
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
    <Modal open={open} onClose={onClose}>
      <Box>
        <ModalHeader>
          <Title>{t('Channel Settings')}</Title>
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
                      <BannerTitle>
                        <Label>
                          {t('Banner')}
                          <Tooltip title={t('PC - 1160*200 / Mobile - 460*170')} placement="right">
                            <Info style={{ width: 16, color: '#5f5f5f', marginLeft: 6 }} />
                          </Tooltip>
                        </Label>
                        <FormGroup>
                          <FormControlLabel
                            control={<Checkbox checked={mobileSelect} size="small" />}
                            label={t('Add Mobile Banner')}
                            onChange={() => {
                              setMobileViewSelect(!mobileSelect);
                            }}
                          />
                        </FormGroup>
                      </BannerTitle>
                      <BannerBox>
                        <BannerImage>
                          <ImageThumbnail>
                            <img src={imageData.originalImage.url} alt="banner" className="banner" />
                          </ImageThumbnail>
                          <ImageUploadButtonWrap>
                            <ImageUploadButton
                              isLoading={isLoading}
                              setLoading={setLoading}
                              imageData={imageData}
                              setImageData={setImageData}
                              label={imageData.originalImage.url ? t('Change Image') : t('Upload Image')}
                            />
                          </ImageUploadButtonWrap>
                        </BannerImage>
                        {mobileSelect && (
                          <BannerImage>
                            <ImageThumbnail>
                              <img src={mobileData.originalImage.url} alt="banner" className="banner" />
                            </ImageThumbnail>
                            <ImageUploadButtonWrap>
                              <ImageUploadButton
                                isLoading={mobileViewLoading}
                                setLoading={setMobileViewLoading}
                                imageData={mobileData}
                                setImageData={setMobileViewData}
                                label={mobileData.originalImage.url ? t('Change Image') : t('Upload Image')}
                              />
                            </ImageUploadButtonWrap>
                          </BannerImage>
                        )}
                      </BannerBox>
                    </StyledTd>
                  </StyledTr>
                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Thumbnail')}</Label>
                      <ImageThumbnail>
                        <img src={thumbData.originalImage.url} alt="thumbnail" className="thumbnail" />
                      </ImageThumbnail>
                      <ImageUploadButtonWrap>
                        <ImageUploadButton
                          isLoading={isThumbLoading}
                          setLoading={setThumbLoading}
                          imageData={thumbData}
                          setImageData={setThumbData}
                          label={thumbData.originalImage.url ? t('Change Image') : t('Upload Image')}
                        />
                      </ImageUploadButtonWrap>
                    </StyledTd>
                  </StyledTr>
                  <StyledTr>
                    <StyledTd>
                      <Label>{t('ChannelName')}</Label>
                      <Field
                        placeholder={t('Enter Title for your Channel')}
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
                        placeholder={t('Enter Description for your Channel')}
                        name="description"
                        as={TextField}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        inputProps={{
                          maxLength: 20,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="description" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>

                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Information')}</Label>
                      <Field
                        placeholder={t('Enter information for your Channel')}
                        name="information"
                        as={TextField}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        inputProps={{
                          maxLength: 300,
                        }}
                        fullWidth
                        multiline
                        rows={5}
                        size="small"
                        helperText={<StyledErrorMessage name="information" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>
                </div>

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
                        name="blog"
                        as={TextField}
                        variant="standard"
                        placeholder={t('Enter Blog URL')}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="blog" component="div" className="error" />}
                      />
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('X')}</Label>
                      <Field
                        name="x"
                        as={TextField}
                        placeholder={t('Enter X URL')}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="x" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>

                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Instagram')}</Label>
                      <Field
                        name="instagram"
                        as={TextField}
                        placeholder={t('Enter Instagram URL')}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="instagram" component="div" className="error" />}
                      />
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('Facebook')}</Label>
                      <Field
                        name="facebook"
                        as={TextField}
                        variant="standard"
                        placeholder={t('Enter Facebook page URL')}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="facebook" component="div" className="error" />}
                      />
                    </StyledTd>
                  </StyledTr>
                  <StyledTr>
                    <StyledTd>
                      <Label>{t('Home page')}</Label>
                      <Field
                        name="homepage"
                        as={TextField}
                        variant="standard"
                        placeholder={t('Enter Home page URL')}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="homepage" component="div" className="error" />}
                      />
                    </StyledTd>
                    <StyledTd>
                      <Label>{t('Shop')}</Label>
                      <Field
                        name="shop"
                        as={TextField}
                        placeholder={t('Enter Shop URL')}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        fullWidth
                        size="small"
                        helperText={<StyledErrorMessage name="shop" component="div" className="error" />}
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
                    <LinkBox>{`https://onthewall.io/channel/${projectUrl}`}</LinkBox>
                    <ArrowDownwardIcon style={{ marginTop: -10 }} />
                    <LinkBox>{`https://onthewall.io/channel/${values.projectUrl}`}</LinkBox>
                  </ModalChild>
                </ModalBox>
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
  min-width: 600px;
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
  margin-bottom: 6.5px;
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #071437;
  line-height: 1;
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
  height: 180px;
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 0.475rem;
  justify-content: center;
  overflow: hidden;
  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    &.thumbnail {
      border-radius: 100%;
      width: 150px;
      height: 150px;
      object-fit: cover;
    }
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

const BannerBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const BannerImage = styled.div`
  flex: 1;
`;
const BannerTitle = styled.div`
  margin-bottom: 6.5px;
  & .MuiTypography-root {
    font-size: 14px;
  }
  & label {
    margin-bottom: 0;
  }
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
const StyledButton2 = styled(Button)`
  min-width: 100px;
  margin-left: 10px;
`;

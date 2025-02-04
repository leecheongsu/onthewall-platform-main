import React, { useEffect, useState } from 'react';

// data
import { Timestamp } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';
import ShortUniqueId from 'short-unique-id';

// style
import { Box, Title, Column, Row, Label, Value, Check, CloseButton } from '@/components/manage/designMode/Modals/style';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { CardMedia } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

// icons
import CloseIcon from '@mui/icons-material/Close';

// components
import ImageUploadButton from '@/components/ImageUploadButton';
import FileUploadButton from '@/components/FileUploadButton';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  setData: (data: any) => void;
  edit?: boolean;
  order?: number;
}

const images = {
  originalImage: { path: '', url: '' },
  thumbnailImage: { path: '', url: '' },
  compressedImage: { path: '', url: '' },
};

export default function AddBannerModal({ open, onClose, data, setData, edit, order }: Props) {
  const { t } = useTranslation();
  const [selectType, setSelectType] = useState(edit && data.clickActionType ? data.clickActionType : 'Link');
  const [linkUrl, setLinkUrl] = useState(edit && data.linkUrl ? data.linkUrl : '');
  const [linkUrlError, setLinkUrlError] = useState('');

  const [isLoading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [mobileSelect, setMobileViewSelect] = useState(false);

  const [isFileLoading, setFileLoading] = useState(false);
  const [fileData, setFileData] = useState({
    path: '',
    url: '',
    fileName: '',
  });
  const [imageData, setImageData] = useState(images);
  const [mobileData, setMobileViewData] = useState(images);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectType(event.target.value as string);
  };

  const handleSave = () => {
    let isValid = true;

    if (linkUrl !== '' && !linkUrl.startsWith('https://')) {
      setLinkUrlError(t('URL must start with http:// or https://'));
      isValid = false;
    }

    if (!isValid) {
      return;
    }
    const newData = {
      desktop: {
        height: '',
        url: imageData.originalImage.url,
      },
      mobile: {
        height: '',
        url: mobileData.originalImage.url,
      },
      hasLink: selectType === 'Link' && linkUrl.trim() ? true : false,
      type: 'BANNER',
      linkUrl,
      downloadUrl: fileData.url ? fileData.url : '',
      clickActionType: selectType,
      order: order ?? data.order,
      isDeleted: false,
      updatedAt: Timestamp.now(),
      id: edit ? data.id : new ShortUniqueId().randomUUID(6),
    };
    if (edit) {
      // edit 모드에서는 단일 객체를 수정합니다.

      setData((prevData: any) => prevData.map((item: any) => (item.id === data.id ? { ...item, ...newData } : item)));
    } else {
      // 배열인지 확인하고 배열로 변환
      const existingData = Array.isArray(data) ? data : [data];
      setData([...existingData, newData]);
    }

    onClose();
  };

  useEffect(() => {
    if (open) {
      setSelectType(edit && data.clickActionType ? data.clickActionType : 'Link');
      setLinkUrl(edit && data.linkUrl ? data.linkUrl : '');
      setImageData({
        originalImage: edit && data.desktop ? data.desktop : { path: '', url: '' },
        thumbnailImage: edit && data.desktop ? data.desktop : { path: '', url: '' },
        compressedImage: edit && data.desktop ? data.desktop : { path: '', url: '' },
      });
      setMobileViewData({
        originalImage: edit && data.mobile ? data.mobile : { path: '', url: '' },
        thumbnailImage: edit && data.mobile ? data.mobile : { path: '', url: '' },
        compressedImage: edit && data.mobile ? data.mobile : { path: '', url: '' },
      });
      setMobileViewSelect(edit && data.mobile ? true : false);
    } else {
      setFileData({
        path: '',
        url: '',
        fileName: '',
      });
      setImageData({
        originalImage: { path: '', url: '' },
        thumbnailImage: { path: '', url: '' },
        compressedImage: { path: '', url: '' },
      });
      setMobileViewData({
        originalImage: { path: '', url: '' },
        thumbnailImage: { path: '', url: '' },
        compressedImage: { path: '', url: '' },
      });
      setMobileViewSelect(false);
    }
  }, [open, edit, data]);

  useEffect(() => {
    if (mobileSelect === false) {
      setMobileViewData({
        originalImage: {
          path: '',
          url: '',
        },
        thumbnailImage: { path: '', url: '' },
        compressedImage: { path: '', url: '' },
      });
    } else {
      setMobileViewData({
        originalImage: edit && data.mobile ? data.mobile : { path: '', url: '' },
        thumbnailImage: edit && data.mobile ? data.mobile : { path: '', url: '' },
        compressedImage: edit && data.mobile ? data.mobile : { path: '', url: '' },
      });
    }
  }, [mobileSelect]);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>

          <Title>{t('Image (Admin)')}</Title>
          <Row>
            <Label>{t('Image')}</Label>
            <Value>
              <Column>
                {imageData.originalImage.url && (
                  <CardMedia component="img" src={imageData.originalImage.url} sx={{ marginBottom: '10px' }} />
                )}
                <ImageUploadButton
                  imageData={imageData}
                  setImageData={setImageData}
                  isLoading={isLoading}
                  setLoading={setLoading}
                />
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={mobileSelect} />}
                    label="Mobile Image"
                    onChange={() => {
                      setMobileViewSelect(!mobileSelect);
                    }}
                  />
                </FormGroup>
                {mobileSelect && (
                  <>
                    {mobileData.originalImage.url && (
                      <CardMedia component="img" src={mobileData.originalImage.url} sx={{ marginBottom: '10px' }} />
                    )}
                    <ImageUploadButton
                      imageData={mobileData}
                      setImageData={setMobileViewData}
                      isLoading={mobileView}
                      setLoading={setMobileView}
                    />
                  </>
                )}
              </Column>
            </Value>
          </Row>
          <Row>
            <Label>{t('Click Action')}</Label>
            <Value>
              <Column>
                <FormControl fullWidth variant="standard">
                  <Select value={selectType} label="Link" onChange={handleChange}>
                    <MenuItem value="Link">{t('Link')}</MenuItem>
                    <MenuItem value="File">{t('File')}</MenuItem>
                  </Select>
                </FormControl>
              </Column>
              <Column className="column">
                {selectType === 'Link' && (
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    placeholder={t('Enter URL')}
                    sx={{ height: '32px' }}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setLinkUrlError('');
                      }
                    }}
                    error={!!linkUrlError}
                    helperText={linkUrlError}
                  />
                )}
                {selectType === 'File' && (
                  <>
                    <p>{fileData.fileName}</p>
                    <FileUploadButton
                      fileData={fileData}
                      setFileData={setFileData}
                      isLoading={isFileLoading}
                      setLoading={setFileLoading}
                    />
                  </>
                )}
              </Column>
            </Value>
          </Row>
          <Row className="Buttons">
            <Button
              variant="outlined"
              color="primary"
              onClick={onClose}
              sx={{ width: '200px', textTransform: 'capitalize', fontSize: '1rem' }}
            >
              {t('Close')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: '200px', textTransform: 'capitalize', fontSize: '1rem' }}
              onClick={() => {
                onClose();
                handleSave();
              }}
            >
              {t('Save')}
            </Button>
          </Row>
        </Box>
      </Modal>
    </>
  );
}

import React, { use, useEffect, useState } from 'react';
import Image from 'next/image';

// data
import { getExhibitionDoc } from '@/api/firestore/getExhibitions';
import { Timestamp } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';
import ShortUniqueId from 'short-unique-id';

// style
import { Box, Title, Row, Column, Label, Value, CloseButton } from '@/components/manage/designMode/Modals/style';
import styled from '@emotion/styled';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

// images
import GalleryA from '@/images/svg/galleryA.svg';
import GalleryB from '@/images/svg/galleryB.svg';
import GalleryC from '@/images/svg/galleryC.svg';

// icons
import CloseIcon from '@mui/icons-material/Close';

// components
import AddExhibitionModal from '@/components/admin/designMode/Modals/Section/ExhibitionModal';
import AddExternalModal from '@/components/admin/designMode/Modals/Section/ExternalModal';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  setData: (data: any) => void;
  edit?: boolean;
  order?: number;
}

export default function AddGroupModal({ open, onClose, data, setData, edit, order }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(edit && data.title ? data.title : '');
  const [description, setDescription] = useState(edit && data.description ? data.description : '');
  const [value, setValue] = useState(edit && data.layout ? data.layout : 'GalleryA');
  const [selectedItems, setSelectedItems] = useState<any[]>(edit && data.exhibitions ? data.exhibitions : []);

  const [exhibitionModal, setExhibitionModal] = useState(false);
  const [externalModal, setExternalModal] = useState(false);
  const [dataArray, setDataArray] = useState<any[]>([]);

  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  // 수정일땐 밸류값으로 데이터 가져오기
  const fetchExhibitionDetails = async (id: string): Promise<any> => {
    const doc = await getExhibitionDoc(id);
    if (doc) {
      return doc;
    } else {
      console.error(`Document with id ${id} not found`);
      return null;
    }
  };

  // exhibition이랑 link 다르게 저장하기
  const processExhibitions = (selectedItems: any[]) => {
    return selectedItems.map((item: any) => {
      if (item.type === 'onthewall') {
        return {
          ...item,
          type: 'onthewall',
          value: item.id,
        };
      } else {
        return {
          imageUrl: item.imageUrl ?? item.originalPosterImage.url,
          title: item.title,
          type: 'link',
          url: item.url,
        };
      }
    });
  };

  const handleSave = () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError(t('Title is required'));
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError(t('Description is required'));
      isValid = false;
    }

    if (value === 'GalleryB' && selectedItems.length < 5) {
      alert(t('GalleryB requires at least 5 items'));
      return;
    }

    if (!isValid) {
      return;
    }

    const newData = {
      title,
      description,
      layout: value,
      type: 'GROUP_EXHIBITION',
      exhibitions: processExhibitions(selectedItems),
      order: edit ? data.order : order,
      isDeleted: false,
      updatedAt: Timestamp.now(),
      id: edit ? data.id : new ShortUniqueId().randomUUID(6),
    };

    if (edit) {
      setData((prevData: any) => prevData.map((item: any) => (item.id === data.id ? { ...item, ...newData } : item)));
    } else {
      setData((prevData: any) => [...prevData, newData]);
    }

    onClose();
  };

  const AddExhibition = () => {
    setExhibitionModal(true);
  };
  const AddExternal = () => {
    setExternalModal(true);
  };

  useEffect(() => {
    // 초기 데이터 배열 설정
    setDataArray(Array.isArray(data) ? data : [data]);
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setTitle(edit && data.title ? data.title : '');
        setDescription(edit && data.description ? data.description : '');
        setValue(edit && data.layout ? data.layout : 'GalleryA');

        if (edit && data.exhibitions) {
          const detailedItems = await Promise.all(
            data.exhibitions.map(async (item: any) => {
              if (item.type === 'onthewall') {
                const details = await fetchExhibitionDetails(item.value);
                return details ? { ...item, ...details } : item;
              } else {
                return item;
              }
            })
          );
          setSelectedItems(detailedItems);
        } else {
          setSelectedItems([]);
        }
      } else {
        setTitle('');
        setDescription('');
        setValue('GalleryA');
        setSelectedItems([]);
      }
    };

    fetchData();
  }, [open, edit, data]);

  useEffect(() => {
    console.log('selectedItems', selectedItems);
  }, [selectedItems]);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>

          <Title>{t('Section (Admin)')}</Title>
          <Row>
            <Label>
              {t('Title')}
              <span>*</span>
            </Label>
            <Value>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('Enter Title')}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setTitleError('');
                  }
                }}
                error={!!titleError}
                helperText={titleError}
              />
            </Value>
          </Row>
          <Row>
            <Label>{t('Description')}</Label>
            <Value>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('Enter Description')}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.trim()) {
                    setDescriptionError('');
                  }
                }}
                error={!!descriptionError}
                helperText={descriptionError}
              />
            </Value>
          </Row>
          <Row>
            <Label>{t('Layout')}</Label>
            <Column>
              <Value>
                <RadioGroup value={value} onChange={handleChange} row sx={{ marginBottom: '5px' }}>
                  <FormControlLabel value="GalleryA" control={<Radio size="small" />} label="GalleryA" />
                  <FormControlLabel value="GalleryB" control={<Radio size="small" />} label="GalleryB" />
                  <FormControlLabel value="GalleryC" control={<Radio size="small" />} label="GalleryC" />
                </RadioGroup>
              </Value>
              {value === 'GalleryA' && <Image src={GalleryA} alt="GalleryA" />}
              {value === 'GalleryB' && <Image src={GalleryB} alt="GalleryB" />}
              {value === 'GalleryC' && <Image src={GalleryC} alt="GalleryC" />}
            </Column>
          </Row>
          <Row>
            <Label>{t('Add Items')}</Label>
            <Value>
              <Button color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} onClick={AddExhibition}>
                {t('Exhibition')}
              </Button>
              <Button color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} onClick={AddExternal}>
                {t('External Link')}
              </Button>
            </Value>
          </Row>
          <Row className="list">
            <Label>{t('List')}</Label>
            <Value className="list">
              {selectedItems.map((item, index) => (
                <Item key={index}>
                  <ItemThumb>
                    <img
                      src={
                        item.type === 'onthewall'
                          ? item.originalPosterImage?.url ||
                            'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                          : item.imageUrl || item.originalPosterImage?.url
                      }
                      alt="image"
                    />
                  </ItemThumb>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDelete
                    color="error"
                    variant="outlined"
                    onClick={() => {
                      setSelectedItems(selectedItems.filter((_, i) => i !== index));
                    }}
                  >
                    <CloseIcon /> {t('Delete')}
                  </ItemDelete>
                </Item>
              ))}
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
      {exhibitionModal && (
        <AddExhibitionModal
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          open={exhibitionModal}
          onClose={() => {
            setExhibitionModal((prev) => !prev);
          }}
        />
      )}
      {externalModal && (
        <AddExternalModal
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          open={externalModal}
          onClose={() => {
            setExternalModal((prev) => !prev);
          }}
        />
      )}
    </>
  );
}

const Item = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
`;

const ItemThumb = styled.div`
  width: 80px;
  height: 80px;
  margin-right: 10px;
  img {
    border-radius: 3px;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemTitle = styled.div`
  flex: 1;
`;

const ItemDelete = styled(Button)`
  cursor: pointer;
  color: red;
  display: flex;
  align-items: center;
  margin-left: auto;
  text-transform: capitalize;
  svg {
    margin-right: 5px;
    width: 17px;
  }
`;

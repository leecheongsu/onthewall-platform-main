import React, { useState, useEffect } from 'react';

// data
import { Timestamp } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';
import ShortUniqueId from 'short-unique-id';

import { Box, Title, Row, Label, CloseButton } from '@/components/manage/designMode/Modals/style';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Input from '@mui/material/Input';

type Props = {
  open: boolean;
  onClose: () => void;
  data: any;
  setData: (data: any) => void;
  edit?: boolean;
  order?: number;
};

function AdminBlankModal({ open, onClose, data, setData, edit, order }: Props) {
  const { t } = useTranslation();
  const [height, setHeight] = useState(60);

  const handleSave = () => {
    if (height < 15) {
      alert(t('Height는 최소 15px 이상이어야 합니다.'));
      return;
    }

    const newData = {
      type: 'BLANK',
      order: order ?? data.order,
      height: height,
      isDeleted: false,
      updatedAt: Timestamp.now(),
      id: edit ? data.id : new ShortUniqueId().randomUUID(6),
    };

    if (edit) {
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
      setHeight(edit && data.height ? data.height : 60);
    } else {
      setHeight(60);
    }
  }, [open, edit, data]);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeight(Number(value));
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box>
          <Title>{t('Blank Settings (Admin)')}</Title>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
          <Row>
            <Label>{t('Height')}</Label>
            <Input type="number" value={height} onChange={handleHeightChange} />
            px
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

export default AdminBlankModal;

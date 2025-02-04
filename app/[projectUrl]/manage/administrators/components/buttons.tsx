import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import IconButton from '@mui/joy/IconButton';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import React, { useEffect, useState } from 'react';
import ModalBox from '@/components/Modal';
import { useProjectStore } from '@/store/project';
import { platformManageApis } from '@/api/platform';
import { useTranslation } from 'react-i18next';
import { Invite, RemoveCancel, RemoveCancelProps } from '@/app/[projectUrl]/manage/administrators/components/modals';
import FormControl from '@mui/joy/FormControl';
import styled from '@emotion/styled';
import Button from '@mui/joy/Button';

interface Props {
  data?: any;
  onChange: () => void;
}

export const Actions = ({ data, onChange }: Props) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [removeCancelProps, setRemoveCancelProps] = useState<RemoveCancelProps>();
  const [modalConf, setModalConf] = useState({});
  const { projectId, isExpired, fetchProjectUserData } = useProjectStore();

  const handleDeleteItme = () => {
    const handleDelete = () => {
      const form = {
        uid: data.uid,
        projectId: projectId,
        status: 'admin',
      };

      platformManageApis
        .remove(form)
        .then((res) => {
          const apiRes = res.data as ApiResponse;
          if (apiRes.meta.ok) {
            setIsOpen(false);
            fetchProjectUserData(projectId, 'admin');
            onChange();
          }
        })
        .catch((e) => {
          console.error('remove Error : ', e);
          alert(e.message);
        });
    };

    setRemoveCancelProps({ action: 'Remove' });
    setModalConf({
      blindFilter: true,
      handleLeftButton: {
        title: t('Close'),
        className: 'btn_outline',
        onClick: () => setIsOpen(false),
      },
      handleRightButton: {
        title: t('Delete'),
        className: 'btn_outline',
        onClick: handleDelete,
      },
    });
    setIsOpen(true);
  };

  return (
    <>
      <Dropdown>
        <MenuButton slots={{ root: IconButton }} slotProps={{ root: { color: 'neutral', size: 'sm' } }}>
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          <MenuItem color="danger" onClick={handleDeleteItme}>
            Delete
          </MenuItem>
        </Menu>
      </Dropdown>
      <ModalBox state={isOpen} setState={() => setIsOpen(false)} modalConf={modalConf}>
        {removeCancelProps && <RemoveCancel {...removeCancelProps} />}
      </ModalBox>
    </>
  );
};

export const InviteAdministrators = ({ data: maxCount, onChange }: Props) => {
  const { i18n, t } = useTranslation();
  const { projectId, projectUrl, fetchProjectUserData } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const [modalConf, setModalConf] = useState({});
  const [receivers, setReceiver] = useState<string[]>([]);

  const onSubmit = () => {
    const formData = {
      receivers: receivers,
      projectId: projectId,
      projectUrl: projectUrl,
    };

    platformManageApis
      .inviteAdmin(formData)
      .then((res) => {
        const apiRes = res.data as ApiResponse;
        if (apiRes.meta.ok) {
          const { failedEmails } = apiRes.data;
          setIsOpen(false);
          setReceiver([]);

          if (failedEmails.length !== 0) {
            const exists = failedEmails as string[];
            alert(
              `${t('Invitation sent successfully, except for the following email(s):')} \n ${exists.join(', ')}. \n ${t(
                'Please check these email addresses and try again.'
              )}`
            );
          } else {
            alert(t('All invitations were sent successfully.'));
          }

          fetchProjectUserData(projectId, 'admin');
          onChange();
        }
      })
      .catch((e) => {
        console.error('Invite User : ', e);
        alert(e.message);
      });
  };

  const handleInviteButton = () => {
    setModalConf({
      title: t('Invite Administrator'),
      blindFilter: true,
      handleCenterButton: {
        type: 'submit',
        title: 'Submit',
        className: 'btn_submit',
        onClick: onSubmit,
      },
    });
    setIsOpen(true);
  };

  useEffect(() => {
    setModalConf({
      title: t('Invite Administrator'),
      blindFilter: true,
      handleCenterButton: {
        type: 'submit',
        title: t('Submit'),
        className: 'btn_submit',
        onClick: onSubmit,
      },
    });
  }, [receivers]);

  return (
    <>
      <FormControl size="sm" sx={{ flex: 1 }}>
        <StyledButton type="button" theme="primary" onClick={handleInviteButton}>
          {t('Invite Admin')}
        </StyledButton>
      </FormControl>
      <ModalBox state={isOpen} setState={() => setIsOpen(false)} modalConf={modalConf} size="lg">
        <Invite value={receivers} setValue={setReceiver} maxCount={maxCount} />
      </ModalBox>
    </>
  );
};

const StyledButton = styled(Button)<{ theme: any }>`
  width: 100%;
  height: 41px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 5px;
  color: white;
  min-width: 80px;
  text-transform: none;
`;

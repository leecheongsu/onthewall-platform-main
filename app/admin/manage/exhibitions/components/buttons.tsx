import React, { ChangeEvent, useEffect, useState } from 'react';
import ModalBox from '@/components/Modal';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import CheckIcon from '@/images/icons/Check';
import WarningIcon from '@/images/icons/Wanring';
import { moduleActionApis, moduleApis } from '@/api/module';
import { useProjectStore } from '@/store/project';
import { useExhibitionStore } from '@/store/exhibition';
import { useDesignStore } from '@/store/design';
import { subtractExhibitionCount } from '@/api/firestore/getProject';
import { getUserInfo } from '@/api/firestore/getUsers';
import { useTranslation } from 'react-i18next';
import MenuButton from '@mui/joy/MenuButton';
import IconButton from '@mui/joy/IconButton';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Divider from '@mui/joy/Divider';
import Dropdown from '@mui/joy/Dropdown';
import getBuilderLink from '@/utils/getBuilderLink';
import { useUserStore } from '@/store/user';

interface Props {
  data: Exhibition;
}

export const Actions = ({ data }: Props) => {
  const { i18n, t } = useTranslation();
  const { projectId } = useProjectStore();
  const { projectsMap } = useUserStore();
  const { fetchExhibitions } = useExhibitionStore();

  const onEdit = () => {
    getBuilderLink(projectId, data.id, projectsMap[projectId].status).then((url) => {
      window.open(url, '_blank');
    });
  };

  const onHide = () => {
    moduleActionApis.hideExhibition(data.id).then((res) => {
      if (res === 'success') {
        fetchExhibitions(projectId);
        alert(t('Exhibition Hidden'));
      } else {
        alert(t('Failed to hide exhibition'));
      }
    });
  };

  const onShare = () => {
    const link = `https://art.onthewall.io/${data.id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        alert(t('Successfully link copied'));
      })
      .catch((e) => {
        console.error('Failed to Copied Link', e);
      });
  };

  const onDelete = () => {
    window.confirm(t('Are you sure you want to delete this exhibition?'));
    const p1 = moduleActionApis.deleteExhibition(data.id);
    const p2 = getUserInfo(data.uid).then(async (res) => {
      await subtractExhibitionCount(projectId, (res as any).status);
    });
    Promise.all([p1, p2]).then(() => {
      fetchExhibitions(projectId);
      alert(t('Exhibition Deleted'));
    });
  };

  return (
    <>
      <Dropdown>
        <MenuButton slots={{ root: IconButton }} slotProps={{ root: { color: 'neutral', size: 'sm' } }}>
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          <MenuItem onClick={onEdit}>Edit</MenuItem>
          <MenuItem onClick={onHide}>Hide</MenuItem>
          {data.publishedAt !== null && <MenuItem onClick={onShare}>Share</MenuItem>}
          <Divider />
          <MenuItem color="danger" onClick={onDelete}>
            Delete
          </MenuItem>
        </Menu>
      </Dropdown>
    </>
  );
};

export const PermissionButtons = ({ data }: Props) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [modalConf, setModalConf] = useState({});
  const [rejectText, setRejectText] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>();
  const { projectId, isExpired } = useProjectStore();
  const { fetchPendingExhibitions } = useExhibitionStore();

  const patchAction = (action: 'approve' | 'reject') => {
    const form = {
      reason: rejectText || '',
    };

    const instance = action === 'approve' ? moduleActionApis.approvePublish : moduleActionApis.denyPublish;

    instance(data.id, form)
      .then((res) => {
        if (String(res) === 'success') {
          if (action === 'reject') {
            rejectOnClose();
          }
        } else {
          console.error(`Failed to ${action} exhibition. Status: ${res.status}`);
        }
      })
      .catch((error) => {
        console.error(`Failed to ${action} exhibition: `, error);
      });
  };

  const onClose = () => {
    setIsOpen(false);
    fetchPendingExhibitions(projectId);
  };

  const rejectOnClose = () => {
    setIsOpen(false);
    alert(t('Reject Completed'));
    fetchPendingExhibitions(projectId);
  };

  const onSubmit = () => {
    if (rejectText.trim() === '') {
      alert(t('Please enter the rejection reason.'));
      return;
    }
    patchAction('reject');
  };

  const handleActionModal = (action: 'approve' | 'reject') => {
    setAction(action);
    if (action === 'approve') {
      patchAction('approve');
      setModalConf({
        blindFilter: true,
        handleCenterButton: {
          type: 'button',
          title: t('Close'),
          className: 'btn_outline w-1/2',
          onClick: onClose,
        },
      });
    } else {
      setModalConf({
        title: t('Publish Rejection'),
        blindFilter: true,
        handleCenterButton: {
          type: 'submit',
          title: t('Submit'),
          className: 'btn_submit',
          onClick: onSubmit,
        },
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (action === 'reject') {
      setModalConf((prevConf) => ({
        ...prevConf,
        handleCenterButton: {
          type: 'submit',
          title: t('Submit'),
          className: 'btn_submit',
          onClick: onSubmit,
        },
      }));
    }
  }, [rejectText, action]);

  return (
    <>
      <ButtonBox>
        <StyledButton
          disabled={isExpired}
          theme="primary"
          variant="outlined"
          onClick={() => handleActionModal('approve')}
        >
          {t('Approve')}
        </StyledButton>
        <StyledButton
          disabled={isExpired}
          theme="primary"
          variant="outlined"
          onClick={() => handleActionModal('reject')}
        >
          {t('Reject')}
        </StyledButton>
      </ButtonBox>
      <ModalBox state={isOpen} setState={onClose} modalConf={modalConf}>
        {action && action === 'approve' && <Approve />}
        {action && action === 'reject' && <Reject title={data.title} state={rejectText} setState={setRejectText} />}
      </ModalBox>
    </>
  );
};

const Approve = () => {
  const { i18n, t } = useTranslation();
  const color = useDesignStore((state) => state.theme);
  return (
    <Box>
      <IconCheck color={color.primary} />
      <Text>{t('Exhibition publication has been authorized.')}</Text>
    </Box>
  );
};

interface RejectProps {
  title?: string;
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
}

const Reject = ({ title, state, setState }: RejectProps) => {
  const { i18n, t } = useTranslation();
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setState(e.target.value);
  };

  return (
    <>
      <NoticeBox>
        <IconWarning />
        <ExhibitionTitle>
          {t('Exhibition Title')} : {title}
        </ExhibitionTitle>
      </NoticeBox>
      <LongText
        value={state}
        placeholder={t('Specify the reason for the rejection.')}
        onChange={handleChange}
        rows={3}
      />
    </>
  );
};

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const StyledButton = styled(Button)`
  border-radius: 5px;
  padding: 5px 15px;
  width: 70px;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

const IconCheck = styled(CheckIcon)<{ color?: any }>`
  width: 30%;
  height: 30%;
  color: ${(props) => props.color};
`;

const Text = styled.span`
  font-size: 12px;
  margin-top: 0.75rem;
  margin-bottom: 2rem;
`;

const IconWarning = styled(WarningIcon)`
  width: 0.75rem;
  height: 0.75rem;
  margin-top: 0.25rem;
`;

const NoticeBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 5px 0 10px 0;
  width: calc(100% * 2 / 3);
  gap: 5px;
`;
const ExhibitionTitle = styled.span`
  color: #727a84;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const LongText = styled.textarea`
  display: flex;
  height: 135px;
  min-height: 135px;
  max-height: 135px;
  width: calc(100% * 2 / 3);
  max-width: calc(100% * 2 / 3);
  padding: 5px 15px;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 5px;
  background: #f1f4f9;
`;

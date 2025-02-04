import React, { useState } from 'react';
import { moduleActionApis } from '@/api/module';
import { useProjectStore } from '@/store/project';
import { useExhibitionStore } from '@/store/exhibition';
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
import { platformManageApis } from '@/api/platform';
import Typography from '@mui/joy/Typography';
import Switch from '@mui/joy/Switch';
import { useUserStore } from '@/store/user';
import getBuilderLink from '@/utils/getBuilderLink';

interface Props {
  data: Exhibition;
  fetchData: () => void;
}

export const Actions = ({ data, fetchData }: Props) => {
  const { i18n, t } = useTranslation();
  const { projectId, isExpired } = useProjectStore();
  const { projectsMap } = useUserStore();
  const [status, setStatus] = useState(data.status);

  const onEdit = () => {
    getBuilderLink(projectId, data.id, projectsMap[projectId].status).then((url) => {
      window.open(url, '_blank');
    });
  };

  const onClose = () => {
    if (data.status === 'closed') {
      moduleActionApis.openExhibition(data.id).then((res) => {
        if (res === 'success') {
          fetchData();
          setStatus('published');
          alert(t('Exhibition is Reopened'));
        } else {
          alert(t('Failed to hide exhibition'));
        }
      });
    } else {
      moduleActionApis.closeExhibition(data.id).then((res) => {
        if (res === 'success') {
          setStatus('closed');
          fetchData();
          alert(t('Exhibition is Closed'));
        } else {
          alert(t('Failed to hide exhibition'));
        }
      });
    }
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
    const isConfirm = window.confirm(t('Are you sure you want to delete this exhibition?'));
    // 전시 데이터 삭제
    if (isConfirm) {
      const p1 = moduleActionApis.deleteExhibition(data.id);

      // 사용중인 전시 카운트 감소
      const p2 = getUserInfo(data.uid).then(async (res) => {
        console.log(res);

        const status = ((res as any).projects =
          (res as any).projects.filter((project: any) => project.id !== projectId) ?? 'user');
        await subtractExhibitionCount(projectId, status);
      });
      Promise.all([p1, p2]).then(() => {
        alert(t('Exhibition Deleted'));
        fetchData();
      });
    }
  };

  return (
    <>
      <Dropdown>
        <MenuButton slots={{ root: IconButton }} slotProps={{ root: { color: 'neutral', size: 'sm' } }}>
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          <MenuItem onClick={onEdit}>{t('Edit')}</MenuItem>
          <MenuItem onClick={onClose} disabled={data.status === 'created'}>
            {data.status === 'published' ? t('Close Exhibition') : t('Reopen Exhibition')}
          </MenuItem>
          {data.publishedAt !== null && <MenuItem onClick={onShare}>{t('Share')}</MenuItem>}
          <Divider />
          <MenuItem color="danger" onClick={onDelete}>
            {t('Delete')}
          </MenuItem>
        </Menu>
      </Dropdown>
    </>
  );
};

export const ShowSwitch = ({ data, fetchData }: Props) => {
  const { i18n, t } = useTranslation();
  const [isShow, setIsShow] = useState(!data.isHidden);

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsShow = !e.target.checked;

    try {
      platformManageApis.modifyExhibition(data.id, newIsShow).then((res) => {
        setIsShow(!newIsShow);
      });
    } catch (e) {
      console.error(`Modify Exhibition [${newIsShow}] : `, e);
    }
  };

  return (
    <>
      <Switch
        checked={isShow}
        onChange={handleSwitchChange}
        slotProps={{
          track: {
            children: (
              <React.Fragment>
                <Typography component="span" level="inherit" sx={{ ml: '10px' }}>
                  On
                </Typography>
                <Typography component="span" level="inherit" sx={{ mr: '8px' }}>
                  Off
                </Typography>
              </React.Fragment>
            )
          }
        }}
        sx={{
          '--Switch-thumbSize': '27px',
          '--Switch-trackWidth': '64px',
          '--Switch-trackHeight': '31px'
        }}
      />
    </>
  );
};

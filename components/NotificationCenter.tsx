import React, { useEffect, useRef, useState, forwardRef, useCallback } from 'react';
import styled from '@emotion/styled';
import EllipseIcon from '@/images/icons/Ellipse';
import AlertIcon from '@/images/icons/Alert';
import AllIcon from '@/images/icons/All';
import InfoIcon from '@/images/icons/Info';
import CreditIcon from '@/images/icons/Credit';
import SubscribeIcon from '@/images/icons/Subscribe';
import moment from 'moment';
import CloseIcon from '@/images/icons/Close';
import { useUserStore } from '@/store/user';
import Link from 'next/link';
import { NOTIFICATION_CODE } from '@/constants/notificationCode';
import { useProjectStore } from '@/store/project';
import { useNotificationStore } from '@/store/notification';
import { useTranslation } from 'react-i18next';

import { NotificationType } from '@/type/Notification';

function NotificationCenter() {
  const { i18n, t } = useTranslation();
  const [isAlert, setIsAlert] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { uid, status } = useUserStore();
  const { projectId, projectUrl } = useProjectStore();
  const { notifications, fetchNotificationData, markAsRead } = useNotificationStore();

  const notificationRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchNotificationData(uid);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setIsAlert(true);
    } else {
      setIsAlert(false);
    }
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        iconButtonRef.current &&
        !iconButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationRef]);

  const handleFilterClick = (type: string) => {
    setSelectedFilter(type);
  };

  const filteredNotifications =
    selectedFilter === 'all'
      ? notifications
      : notifications.filter((notification) => notification.type === selectedFilter);

  const chipIcons = (type: NotificationType) => {
    switch (type) {
      case 'all' as NotificationType:
        return <AllIcon />;
      case 'info' as NotificationType:
        return <InfoIcon />;
      case 'credit' as NotificationType:
        return <CreditIcon />;
      case 'marketing' as NotificationType:
        return <SubscribeIcon />;
      default:
        return null;
    }
  };

  const chipData = [
    { type: 'all', icon: <AllIcon />, onClick: () => handleFilterClick('all') },
    { type: 'info', icon: <InfoIcon />, onClick: () => handleFilterClick('info') },
    { type: 'credit', icon: <CreditIcon />, onClick: () => handleFilterClick('credit') },
    { type: 'subscribe', icon: <SubscribeIcon />, onClick: () => handleFilterClick('subscribe') },
  ];

  const handleRemoveNoti = (id: string) => {
    markAsRead(id);
  };

  const IconButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
    <StyledButton ref={ref} {...props}>
      {props.children}
    </StyledButton>
  ));

  // 템플릿 문자열에서 {{key}} 형태의 변수를 치환하는 함수
  const replaceTemplateStrings = (template: string, variables: any) => {
    return template.replace(/{{\s*([^{}\s]+)\s*}}/g, (match: string, key: string) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  };

  const getLink = useCallback(
    (code: string) => {
      console.log('projectUrl', projectUrl);
      console.log('NOTIFICATION_CODE[code].link', NOTIFICATION_CODE[code].link);
      if (['N1002', 'N1006'].includes(code)) {
        return `/${projectUrl}${NOTIFICATION_CODE[code].link}`;
      } else {
        return NOTIFICATION_CODE[code].link;
      }
    },
    [projectUrl]
  );

  return (
    <>
      <IconButton
        ref={iconButtonRef}
        onClick={(e) => {
          setIsOpen((prev) => !prev);
        }}
      >
        {isAlert && (
          <OverlayIcon>
            <EllipseIcon className="red" />
          </OverlayIcon>
        )}
        <AlertIcon className="icon_sm" />
      </IconButton>
      {isOpen && (
        <Box ref={notificationRef}>
          <FilterTab>
            {chipData.map((chip) => (
              <Chip key={chip.type} onClick={chip.onClick}>
                {chip.icon}
              </Chip>
            ))}
          </FilterTab>
          <NotificationList>
            {filteredNotifications.length === 0 ? (
              <EmptyNotification>{t('Notifications do not exist.')} </EmptyNotification>
            ) : (
              filteredNotifications.map((noti) => (
                <NotificationItem key={(noti as any).id}>
                  <CloseButton type="button" onClick={() => handleRemoveNoti((noti as any).id)}>
                    <CloseIcon />
                  </CloseButton>
                  <Link key={(noti as any).id} href={getLink(noti.code) || ''}>
                    <NotificationBox>
                      <Chip>{chipIcons((noti.type ?? NOTIFICATION_CODE[noti.code].type) as NotificationType)}</Chip>
                      <Label>
                        {replaceTemplateStrings(
                          NOTIFICATION_CODE[noti.code].content[i18n.language.split('-')[0] as 'en' | 'ko'],
                          { value: noti.data?.value }
                        )}
                        <Moment>{moment(noti.createdAt.toDate()).fromNow()}</Moment>
                      </Label>
                    </NotificationBox>
                  </Link>
                </NotificationItem>
              ))
            )}
          </NotificationList>
        </Box>
      )}
    </>
  );
}

export default NotificationCenter;

const StyledButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  position: relative;

  .icon_sm {
    width: 30px;
    height: 30px;
  }

  .icon_default {
    width: 35px;
    height: 35px;
  }
`;

const OverlayIcon = styled.div`
  position: absolute;
  top: 7%;
  left: 60%;
`;

const Box = styled.div`
  position: absolute;
  top: 4vh;
  right: 5vh;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const FilterTab = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  border-bottom: 1px solid #eee;
`;

const NotificationList = styled.ul`
  list-style: none;
`;

const EmptyNotification = styled.div`
  height: 100px;
  color: #64748b;
  align-content: center;
  text-align: center;
`;

const NotificationItem = styled.li`
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  margin: 10px;
  padding-bottom: 3px;

  &:last-of-type {
    border-bottom: none;
  }
`;

const NotificationBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
`;

const Label = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 14px;
  color: #3c3d49;
`;

const Moment = styled.span`
  font-size: 12px;
  color: #9ca3af;
  align-self: flex-end;
`;

const Chip = styled.div`
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  color: #799ccb;

  :hover {
    color: #115de6;
  }
`;

const CloseButton = styled.button`
  width: 16px;
  height: 16px;
  right: 0;
  color: #3c3d49;
  background: none;
  border: none;
  cursor: pointer;
  align-self: flex-end;
`;

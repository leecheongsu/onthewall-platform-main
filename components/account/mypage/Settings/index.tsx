import React, { useCallback, useState } from 'react';
import { useUserStore } from '@/store/user';
import AntSwitch from '@/components/AntSwitch';
import { useProjectStore } from '@/store/project';
import { useTranslation } from 'react-i18next';
import { projectAccountApis } from '@/api/project';
import styled from '@emotion/styled';

type Props = {};

function Settings({}: Props) {
  const { i18n, t } = useTranslation();
  const { projectId, isExpired } = useProjectStore();
  const { uid, alarmStatus, updateObjInfo, projectsMap } = useUserStore();

  const [notification, setNotification] = useState({
    marketing: alarmStatus.marketing,
    email: alarmStatus.email,
    kakao: alarmStatus.kakao
  });

  const sendNotificationSettings = useCallback(async (type: string, value: boolean) => {
    try {
      const data = {
        uid: uid,
        status: projectsMap[projectId].status,
        type: type,
        value: value
      };

      await projectAccountApis.renewNotification(projectId, data);
    } catch (e) {
      console.error('Notification Setting :', e);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setNotification((prev) => ({
      ...prev,
      [name]: checked
    }));
    sendNotificationSettings(name, checked)
      .then(() => {
        updateObjInfo(`alarmStatus.${name}`, checked);
      });
  };

  return (
    <Container>
      <Header>{t('Settings')}</Header>
      <Body>
        <Contents>
          <OrderItem>
            <SubHeader>{t('Notifications')}</SubHeader>
            <Row>
              <Label>{t('Promotional and Advertisements Notifications')}</Label>
              <AntSwitch
                name="marketing"
                disabled={isExpired}
                checked={notification.marketing}
                onChange={handleChange}
              />
            </Row>
            <Row>
              <Label>{t('Essential Service Notifications by Email')}</Label>
              <AntSwitch
                name="email"
                disabled={isExpired}
                checked={notification.email}
                onChange={handleChange}
              />
            </Row>
            <Row>
              <Label>{t('Essential Service Notifications by Kakao')}</Label>
              <AntSwitch
                name="kakao"
                disabled={isExpired}
                checked={notification.kakao}
                onChange={handleChange}
              />
            </Row>
          </OrderItem>
        </Contents>
      </Body>
    </Container>
  );
}

export default Settings;
const Container = styled.div`
    padding: 26px 40px;
`;
const Header = styled.div`
    font-size: 20px;
    font-weight: bold;
    line-height: 1.33;
    letter-spacing: -0.02em;
    color: #2d3748;
    margin-bottom: 24px;
    border-bottom: 1px solid #3a4454;
    padding-bottom: 8px;
`;
const Contents = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;
const Body = styled.div`
    margin-top: 24px;
`;

const OrderItem = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-bottom: 16px;
    gap: 0;
    border: 1px solid #ecf0f6;
    padding: 22px 28px;
    width: 100%;
`;
const SubHeader = styled.div`
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: -0.02em;
    color: #2d3748;
    font-weight: 600;
    margin-bottom: 8px;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    gap: 12px;
`;

const Label = styled.div`
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: -0.02em;
    color: #94a2b8;
    font-weight: 500;
`;

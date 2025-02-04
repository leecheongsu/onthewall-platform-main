import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useUserStore } from '@/store/user';
import useInput from '@/hooks/useInput';
import RoundButton from '@/components/RoundButton';
import { updateCurrentUser } from '@/api/firestore/getUsers';
import { useProjectStore } from '@/store/project';
import { useTranslation } from 'react-i18next';

type Props = {};

function UserInfo({}: Props) {
  const { i18n, t } = useTranslation();
  const { userName, uid, status, updateInfo, projectsMap } = useUserStore((state) => state);
  const nameInput = useInput(userName);
  const [edit, setEdit] = useState<'none' | 'name'>('none');
  const { isExpired, projectId } = useProjectStore();

  const handleEditSubmit = () => {
    if (edit === 'name') {
      // name validation
      if (nameInput.value.trim() === '') return alert(t('Please enter your name'));
      else if (nameInput.value.length > 20) return alert(t('Name is too long'));
      else {
        updateCurrentUser(uid, projectsMap[projectId].status, { userName: nameInput.value }).then(() => {
          updateInfo('userName', nameInput.value);
          setEdit('none');
          alert('Successfully updated');
        });
      }
    }
    setEdit('none');
  };

  return (
    <Container>
      <Header>{t('User Info')}</Header>
      <Body>
        <Contents>
          <Row>
            <Label>{t('Name')}</Label>
            {edit !== 'name' ? (
              <Value>{userName}</Value>
            ) : (
              <Input type="text" {...nameInput} placeholder={t('Name')} required isRenew={edit === 'name'} />
            )}
            {edit === 'name' ? (
              <>
                <RoundButton sx={{ marginTop: '-3px'}} variant="contained" onClick={handleEditSubmit}>
                  {t('Submit')}
                </RoundButton>
                <RoundButton sx={{ marginTop: '-3px'}} variant="outlined" onClick={() => setEdit('none')}>
                  {t('Cancel')}
                </RoundButton>
              </>
            ) : (
              <RoundButton variant="outlined" disabled={isExpired} onClick={() => setEdit('name')}>
                {t('Change')}
              </RoundButton>
            )}
          </Row>
        </Contents>
      </Body>
    </Container>
  );
}

export default UserInfo;
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
  padding: 22px 42px;
`;
const Body = styled.div`
  margin-top: 24px;
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 16px;
  height: 36px;
  gap: 10px;
`;

const Label = styled.div`
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #94a2b8;
  font-weight: 500;
  width: 150px;
`;

const Value = styled.div`
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #2d3748;
  min-width: 220px;
`;

const Input = styled.input<{ isRenew: boolean }>`
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: -0.02em;
    color: #2d3748;
    border: ${(props) => (props.isRenew ? '1px solid #94a2b8' : 'none')};
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 220px;
    margin-top: -8px;

    &:focus {
        outline: none;
        border-color: #3182ce;
    }

    &::placeholder {
        color: #94a2b8;
        font-size: 14px;
    }
`;

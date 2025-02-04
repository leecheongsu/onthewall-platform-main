import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useUserStore } from '@/store/user';
import RoundButton from '@/components/RoundButton';
import { isValidPassword } from '@/utils/validation';
import { useProjectStore } from '@/store/project';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { projectAccountApis } from '@/api/project';
import { platformAccountApis } from '@/api/platform';
import { useRouter } from 'next/navigation';

type Props = {};

function LoginInfo({}: Props) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const { email, status, uid, logOut, projectsMap } = useUserStore();
  const { projectId, isExpired, projectUrl, tier } = useProjectStore();
  const [isRenew, setIsRenew] = useState(false);

  const [formData, setFormData] = useState({
    uid: uid,
    password: '********',
    confirmPwd: '',
    status: status,
    email: email
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  const handleRenewButton = () => {
    if (isRenew) {
      //submit
      if (!formData.password.trim()) {
        return alert(t('Please fill in all required fields.'));
      }

      if (!isValidPassword(formData.password)) {
        return alert(
          t(
            'Password must contain at least 8 characters including at one number, and one special character.'
          )
        );
      }

      if (!formData.confirmPwd.trim()) {
        return alert(t('Please fill in all required fields.'));
      }

      if (formData.password !== formData.confirmPwd) {
        return alert(
          t('The passwords do not match. Please re-enter your password and confirm password.')
        );
      }

      if (status === 'general' || status === 'none') {
        projectAccountApis
          .renewPassword(projectId, formData)
          .then(res => {
            const apiRes = res.data as ApiResponse;
            if (apiRes.meta.ok) {
              setIsRenew(false);
              return alert('Password Renewed');
            }
          })
          .catch(e => {
            console.error('Renew Pwd User: ', e);
            alert(e.message);
          });
      }
    } else {
      //change
      setIsRenew(true);
    }
  };

  const passwordInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isRenew && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [isRenew]);
  const logoutHandler = async () => {

    const userStatus = projectsMap[projectId].status

    if(userStatus === 'user') {
      logOut()
    } else {
      await platformAccountApis.signOut()
    }

    if (projectUrl) {
      if(tier === 'enterprise') {
        router.push(`/${projectUrl}/main`);
      } else {
        router.push('/home')
      }
    } else {
      router.push(`/home`);
    }
  };
  const CancelRenew = () => {
    setIsRenew(false);
  };

  return (
    <Container>
      <Header>{t('Login Info')}</Header>
      <Body>
        <Contents>
          <Row>
            <Label>{t('Email')}</Label>
            <Value>{email}</Value>
          </Row>
          <Row>
            <Label>{t('Password')}</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              placeholder={t('Password')}
              onChange={handleChange}
              required
              readOnly={!isRenew}
              ref={passwordInputRef}
              isRenew={isRenew}
            />
            {!isRenew && (
              <RoundButton variant="outlined" disabled={isExpired} onClick={handleRenewButton}>
                {t('Change')}
              </RoundButton>
            )}
          </Row>
          {isRenew && (
            <Row>
              <Label>{t('Confirm Password')}</Label>
              <Input
                type="password"
                name="confirmPwd"
                value={formData.confirmPwd}
                placeholder={t('Confirm Password')}
                onChange={handleChange}
                required
                isRenew={isRenew}
              />
              <Buttons>
                <RoundButton variant="contained" onClick={handleRenewButton}>
                  {t('Submit')}
                </RoundButton>
                <RoundButton variant="outlined" onClick={CancelRenew}>
                  {t('Cancel')}
                </RoundButton>
              </Buttons>
            </Row>
          )}
        </Contents>
        {/* <Bottom>
					<Button variant="outlined" onClick={logoutHandler}>
						{t('Log Out')}
					</Button>
				</Bottom> */}
      </Body>
    </Container>
  );
}

export default LoginInfo;

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
`;

const Input = styled.input<{ isRenew: boolean }>`
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: -0.02em;
    color: #2d3748;
    border: ${props => (props.isRenew ? '1px solid #94a2b8' : 'none')};
    border-radius: 4px;
    padding: 4px 8px;
    min-width: 220px;

    &:focus {
        outline: none;
        border-color: #3182ce;
    }

    &::placeholder {
        color: #94a2b8;
        font-size: 14px;
    }
`;
const Buttons = styled.div`
    display: flex;
    gap: 0;
`;

'use client';

import FormInput from '@/components/FormInput';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import ModalBox from '@/components/Modal';
import Loading from '@/app/loading';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjectStore } from '@/store/project';
import { isValidEmail, isValidPassword } from '@/utils/validation';
import AntSwitch from '@/components/AntSwitch';
import styled from '@emotion/styled';
import { Modal } from '@mui/material';
import { TERMS_KR, TERMS_EN, PRIVACY_KR, PRIVACY_EN, MARKETING_KR, MARKETING_EN } from '@/constants/terms';
import Br from '@/components/Br';
import { useTranslation } from 'react-i18next';
import { projectAccountApis } from '@/api/project';
import { CompleteRegistration, VerificationPhone, WarningRegisterEmail } from '@/components/account/sign/modal';
import SelectItem from '@/components/SelectItem';
import { KindOfReferrerKR, KindOfReferrerEN } from '@/constants/referrer';
import { platformAccountApis } from '@/api/platform';
import { COUNTRIES } from '@/constants/countryCode';
import { AuthErrorHandler } from '@/api/config';
import { useLanguageStore } from '@/store/language';

const CountryCodes = COUNTRIES.map((country) => ({
  title: country.originalName,
  value: country.countryCode,
  phoneCode: country.phoneCode,
}));

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { language } = useLanguageStore();
  const { projectId, projectUrl } = useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const [modalConf, setModalConf] = useState({});

  const [formData, setFormData] = useState({
    channelName: '',
    userName: '',
    email: '',
    password: '',
    confirmPwd: '',
    terms: {
      termC_1: false, // (필수) 이용약관 동의
      termC_2: false, // (필수) 개인정보 수집 및 이용 동의
    },
    marketing: false, // (선택) 광고성 정보 수신 동의
    countryCodeText: '',
    phone: '',
    referrer: '',
    refEtcText: '',
    social: 'email',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState<'termC_1' | 'termC_2' | 'marketing' | 'none'>('none');
  const [countryCode, setCountryCode] = useState('');

  const [isVerify, setIsVerify] = useState(false); // 전화번호 인증
  const [isValid, setIsValid] = useState(false); // 이메일 validation

  const [modalChild, setModalChild] = useState({
    type: 'email',
    conf: {},
  });

  const [hashedCode, setHashedCode] = useState('');

  useEffect(() => {
    const email = searchParams?.get('email');
    if (email) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
      }));
      setIsValid(true);
    }
  }, [searchParams]);

  const onClose = () => {
    setIsOpen(false);
  };

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleChangeTerms = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'marketing') {
      setFormData((prev) => ({
        ...prev,
        marketing: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        terms: {
          ...prev.terms,
          [name]: checked,
        },
      }));
    }
  }, []);

  const handleChangeAllTerms = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      terms: {
        termC_1: checked,
        termC_2: checked,
      },
      marketing: checked,
    }));
  };

  const handleTermsView = (code: string) => {
    switch (code) {
      case 'termC_1': // (필수) 이용약관 동의
        setOpenModal('termC_1');
        break;
      case 'termC_2': // (필수) 개인정보 수집 및 이용 동의
        setOpenModal('termC_2');
        break;
      case 'marketing': // (선택) 광고성 정보 수신 동의
        setOpenModal('marketing');
        break;
    }
  };

  const handleSubmitButton = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.userName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPwd.trim()
    ) {
      return alert(t('Please fill in all required fields.'));
    }

    if (formData.userName.length > 20) {
      return alert(t('Name is too long'));
    }

    if (!isValid) {
      return alert(t('Please validate your email'));
    }

    if (!isValidPassword(formData.password)) {
      return alert(
        t('Password must contain at least 8 characters including at one number, and one special character.')
      );
    }

    if (formData.password !== formData.confirmPwd) {
      return alert(t('Check your Password'));
    }

    if (!formData.terms.termC_1 || !formData.terms.termC_2) {
      return alert(t('Please confirm the required agreement terms'));
    }

    setIsLoading(true);

    projectAccountApis
      .join(projectId, formData)
      .then((res) => {
        const apiRes = res.data as ApiResponse;
        if (apiRes.meta.ok) {
          setIsLoading(false);
          alert(t('Register Applied Successfully. Please wait for approval.'));
        }
      })
      .catch((e) => {
        setIsOpen(true);
        setModalConf({
          blindFilter: true,
          handleCenterButton: {
            type: 'button',
            title: 'Close',
            className: 'btn_outline w-1/2',
            onClick: () => {
              onClose();
              setIsLoading(false);
            },
          },
        });
        console.log('Project Join Error : ', e);
        AuthErrorHandler(e);
      });
  };

  const handleVerificationButton = async () => {
    if (formData.countryCodeText.length === 0) {
      return alert(t('Please select the country code'));
    }

    if (formData.phone === '' && formData.phone.length < 9) {
      return alert(t('Please Enter the Phone Number correctly'));
    }
    // 문자 있을 경ㅜ
    if (/[^0-9]/.test(formData.phone)) {
      return alert(t('Please Enter the Phone Number correctly'));
    }

    try {
      const isValidPhone = await projectAccountApis.validatePhone(projectId, countryCode, formData.phone);

      if (!isValidPhone) {
        alert(t('Already Used Phone Number.'));
        return;
      }

      if (countryCode !== '82') {
        setIsVerify(true);
        return;
      }

      platformAccountApis.sendVerificationCode(countryCode + formData.phone).then((res) => {
        if (res.status === 200) {
          setHashedCode(res.data.hash);
          setModalChild({
            type: 'phone',
            conf: {
              phone: formData.phone,
              countryCode: countryCode,
              hashedCode: res.data.hash,
              onVerified: () => setIsVerify(true),
              onClose: onClose,
            },
          });
          setModalConf({
            blindFilter: true,
            handleCenterButton: {
              type: 'submit',
              title: t('Confirm'),
              className: 'btn_submit text-base font-medium',
              onClick: () => {},
            },
          });
          setIsOpen(true);
        }
      });
    } catch (e) {
      console.error('Send Verification Code : ', e);
      AuthErrorHandler(e);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleValidButton = async () => {
    if (!formData.email.trim()) {
      return alert(t('Please fill in all required fields.'));
    }

    if (!isValidEmail(formData.email)) {
      return alert(t('Please check your email form'));
    }

    try {
      const data = {
        email: formData.email,
      };

      const res = await projectAccountApis.validateEmail(projectId, data);

      if (res.status === 200) {
        setIsValid(true);
        return true;
      }
    } catch (error) {
      console.error('Email validation failed:', error);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="form_container">
        <form className="form_box_lg" onSubmit={handleSubmitButton}>
          <span className="title pb-3">{t('Create Account')}</span>
          <span className="sub_title -mt-3 pb-12">
            {t('Effortlessly Build Connections Your Exhibition Community.')}
          </span>
          {/*<FormInput*/}
          {/*  name="channelName"*/}
          {/*  value={formData.channelName}*/}
          {/*  label={t('Channel Name')}*/}
          {/*  placeholder={t('Channel Name')}*/}
          {/*  onChange={handleChange}*/}
          {/*  className="outlined"*/}
          {/*  required*/}
          {/*  helperText={t(*/}
          {/*    'This refers to the name of the channel where you can check and manage exhibition lists, exhibition information, etc.'*/}
          {/*  )}*/}
          {/*/>*/}
          <FormInput
            name="userName"
            value={formData.userName}
            label="Username"
            placeholder={t('Username')}
            onChange={handleChange}
            className="outlined"
            required
          />
          <FlexRowBox>
            <FormInput
              name="email"
              value={formData.email}
              label={t('E-mail')}
              placeholder={t('E-mail')}
              onChange={handleChange}
              className="outlined"
              disabled={isValid}
              required
            />
            <ValidButton type="button" onClick={handleValidButton} variant="contained" disabled={isValid}>
              {t('Validation')}
            </ValidButton>
          </FlexRowBox>
          <FormInput
            type="password"
            name="password"
            value={formData.password}
            label={t('Password')}
            placeholder={t('Password')}
            onChange={handleChange}
            className="outlined"
            required
          />
          <FormInput
            type="password"
            name="confirmPwd"
            value={formData.confirmPwd}
            label={t('Confirm Password')}
            placeholder={t('Confirm Password')}
            onChange={handleChange}
            className="outlined"
            required
          />
          <InputBox>
            <Label>
              {t('Phone Number')} <RedAsterisk>*</RedAsterisk>
            </Label>
            <VerificationBox>
              <FlexBox>
                <SelectItem
                  label="CountryCode"
                  name="countryCodeText"
                  value={formData.countryCodeText}
                  items={CountryCodes}
                  onChange={(e) => {
                    handleChange(e);
                    const phoneCode = CountryCodes.find((item) => item.value === e.target.value)?.phoneCode!;
                    setCountryCode(phoneCode);
                  }}
                  style={{ padding: '5px' }}
                  disabled={isVerify}
                />
              </FlexBox>
              <FormInput
                name="phone"
                value={formData.phone}
                className="outlined"
                onChange={handleChange}
                placeholder={t('Phone number')}
                maxLength={11}
                required
                disabled={isVerify}
              />
              <VerifyButton type="button" onClick={handleVerificationButton} variant="contained" disabled={isVerify}>
                {isVerify ? t('Verified') : t('Verify')}
              </VerifyButton>
            </VerificationBox>
          </InputBox>
          <SelectBox>
            <SelectLabel>{t('Referrer')}</SelectLabel>
            <SelectItem
              label={t('어떠한 경로로 ONTHEWALL 을 알게되셨습니까?')}
              name="referrer"
              value={formData.referrer}
              items={language === 'kr' ? KindOfReferrerKR : KindOfReferrerEN}
              onChange={handleSelectChange}
              fullWidth
            />
            {formData.referrer === 'etc' && (
              <div style={{ paddingTop: '20px' }}>
                <FormInput
                  name="refEtcText"
                  value={formData.refEtcText}
                  label="Specify Answer"
                  placeholder={t('Etc...')}
                  onChange={handleChange}
                  className="outlined"
                />
              </div>
            )}
          </SelectBox>
          {/* 약관 동의*/}
          <TermContainer>
            <TermRow>
              <AntSwitch
                checked={formData.terms.termC_1 && formData.terms.termC_2 && formData.marketing}
                onChange={handleChangeAllTerms}
              />
              <span>{t('I Agree to all terms and conditions.')}</span>
            </TermRow>
            <TermRow>
              <AntSwitch name="termC_1" checked={formData.terms.termC_1} onChange={handleChangeTerms} />
              <span>
                <span>({t('Required')})</span>
                {t('Terms and Conditions')}
              </span>
              <button onClick={() => handleTermsView('termC_1')} type="button">
                <span>{t('Read More')}</span>
              </button>
            </TermRow>
            <TermRow>
              <AntSwitch name="termC_2" checked={formData.terms.termC_2} onChange={handleChangeTerms} />
              <span>
                <span>({t('Required')})</span>
                {t('Privacy Policy')}
              </span>
              <button onClick={() => handleTermsView('termC_2')} type="button">
                <span>{t('Read More')}</span>
              </button>
            </TermRow>
            <TermRow>
              <AntSwitch name="marketing" checked={formData.marketing} onChange={handleChangeTerms} />
              <span>
                <span>({t('Optional')})</span>
                {t('Receive promotional information')}
              </span>
              <button onClick={() => handleTermsView('marketing')} type="button">
                <span>{t('Read More')}</span>
              </button>
            </TermRow>
          </TermContainer>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!formData.terms.termC_1 || !formData.terms.termC_2}
          >
            {t('Submit')}
          </Button>
          <BottomButtons>
            <Button
              variant="text"
              type="button"
              // className="btn_text text-main_blue border-l border-l-main_blue pl-2"
              onClick={() => router.push('/account/sign-in')}
              fullWidth
            >
              {t('Back to Sign In')}
            </Button>
          </BottomButtons>
        </form>
      </div>
      <ModalBox
        size={modalChild.type !== 'registration' ? 'md' : 'lg'}
        state={isOpen}
        setState={onClose}
        modalConf={modalConf}
      >
        {modalChild.type === 'email' && <WarningRegisterEmail />}
        {modalChild.type === 'registration' && <CompleteRegistration config={modalChild.conf} />}
        {modalChild.type === 'phone' && <VerificationPhone config={modalChild.conf} />}
      </ModalBox>
      <Modal open={openModal !== 'none'} onClose={() => setOpenModal('none')}>
        <TermModal>
          <TermHeader>
            {openModal === 'termC_1' && <span>{t('Terms and Conditions')}</span>}
            {openModal === 'termC_2' && <span>{t('Privacy Policy')}</span>}
            {openModal === 'marketing' && <span>{t('Receive promotional information')}</span>}
            <Button onClick={() => setOpenModal('none')} size="small">
              {t('Close')}
            </Button>
          </TermHeader>
          {openModal === 'termC_1' && (
            <TermContent>{<Br text={language === 'kr' ? TERMS_KR : TERMS_EN} />}</TermContent>
          )}
          {openModal === 'termC_2' && (
            <TermContent>{<Br text={language === 'kr' ? PRIVACY_KR : PRIVACY_EN} />}</TermContent>
          )}
          {openModal === 'marketing' && (
            <TermContent>{<Br text={language === 'kr' ? MARKETING_KR : MARKETING_EN} />}</TermContent>
          )}
        </TermModal>
      </Modal>
    </>
  );
}

const Label = styled.label`
  text-align: left;
  padding-bottom: 5px;
`;

const RedAsterisk = styled.span`
  color: red;
`;

const TermContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #e5e5e5;
  padding: 10px;
  width: 100%;
  border-radius: 5px;
  margin-bottom: 20px;
`;
const TermRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;

  &:first-of-type {
    margin-top: 0;
  }

  &:last-of-type {
    margin-bottom: 10px;
  }

  & > span {
    margin-left: 10px;
    font-size: 14px;
  }

  & > button {
    margin-left: 12px;
    font-size: 14px;
    color: #115de6;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const TermModal = styled.div`
  background-color: #fff;
  width: 500px;
  height: 800px;
  max-width: 100vw;
  max-height: 100vh;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;
const TermContent = styled.div`
  height: calc(100% - 60px);
  width: 100%;
  overflow-y: auto;
  padding: 10px 20px;
  font-size: 14px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a1a1a1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
`;

const TermHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e5e5;

  & > span {
    font-size: 18px;
    font-weight: bold;
  }

  & > button {
    font-size: 16px;
    color: #115de6;
    cursor: pointer;
  }
`;

const BottomButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
`;

const SelectBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`;

const InputBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const VerificationBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
`;

const VerifyButton = styled(Button)`
  text-transform: capitalize;
  width: 25%;
  height: 49px;
  margin-top: 10px;
  font-size: 16px;
`;

const SelectLabel = styled.label`
  display: block;
  padding-top: 10px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const FlexBox = styled.div`
  display: flex;
  justify-content: left;
  padding-top: 10px;
`;

const ValidButton = styled(Button)`
  text-transform: capitalize;
  width: 25%;
  height: 49px;
  font-size: 16px;
  margin-top: 8px;
`;

const FlexRowBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
`;

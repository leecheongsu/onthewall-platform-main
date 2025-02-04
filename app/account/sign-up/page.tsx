'use client';

import FormInput from '@/components/FormInput';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import ModalBox from '@/components/Modal';
import Loading from '@/app/loading';
import { useUserStore } from '@/store/user';
import { isValidEmail, isValidPassword } from '@/utils/validation';

import AntSwitch from '@/components/AntSwitch';
import styled from '@emotion/styled';
import { Modal } from '@mui/material';
import { TERMS_KR, TERMS_EN, PRIVACY_KR, PRIVACY_EN, MARKETING_KR, MARKETING_EN } from '@/constants/terms';
import Br from '@/components/Br';
import { platformAccountApis } from '@/api/platform';
import { useTranslation } from 'react-i18next';
import { KindOfReferrerKR, KindOfReferrerEN } from '@/constants/referrer';
import SelectItem from '@/components/SelectItem';
import { COUNTRIES } from '@/constants/countryCode';
import { useProjectStore } from '@/store/project';
import { CompleteRegistration, VerificationPhone, WarningRegisterEmail } from '@/components/account/sign/modal';
import kakaoApis from '@/api/kakao';
import googleApis from '@/api/google';
import { getClientIp } from '@/api/geo';
import { useLanguageStore } from '@/store/language';

interface Props {}

const CountryCodes = COUNTRIES.map((country) => ({
  title: country.originalName,
  value: country.countryCode,
  phoneCode: country.phoneCode,
}));

export default function Page({}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [modalConf, setModalConf] = useState({});
  const { login } = useUserStore();
  const { updateInfo: projectUpdate } = useProjectStore();

  const [openModal, setOpenModal] = useState<'termC_1' | 'termC_2' | 'marketing' | 'none'>('none');
  const [countryCode, setCountryCode] = useState('');

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
    marketing: false, // (선택) 광고성 정보 수신 동의,
    countryCodeText: '',
    phone: '',
    referrer: '',
    refEtcText: '',
    social: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const [isVerify, setIsVerify] = useState(false); // 전화번호 인증
  const [isHidden, setIsHidden] = useState(false); // 전화번호 인증 숨기기
  const [isValid, setIsValid] = useState(false); // 이메일 validation
  const [isAdminInvited, setIsAdminInvited] = useState(false);

  const [modalChild, setModalChild] = useState({
    type: 'email',
    conf: {},
  });

  const [hashedCode, setHashedCode] = useState('');
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [isNext, setIsNext] = useState(false);

  const [disabledButtons, setDisabledButtons] = useState({
    email: false,
    google: false,
    kakao: false,
  });

  useEffect(() => {
    getClientIp().then((res: any) => {
      if (res.status === 200) {
        const { country_code } = res.data;
        if (country_code !== 'KR') {
          setIsHidden(true);
        } else {
          setFormData((prev) => ({
            ...prev,
            countryCodeText: 'KR',
          }));
          setCountryCode('82');
        }
      }
    });
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    const email = searchParams?.get('email');
    if (email) {
      setFormData((prev) => ({
        ...prev,
        social: 'email',
        email: decodeURIComponent(email),
      }));
      setDisabledButtons({
        email: false,
        google: true,
        kakao: true,
      });
      setIsValid(true);
      setIsNext(true);
      setIsAdminInvited(true); //NOTE. 초대받은 admin만 이 폼 사용.
    }
  }, [searchParams]);

  const onClose = () => {
    setIsOpen(false);
  };

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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

  const handleSubmitButton = async () => {
    if (
      !formData.channelName.trim() ||
      !formData.userName.trim() ||
      !formData.password.trim() ||
      !formData.confirmPwd.trim()
    ) {
      return alert(t('Please fill in all required fields.'));
    }

    if (!isValidPassword(formData.password)) {
      return alert(
        t('Password must contain at least 8 characters including at one number, and one special character.')
      );
    }

    if (formData.password !== formData.confirmPwd) {
      return alert(t('Please enter your Password'));
    }

    if (!isVerify) {
      return alert(t('Please click the verification button to confirm'));
    }

    if (!formData.terms.termC_1 || !formData.terms.termC_2) {
      return alert(t('Please confirm the required agreement terms'));
    }

    setIsLoading(true);

    const joinApi = isAdminInvited ? platformAccountApis.joinAdmin : platformAccountApis.join;

    joinApi(formData)
      .then(async (res) => {
        const apiRes = res.data as ApiResponse;
        if (apiRes.meta.ok) {
          setIsLoading(false);
          setModalConf({
            blindFilter: true,
          });
          setModalChild({
            type: 'registration',
            conf: {
              email: formData.email,
              userName: formData.userName,
              isAdmin: isAdminInvited,
            },
          });
          setIsOpen(true);
          await login(apiRes.data as UserInfo);
          projectUpdate('projectId', apiRes.data.projects[0].id);
        }
      })
      .catch((e) => {
        if (e.response.status < 500) {
          setIsOpen(true);
          setModalConf({
            blindFilter: true,
            handleCenterButton: {
              type: 'button',
              title: 'Close',
              className: 'btn_outline w-1/2',
              onClick: onClose,
            },
          });
        }
        console.log('Owner Join Error : ', e);
        alert(t('Already Used'));
        setIsLoading(false);
      });
  };

  const handleVerificationButton = async () => {
    if (formData.countryCodeText.length === 0) {
      return alert(t('Please select the country code'));
    }

    if (formData.phone === '' && formData.phone.length !== 11) {
      return alert(t('Please Enter the Phone Number correctly'));
    }
    // 문자 있을 경ㅜ
    if (/[^0-9]/.test(formData.phone)) {
      return alert(t('Please Enter Numbers Only'));
    }

    try {
      const isValidPhone = await platformAccountApis.validatePhone(countryCode, formData.phone);

      if (!isValidPhone) {
        alert(t('Already Used Phone Number.'));
        return;
      }

      /*
       *   Note. 해외인 경우 중복체크만
       * */
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
    }
  };

  const handleValidButton = async () => {
    if (!formData.email.trim()) {
      return alert(t('Please fill in all required fields.'));
    }

    if (!isValidEmail(formData.email)) {
      return alert(t('Please check your email form'));
    }

    try {
      const isValid = await validateEmail(formData.email);
      if (isValid) {
        setIsValid(true);
        setIsNext(true);
        setFormData((prev) => ({
          ...prev,
          social: 'email',
        }));
        setDisabledButtons({
          email: false,
          google: true,
          kakao: true,
        });
      }
    } catch (error) {
      console.error('Email validation failed:', error);
    }
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    const data = { email: email };

    try {
      const res = await platformAccountApis.validateEmail(data);
      return res.status === 200;
    } catch (e) {
      console.error('Valid Email Error: ', e);
      alert(t('Already Used'));
      return false;
    }
  };

  const handleTypeButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    const processAuth = async (authType: string) => {
      switch (authType) {
        case 'kakao':
          kakaoApis.authorized('/account/sign-up');
          break;
        case 'google':
          try {
            const userCredential = await googleApis.sign();
            if (userCredential) {
              const { displayName, email } = userCredential.user as any;
              try {
                const isValid = await validateEmail(email);
                if (isValid) {
                  setFormData((prev) => ({
                    ...prev,
                    email: email,
                    userName: displayName,
                    social: 'google',
                  }));
                  setIsShowEmail(true);
                  setIsValid(true);
                  setIsNext(true);
                  setDisabledButtons({
                    email: true,
                    google: false,
                    kakao: true,
                  });
                }
              } catch (error) {
                console.error('Email validation failed:', error);
              }
            }
          } catch (error) {
            console.error('Google Auth Error: ', error);
          }
          break;
        default:
          break;
      }
    };

    const isEmailButton = name === 'email';
    setIsShowEmail(isEmailButton);

    if (!isEmailButton) {
      await processAuth(name);
    }
  };

  const isExecuted = useRef(false);
  useEffect(() => {
    const validKakaoUser = async (code: string) => {
      const res = await kakaoApis.getUserData(code, '/account/sign-up');
      const { email, name } = res.kakao_account;

      try {
        const isValid = await validateEmail(email);
        if (isValid) {
          setFormData((prev) => ({
            ...prev,
            email: email,
            userName: name,
            social: 'kakao',
          }));
          setIsShowEmail(true);
          setIsValid(true);
          setIsNext(true);
          setDisabledButtons({
            email: true,
            google: true,
            kakao: false,
          });
        } else {
          alert(t('Already Used'));
          return;
        }
      } catch (error) {
        console.error('Email validation failed:', error);
      }
    };

    const code = params!.get('code');

    if (code && !isExecuted.current) {
      if (typeof window !== 'undefined') {
        // Dynamically load Kakao SDK script if it's not already loaded
        if (!window.Kakao) {
          const script = document.createElement('script');
          script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';

          script.onload = () => {
            window.Kakao.init('000449cced76c5fafdf4c8b065679d0b');
            console.log('Kakao initialized2:', Kakao.isInitialized());
          };
          document.head.appendChild(script);
        } else {
          if (!Kakao.isInitialized()) {
            Kakao.init('000449cced76c5fafdf4c8b065679d0b');
            console.log('Kakao initialized2:', Kakao.isInitialized());
          }
        }
      }

      validKakaoUser(code).then(() => {
        isExecuted.current = true;
      });
    }
  }, [params]);

  const handleCountryCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
    const phoneCode = CountryCodes.find((item) => item.value === e.target.value)?.phoneCode!;
    setCountryCode(phoneCode);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="form_container">
        <form className="form_box_lg">
          <span className="title pb-3">{t('Create Account')}</span>
          <span className="sub_title -mt-3 pb-12">
            {t('Effortlessly Build Connections Your Exhibition Community.')}
          </span>
          <FlexRowBox>
            <Button variant="outlined" name="email" onClick={handleTypeButton} disabled={disabledButtons.email}>
              E-mail
            </Button>
            <Button variant="outlined" name="google" onClick={handleTypeButton} disabled={disabledButtons.google}>
              Google
            </Button>
            <Button variant="outlined" name="kakao" onClick={handleTypeButton} disabled={disabledButtons.kakao}>
              Kakao
            </Button>
          </FlexRowBox>
          {isShowEmail && (
            <FlexRowBox>
              <FormInput
                name="email"
                value={formData.email}
                label={t('E-mail')}
                placeholder={t('E-mail')}
                onChange={handleChange}
                className="outlined"
                required
                disabled={isValid}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleValidButton();
                    e.preventDefault();
                  }
                }}
              />
              <ValidButton type="button" onClick={handleValidButton} variant="contained" disabled={isValid}>
                {t('Validation')}
              </ValidButton>
            </FlexRowBox>
          )}
          {isNext && (
            <>
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
              <div style={{ width: '100%' }}>
                <FormInput
                  name="channelName"
                  value={formData.channelName}
                  label={t('Channel Name')}
                  placeholder={t('Channel Name')}
                  onChange={handleChange}
                  className="outlined"
                  required
                  helperText={t(
                    'This refers to the name of the channel where you can check and manage exhibition lists, exhibition information, etc.'
                  )}
                />
              </div>
              <FormInput
                name="userName"
                value={formData.userName}
                label={t('Username')}
                placeholder={t('Username')}
                onChange={handleChange}
                className="outlined"
                required
              />
              <InputBox>
                <Label>
                  {t('Phone Number')} <RedAsterisk>*</RedAsterisk>
                </Label>
                <FlexRowBox>
                  <FlexLeftBox>
                    `
                    <SelectItem
                      label={t('CountryCode')}
                      name="countryCodeText"
                      value={formData.countryCodeText}
                      items={CountryCodes}
                      onChange={handleCountryCodeChange}
                      disabled={isVerify}
                      style={{ height: 50, paddingTop: 0 }}
                    />
                  </FlexLeftBox>
                  <FormInput
                    name="phone"
                    value={formData.phone}
                    className="outlined"
                    onChange={handleChange}
                    placeholder={t('Phone number')}
                    maxLength={11}
                    disabled={isVerify}
                    required
                  />
                  <VerifyButton
                    type="button"
                    onClick={handleVerificationButton}
                    variant="contained"
                    disabled={isVerify || isHidden}
                  >
                    {isVerify ? t('Verified') : t('Verify')}
                  </VerifyButton>
                </FlexRowBox>
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
                type="button"
                fullWidth
                onClick={handleSubmitButton}
                variant="contained"
                disabled={!formData.terms.termC_1 || !formData.terms.termC_2}
              >
                {t('Submit')}
              </Button>
            </>
          )}
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

const FlexRowBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
`;

const ValidButton = styled(Button)`
  text-transform: capitalize;
  width: 25%;
  height: 49px;
  font-size: 16px;
  margin-top: 8px;
`;

const VerifyButton = styled(Button)`
  text-transform: capitalize;
  width: 25%;
  height: 49px;
  font-size: 16px;
`;

const SelectLabel = styled.label`
  display: block;
  padding-top: 10px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const FlexLeftBox = styled.div`
  display: flex;
  justify-content: left;
`;

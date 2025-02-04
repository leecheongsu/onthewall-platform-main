// react
import { useEffect, useState } from 'react';

// api
import { moduleApis } from '@/api/module';

// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { Grid, Step, StepLabel, Stepper, Button } from '@mui/material';
import Modal from '@mui/material/Modal';

// compo
import Info from '@/app/[projectUrl]/manage/my-exhibitions/register/component/info';
import Space from '@/app/[projectUrl]/manage/my-exhibitions/register/component/space';

// icons
import CloseIcon from '@/images/icons/Close';
import { useDesignStore } from '@/store/design';

interface Props {}

interface Color {
  primary: string;
  secondary: string;
}

const Register = ({}: Props) => {
  const { i18n, t } = useTranslation();
  const { theme } = useDesignStore();

  const [activeStep, setActiveStep] = useState(0);
  const [spaceList, setSpaceList] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [showcase, setShowcase] = useState({
    space: '',
    id: '',
    title: '',
    title_en: '',
  });
  function getSteps() {
    return [t('Select Exhibition Space'), t('Input Exhibition Information')];
  }
  const steps = getSteps();

  const onModalOpen = (space: any) => {
    setShowcase({
      space: space,
      id: space.matterportId,
      title: space.title,
      title_en: space.title_en,
    });
    setIsOpen(true);
  };

  const SelectSpace = () => {
    setActiveStep(1);
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const getSpace = async () => {
      const res = await moduleApis.getSpaces();
      if (res) {
        const space = (res?.data?.spaces as any) ?? [];
        setSpaceList(space);
      }
    };
    getSpace();
  }, []);

  return (
    <>
      <Container>
        <Title>{t('Create Exhibition')}</Title>
        <StyledStepper theme={theme.primary} activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <StyledStep key={label}>
              <StepLabel>{label}</StepLabel>
            </StyledStep>
          ))}
        </StyledStepper>
        {activeStep === 0 ? (
          <>
            <ToggleButtonGroup>
              <ToggleButton>기본 공간</ToggleButton>
              <ToggleButton>나만의 공간</ToggleButton>
            </ToggleButtonGroup>
            <Grid container style={{ minWidth: 330, margin: 0 }} spacing={2}>
              {spaceList?.map((space: any, idx: any) => {
                return (
                  <Space
                    space={space}
                    onModalOpen={() => {
                      onModalOpen(space);
                    }}
                    key={idx}
                  />
                );
              })}
            </Grid>
          </>
        ) : (
          <Info showcase={showcase} setActiveStep={setActiveStep} />
        )}
      </Container>
      <Modal
        open={isOpen}
        onClose={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        <Box>
          <CloseButton
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
          >
            <CloseIcon className="w-7 h-7" />
          </CloseButton>
          <ModalTitle>[ {showcase.title_en} ]</ModalTitle>
          <ModalSubText>{t('Would you choose this new exhibition space?')}</ModalSubText>
          <Buttons>
            <Button
              onClick={() => {
                SelectSpace();
              }}
              variant="contained"
            >
              {t('Select')}
            </Button>
            <Button
              onClick={() => {
                setIsOpen((prev) => !prev);
              }}
              variant="outlined"
            >
              {t('Cancel')}
            </Button>
          </Buttons>
        </Box>
      </Modal>
    </>
  );
};

export default Register;

const Container = styled.div`
  width: 100%;
  padding: 30px;
  max-width: 1500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 40px;
  font-size: 24px;
  font-weight: 600;
  line-height: 40px;
`;

const StyledStepper = styled(Stepper)<{ theme: any }>`
  & svg.Mui-active {
    color: ${(props) => props.theme.primary};
  }
  & svg.Mui-completed {
    color: ${(props) => props.theme.primary};
  }
  padding-bottom: 50px;
`;

const StyledStep = styled(Step)``;

const Box = styled.div`
  max-width: 400px;
  min-width: 300px;
  min-height: 100px;
  margin: 30vh auto;
  border-radius: 10px;
  background-color: #fff;
  padding: 20px;
`;

const CloseButton = styled.div`
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
`;

const ModalTitle = styled.h4`
  text-align: center;
  font-weight: 500;
  margin-bottom: 20px;
`;

const ModalSubText = styled.p`
  text-align: center;
  font-size: 14px;
  margin-bottom: 25px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

// const Button = styled.button<{ theme: any }>`
// 	width: 90px;
// 	padding: 5px 10px;
// 	border-radius: 5px;
// 	border: 1px solid ${props => props.theme.primary};
// 	cursor: pointer;
// 	&.select {
// 		background-color: ${props => props.theme.primary};
// 		color: #fff;
// 		margin-right: 10px;
// 	}
// 	&.cancel {
// 		background-color: #fff;
// 		color: ${props => props.theme.primary};
// 	}
// `;

const ToggleButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  width: 100px;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  &.Mui-selected {
    background-color: #e0e0e0;
  }
`;

import styled from '@emotion/styled';
import React, {useEffect, useMemo, useState} from 'react';
import {Button, MenuItem, Select, TextField, Tooltip} from '@mui/material';
import {useDesignStore} from '@/store/design';
import NoticeIcon from '@/images/icons/Notice';
import {useTranslation} from 'react-i18next';
import Modal from "@mui/material/Modal";
import CloseIcon from "@/images/icons/Close";
import {Form, Formik} from "formik";
import Switch from "@mui/material/Switch";
import {useProjectStore} from "@/store/project";
import {ProjectManageApis} from "@/api/project";
import InfoIcon from "@mui/icons-material/Info";

export interface RemoveCancelProps {
    action: 'Remove' | 'Cancel';
    name?: string;
    role?: string;
}

export const RemoveCancel = ({name, action, role = 'administrators'}: RemoveCancelProps) => {
    const {i18n, t} = useTranslation();
    const color = useDesignStore(state => state.theme);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {
        if (action === 'Remove') {
            setTitle(t(`Are you sure you want to remove ${name} <br /> from the ${role}?`));
            setText(t(`${name}'s exhibitions will be deleted. This action cannot be undone.`));
        } else {
            setTitle(t('Are you sure you want to <br /> cancel the invitation?'));
            setText(t('Once canceled, the invitation cannot be used.'));
        }
    }, []);

    return (
        <Box>
            <Notice color={color.primary}>
                <NoticeIcon className="w-10 h-10"/>
            </Notice>
            <Title dangerouslySetInnerHTML={{__html: title}}/>
            <Text>{text}</Text>
        </Box>
    );
};

export interface ModifyProps {
    name?: string;
    max?: number;
    selected: number;
    onSelected: (v: number) => void;
}

export const Modify = ({name, max = 10, selected, onSelected}: ModifyProps) => {
    const {i18n, t} = useTranslation();
    const menuItems = [0, ...Array.from({length: max}, (_, index) => index + 1)];
    const [maxCount, setMaxCount] = useState(selected);

    const handleMaxCount = (v: number) => {
        setMaxCount(v);
        onSelected(v);
    };

    return (
        <SelectBox>
            <Typography>
                {t('User Name')} : {name}
            </Typography>
            <CustomSelect value={maxCount} onChange={e => handleMaxCount(Number(e.target.value))}>
                {menuItems.map(item => (
                    <MenuItem key={item} value={item}>
                        {item}
                    </MenuItem>
                ))}
            </CustomSelect>
        </SelectBox>
    );
};

export const Settings = () => {
    const {t} = useTranslation();
    const {projectId, config} = useProjectStore();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        isAutoApproved: false,
        initialAssignedCount: 3,
    });

    useEffect(() => {
        if (config) {
            setFormData({
                isAutoApproved: config.isAutoApproved,
                initialAssignedCount: config.initialAssignedCount,
            });
        }
    }, [config]);

    const isShow = useMemo(() => formData.isAutoApproved, [formData.isAutoApproved]);
    const help = useMemo(() => {
        const autoText = "When a user signs up for the platform, " +
            "they will be immediately registered and assigned the configured number of exhibition slots."
        const notAutoText = 'When a user signs up for the platform, their registration status will be set to \'Pending Approval,\' and they will be able to create exhibitions only after approval.'

        return formData.isAutoApproved ? autoText : notAutoText;
    }, [formData.isAutoApproved]);

    const toggleModal = () => setIsOpen((prev) => !prev);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, type, checked, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : checked,
        }));
    };

    const handleSubmit = async () => {
        try {
            const data = {
                field: 'config',
                value: {
                    ...formData,
                    adminMaxCount: config.adminMaxCount
                }
            }

            const res = await ProjectManageApis.modifyProjectConfig(projectId, data);
            if (res.status === 200) {
                alert(t("Settings have been successfully updated."));
                setIsOpen(false)
            }
        } catch (e) {
            console.error("Modify Project Config: ", e);
            alert(t("An error occurred while updating settings. Please try again in a few minutes."));
        }
    };

    return (
        <>
            <Button variant="outlined" onClick={() => setIsOpen(true)}>
                {t("Setting")}
            </Button>
            <Modal open={isOpen} onClose={() => setIsOpen(false)}>
                <Wrapper>
                    <ModalHeader>
                        <HeaderTitle>{t("Setting")}</HeaderTitle>
                        <CloseButton onClick={toggleModal}>
                            <CloseIcon className="h-5 w-5"/>
                        </CloseButton>
                    </ModalHeader>
                    <ModalContent>
                        <Formik initialValues={formData} onSubmit={handleSubmit} enableReinitialize>
                            {({isSubmitting}) => (
                                <StyledForm>
                                    <StyledTr>
                                        <StyledTd>
                                            <h3>{t("SignUp Approval Option")}</h3>
                                            <Tooltip title={help}>
                                                <IconInfo />
                                            </Tooltip>
                                        </StyledTd>
                                        <StyledTd>
                                            <Switch
                                                name="isAutoApproved"
                                                checked={formData.isAutoApproved}
                                                onChange={handleChange}
                                            />
                                        </StyledTd>
                                    </StyledTr>
                                    {isShow && (
                                        <StyledTr>
                                            <StyledTd>
                                                <h3>{t("Initial Exhibition Count")}</h3>
                                            </StyledTd>
                                            <StyledTd>
                                                <FormInput
                                                    type="number"
                                                    name="initialAssignedCount"
                                                    value={formData.initialAssignedCount}
                                                    onChange={handleChange}
                                                />
                                            </StyledTd>
                                        </StyledTr>
                                    )}
                                    <ButtonBox>
                                        <StyledButton
                                            type="submit"
                                            disabled={isSubmitting}
                                            color="primary"
                                            variant="contained"
                                        >
                                            {t("Submit")}
                                        </StyledButton>
                                    </ButtonBox>
                                </StyledForm>
                            )}
                        </Formik>
                    </ModalContent>
                </Wrapper>
            </Modal>
        </>
    );
};

const Notice = styled.div<{ color?: any }>`
    margin-bottom: 1rem;

    & svg {
        stroke: ${props => props.color};
    }
`;

const Box = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
`;

const Title = styled.span`
    color: #1e2a3b;
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
`;

const Text = styled.span`
    font-size: 14px;
    margin-top: 0.75rem;
    margin-bottom: 2rem;
`;

const Typography = styled.span`
    color: #1e2a3b;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 180%;
    letter-spacing: -0.32px;
    margin-bottom: 3vh;
`;

const SelectBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const CustomSelect = styled(Select)`
    display: flex;
    width: 153px;
    height: 53px;
    padding: 10px 20px;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    color: #64748b;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 3vh;
`;

const Wrapper = styled.div`
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 30vh;
    overflow-y: auto;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    outline: none;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    position: absolute;
    left: 0;
    top: 0;
    height: 71px;
    width: 100%;
    background-color: #fff;
    z-index: 1;
`;

const HeaderTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    text-align: center;
`;

const CloseButton = styled.div`
    cursor: pointer;
`;

const ModalContent = styled.div`
    padding: 90px 20px 20px 20px;
    height: 100%;
    overflow-y: auto;
    // scrollbar

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
        background-color: #f1f1f4;
    }
`;

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
`;

const StyledTr = styled.div`
    display: flex;
    margin: 0 0 1.25rem;
    align-items: center;
    justify-content: space-between;
`;

const StyledTd = styled.div`
    width: 100%;
    display: flex;
    border-bottom: 1px solid #f1f4f9;
    align-items: center;
    justify-content: flex-start;

    & input,
    & textarea {
        background-color: #f9f9f9;
        padding: 0.775rem 1rem;
        border-radius: 0.475rem;
    }

    & input:focus,
    & textarea:focus {
        background-color: #f1f1f4;
    }

    & div {
        font-size: 14px;
        padding: 0;
    }

    & p {
        margin-top: 0;
    }

    & h3 {
        font-size: 18px;
        font-weight: 500;
        padding-bottom: 10px;
    }

    &:last-child {
        justify-content: flex-end;
    }
`;

const ButtonBox = styled.div`
    position: absolute;
    bottom: 20px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
`;

const StyledButton = styled(Button)`
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    width: 120px;
    cursor: pointer;
    margin: auto;
`;

const FormInput = styled(TextField)`
    width: 120px;
    height: 50px;
    padding-bottom: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
`;

const IconInfo = styled(InfoIcon)`
    width: 2rem;
    height: 2rem;
    color: rgba(0, 0, 0, 0.3);
    font-size: 1rem;
    padding-bottom: 10px;
`;
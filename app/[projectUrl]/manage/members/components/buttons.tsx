import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import IconButton from "@mui/joy/IconButton";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import Divider from "@mui/joy/Divider";
import React, {useEffect, useState} from "react";
import ModalBox from "@/components/Modal";
import {useProjectStore} from "@/store/project";
import {platformManageApis} from "@/api/platform";
import {useTranslation} from "react-i18next";
import {
    Modify,
    ModifyProps,
    RemoveCancel,
    RemoveCancelProps
} from "@/app/[projectUrl]/manage/members/components/modals";

interface Props {
    data: any;
}

export const Actions = ({ data }: Props) => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [removeCancelProps, setRemoveCancelProps] = useState<RemoveCancelProps>();

    const [maxCount, setMaxCount] = useState(0);
    const [modifyProps, setModifyProps] = useState<ModifyProps>();
    const [modalConf, setModalConf] = useState({});
    const {projectId, isExpired, fetchProjectUserData} = useProjectStore();


    const handleEditItem = () => {
        setIsOpen(true);
        setRemoveCancelProps(undefined);
        setModifyProps({
            name: data.userName,
            max: 10,
            selected: maxCount,
            onSelected: setMaxCount,
        });
    }

    const handleDeleteItem = () => {
        setIsOpen(true);
        setModifyProps(undefined);
        setRemoveCancelProps({action: "Remove", name: data.userName, role: "members"});

        const handleRemove = () => {
            const form = {
                uid: data.uid,
                projectId: projectId,
                status: 'user'
            };

            platformManageApis
                .remove(form)
                .then((res) => {
                    const apiRes = res.data as ApiResponse
                    if (apiRes.meta.ok) {
                        setIsOpen(false);
                        fetchProjectUserData(projectId, "user");
                    }
                })
                .catch(e => {
                    console.error("remove Error : ", e);
                    alert(e.message);
                });
        };

        setModalConf({
            blindFilter: true,
            handleLeftButton: {
                title: t("Close"),
                className: "btn_outline",
                onClick: () => setIsOpen(false),
            },
            handleRightButton: {
                title: t("Remove"),
                className: "btn_outline",
                onClick: handleRemove,
            },
        });
    }

    const handleMaxNumButton = () => {
        const form = {
            uid: data.uid,
            projectId: projectId,
            field: "exhibitionCount",
            value: maxCount,
        };

        platformManageApis
            .editUserInfo(form)
            .then((res) => {
                const apiRes = res.data as ApiResponse
                if (apiRes.meta.ok) {
                    setIsOpen(false);
                    fetchProjectUserData(projectId, "user");
                }
            })
            .catch(e => {
                console.error("edit user info : ", e);
                alert(e.message);
            });
    }

    useEffect(() => {
        setModalConf({
            title: t("Maximum Number of Exhibitions"),
            blindFilter: true,
            handleLeftButton: {
                title: t("Close"),
                className: "btn_outline",
                onClick: () => setIsOpen(false),
            },
            handleRightButton: {
                title: t("Select"),
                className: "btn_outline ",
                onClick: handleMaxNumButton,
            },
        });
    }, [maxCount]);

    return (
        <>
            <Dropdown>
                <MenuButton
                    slots={{root: IconButton}}
                    slotProps={{root: {color: 'neutral', size: 'sm'}}}
                >
                    <MoreHorizRoundedIcon/>
                </MenuButton>
                <Menu size="sm" sx={{minWidth: 140}}>
                    <MenuItem onClick={handleEditItem}>Edit</MenuItem>
                    <Divider/>
                    <MenuItem color="danger" onClick={handleDeleteItem}>Delete</MenuItem>
                </Menu>
            </Dropdown>
            <ModalBox state={isOpen} setState={() => setIsOpen(false)} modalConf={modalConf}>
                {modifyProps && <Modify {...modifyProps} />}
                {removeCancelProps && <RemoveCancel {...removeCancelProps} />}
            </ModalBox>
        </>
    )
}
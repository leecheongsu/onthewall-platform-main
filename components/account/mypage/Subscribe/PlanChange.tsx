import React, { ChangeEvent, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Button, Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface Props {}

function PlanChangeButton({}: Props) {
	const { i18n, t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [type, setType] = useState<"direct" | "reservation">("direct");
	const [description, setDescription] = useState("");
	const router = useRouter();

	const onOpen = () => {
		setIsOpen(true);
	};

	const onClose = () => {
		setType("direct");
		setDescription("");
		setIsOpen(false);
	};

	useEffect(() => {
		switch (type) {
			case "direct":
				setDescription(
					t(`Your current plan will change immediately,
				The new rates take effect immediately.`),
				);
				break;
			case "reservation":
				setDescription(
					t(`The plan will change from the next payment date,
				Your current plan will remain in place.`),
				);
				break;
		}
	}, [type]);

	const handleConfirmButton = () => {
		router.push(`/account/payment/plan?type=${type}`);
	};

	return (
		<>
			<Button variant="outlined" onClick={onOpen}>
				{t("Change Subscription")}
			</Button>
			<Modal open={isOpen} onClose={onClose}>
				<ModalContent>
					<ModalHeader>{t("Change Plan")}</ModalHeader>
					<ModalBody>
						<ButtonGroup>
							<PlanButton
								variant={type === "direct" ? "contained" : "outlined"}
								selected={type === "direct"}
								onClick={() => setType("direct")}
							>
								{t("Direct")}
							</PlanButton>
							<PlanButton
								variant={type === "reservation" ? "contained" : "outlined"}
								selected={type === "direct"}
								onClick={() => setType("reservation")}
							>
								{t("Reservation")}
							</PlanButton>
						</ButtonGroup>
						<Description>{description}</Description>
					</ModalBody>
					<ModalActions>
						<StyledButton variant="outlined" onClick={onClose}>
							{t("Cancel")}
						</StyledButton>
						<StyledButton variant="contained" color="primary" onClick={handleConfirmButton}>
							{t("Confirm")}
						</StyledButton>
					</ModalActions>
				</ModalContent>
			</Modal>
		</>
	);
}

export default PlanChangeButton;

const StyledButton = styled(Button)`
	width: 180px;
`;

const PlanButton = styled(Button)<{ selected: boolean }>`
	width: 120px;
`;

const ModalContent = styled.div`
	position: absolute;
	width: 450px;
	height: 450px;
	background-color: white;
	padding: 16px;
	border-radius: 5px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const ModalHeader = styled.div`
	font-size: 1.25rem;
	font-weight: bold;
	margin-bottom: 30px;
	color: #2d3748;
	text-align: center;
`;

const ModalBody = styled.div`
	margin-bottom: 16px;
`;

const ModalActions = styled.div`
	display: flex;
	justify-content: center;
	gap: 10px;
	margin-top: 20px;
`;

const ButtonGroup = styled.div`
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
`;

const Description = styled.div`
	margin-top: 20px;
	padding: 10px;
	height: 150px;
	background-color: rgba(0, 0, 0, 0.2);
	color: white;
	text-align: center;
	border-radius: 5px;
	white-space: pre-line;
`;

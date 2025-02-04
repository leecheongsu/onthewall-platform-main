import {ReactNode} from "react";
import styled from "@emotion/styled";

interface Props {
    label?: string;
    children?: ReactNode
}

/**
 * NOTE. 필요시 size, shape 추가해서 확장시킬 것.
 */
function Card({label, children}: Props) {
    return (
        <Container>
            <LabelBox isHas={!!label}>
                <Label>{label}</Label>
            </LabelBox>
            <ContentBox>
                {children}
            </ContentBox>
        </Container>
    )
}

export default Card;

const Container = styled.div`
    width: 100%;
    max-width: 500px;
    height: 300px;
    min-height: 100px;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    background: #ffffff;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.10);
    display: flex;
    flex-direction: column;
    overflow: auto;

    @media (max-height: 320px) {
        height: 100%;
    }
`;

const LabelBox = styled.div<{isHas : boolean}>`
    padding: 15px 15px 25px 15px;
    border-bottom: ${({isHas}) => isHas ? '1px solid #E2E8F0' : 'none'};
`;

const Label = styled.span`
    color: #0F1A2A;
    text-align: justify;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
`;

const ContentBox = styled.div`
    flex: 1;
    display: flex;
    padding: 25px 15px 15px 15px;
`;
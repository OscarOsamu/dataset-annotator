import styled from 'styled-components';
import { Card, Button } from 'antd';
import { AppColors } from './Colors';

// ---- STYLED COMPONENTS ----
export const PageContainer = styled.div`
    padding: 20px;
    margin-left: 25px;         
    width: calc(100% - 25px); 
`;


export const StyledCard = styled(Card)`
    border-radius: 12px !important;
    margin-bottom: 30px;
`;



export const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const CreateButton = styled(Button)`
    margin: 20px 0;
`;

export const TwoColumnLayout = styled.div`
    display: flex;
    gap: 20px;
    margin-top: 20px;
    align-items: stretch;

    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

export const LeftColumn = styled.div`
    flex: 1;
`;

export const RightColumn = styled.div`
    flex: 1;
`;

export const VerticalSeparator = styled.div`
    width: 1px;
    background-color: ${AppColors.COLOR_BG};
    margin: 0 10px;

    @media (max-width: 900px) {
        display: none;
    }
`;
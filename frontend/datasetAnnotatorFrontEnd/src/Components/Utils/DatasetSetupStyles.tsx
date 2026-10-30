import styled from "styled-components";
import { AppColors } from "./Colors";
import { AppBorders, AppRadius, AppSizing, AppSpacing } from "./AppStyles";

export const SetupPage = styled.main`
  max-width: ${AppSizing.PageMaxWidth};
  margin: 0 auto;
  padding: ${AppSpacing.Large};
`;

export const SetupSection = styled.section`
  margin-top: ${AppSpacing.ExtraLarge};
  padding-top: ${AppSpacing.Large};
  border-top: ${AppBorders.Default};
`;

export const DatasetSummary = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${AppSpacing.Large};
  flex-wrap: wrap;
  padding: ${AppSpacing.Large};
  border: ${AppBorders.Default};
  border-radius: ${AppRadius.Medium};
  background: ${AppColors.COLOR_CONTAINER_BG};
`;

export const DescriptionColumn = styled.div`
  flex: 1 1 420px;
  min-width: 0;
`;
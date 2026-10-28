import type { ReactNode } from "react";
import {
  PageContainer,
  TitleRow,
  TwoColumnLayout,
  LeftColumn,
  RightColumn,
  VerticalSeparator,
} from "../../Utils/StyledComponents";

interface TwoColumnPageTemplateProps {
  title?: string;
  leftChild: ReactNode;
  rightChild: ReactNode;
}

const TwoColumnPageTemplate = ({
  title,
  leftChild,
  rightChild,
}: TwoColumnPageTemplateProps) => {
  return (
    <PageContainer>
      {title?.trim() && (
        <TitleRow>
          <h1>{title}</h1>
        </TitleRow>
      )}

      <TwoColumnLayout>
        <LeftColumn>{leftChild}</LeftColumn>

        <VerticalSeparator />

        <RightColumn>{rightChild}</RightColumn>
      </TwoColumnLayout>
    </PageContainer>
  );
};

export default TwoColumnPageTemplate;

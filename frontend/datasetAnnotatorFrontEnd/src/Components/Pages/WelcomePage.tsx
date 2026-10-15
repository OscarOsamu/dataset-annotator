import React from "react";
import {
  PageContainer,
  TitleRow,
  TwoColumnLayout,
  LeftColumn,
  RightColumn,
  VerticalSeparator,
} from "../Utils/StyledComponents";

const WelcomePage: React.FC = () => {
  return (
    <PageContainer>
      <>
        <TitleRow>
          <h1>Bienvenue</h1>
        </TitleRow>

        <TwoColumnLayout>
          {/* LEFT SIDE */}
          <LeftColumn>Left</LeftColumn>

          {/* VERTICAL LINE */}
          <VerticalSeparator />

          {/* RIGHT SIDE  */}
          <RightColumn>Right</RightColumn>
        </TwoColumnLayout>
      </>
    </PageContainer>
  );
};

export default WelcomePage;

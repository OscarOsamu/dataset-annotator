import React from "react";

import TwoColumnPageTemplate from "./Templates/TwoColumnPageTemplate";

const WelcomePage: React.FC = () => {
  return (
    <TwoColumnPageTemplate title="Bienvenue" leftChild=<>Left</> rightChild=<>Right</>/>
  );
};

export default WelcomePage;

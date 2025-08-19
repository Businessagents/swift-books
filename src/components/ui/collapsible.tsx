import * as React from "react";
import { Collapse } from "@chakra-ui/react";

interface CollapsibleProps {
  open?: boolean;
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ open = false, children }) => {
  return <Collapse in={open}>{children}</Collapse>;
};

export const CollapsibleContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const CollapsibleTrigger: React.FC<{ 
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return <div onClick={onClick}>{children}</div>;
};
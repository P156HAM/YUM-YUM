import { ReactNode } from "react";
import "./style.scss";

type DashboardContainerProps = {
  children: ReactNode | ReactNode[];
};

export function DashboardContainer({ children }: DashboardContainerProps) {
  return <main className="dashboard-container">{children}</main>;
}

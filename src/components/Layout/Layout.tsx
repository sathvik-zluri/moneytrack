import { ReactNode } from "react";
import Header from "./Header";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="content container mt-1">{children}</div>
    </>
  );
};

export default Layout;

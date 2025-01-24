import { ReactNode } from "react";
import Header from "./Header";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="content container mx-auto">{children}</div>
    </>
  );
};

export default Layout;

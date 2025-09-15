import React from "react";

const OutletContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-4 flex flex-1 flex-col h-screen gap-4 rounded-xl *:w-full">
    {children}
  </div>
);

export default OutletContainer;

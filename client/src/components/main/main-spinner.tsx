import { Loader2 } from "lucide-react";

const MainSpinner = ({ message }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4  ">
      <Loader2 className="animate-spin size-16" />
      {message && <h4>{message}</h4>}
    </div>
  );
};

export default MainSpinner;

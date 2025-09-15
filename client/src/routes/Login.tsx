import { Command } from "lucide-react";

import LoginForm from "@/components/forms/login-form";

const Login = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium cursor-pointer">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Command className="size-4" />
          </div>
          Ref-resh
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;

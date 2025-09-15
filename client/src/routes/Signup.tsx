import { Command } from "lucide-react";
import { Link } from "react-router-dom";

import SignupForm from "@/components/forms/signup-form";

const Signup = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 self-center font-medium cursor-pointer">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Command className="size-4" />
              </div>
              <p className="font-bold">Welcome to Ref-resh</p>
            </div>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Login.
              </Link>
            </div>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default Signup;

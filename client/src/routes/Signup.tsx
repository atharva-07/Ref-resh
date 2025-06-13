import { Link } from "react-router-dom";

import SignupForm from "@/components/forms/SignupForm";

const Signup = () => {
  return (
    <div className="m-auto">
      <h3 className="font-semibold text-xl mb-6">
        Take your first step to start Ref-resh-ing...
      </h3>
      <SignupForm />
      {/* <div className="text-sm text-muted-foreground font-thin pt-6">
        Already have an account?&nbsp;
        <Link
          to="/login"
          className="text-foreground hover:text-purple-400 hover:underline"
        >
          Login.
        </Link>
      </div> */}
    </div>
  );
};

export default Signup;

import ForgotPasswordForm from "@/components/forms/forgot-password-form";

const ForogtPassword = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForogtPassword;

import PasswordResetForm from "@/components/forms/password-reset-form";

const ResetPassword = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <PasswordResetForm />
      </div>
    </div>
  );
};

export default ResetPassword;

"use client";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OtpComponent({ strategy }: { strategy: string }) {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    try {
      if (strategy === "email_code") {
        const result = await signIn?.attemptFirstFactor({
          strategy: "email_code",
          code: otp,
        });
        if (result?.status === "complete") {
          await setSignInActive?.({ session: result.createdSessionId });
          router.push("/dashboard");
        }
      }
      if (strategy === "password") {
        if (!isLoaded) return;
        const signUpAttempt = await signUp?.attemptEmailAddressVerification({
          code: otp,
        });
        if (signUpAttempt.status === "complete") {
          await setSignUpActive?.({ session: signUpAttempt.createdSessionId });
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("error is", err);
      //@ts-expect-error err.errors is not defined
      setError(err.errors?.[0]?.message || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleGoBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-gray-800">
            Verify Your Account
          </motion.h2>
        </div>

        <p className="text-center text-gray-600">We&apos;ve sent a 6-digit verification code to your email. Please enter the code below to confirm your account.</p>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 text-sm text-red-500 bg-red-100 border border-red-400 rounded-md">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleOtpVerification} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={otp.length !== 6 || isVerifying}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </motion.button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">Didn&apos;t receive the code?</p>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function OtpComponent({ strategy }: { strategy: string }) {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      if (strategy === 'email_code') {
        const result = await signIn!.attemptFirstFactor({
          strategy: 'email_code',
          code: otp,
        });
        if (result.status === 'complete') {
          await setSignInActive!({ session: result.createdSessionId });
          router.push('/dashboard');
        }
      }
      if (strategy === 'password') {
        if (!isLoaded) return;
        const signUpAttempt = await signUp!.attemptEmailAddressVerification({
          code: otp,
        });
        if (signUpAttempt.status === 'complete') {
          await setSignUpActive!({ session: signUpAttempt.createdSessionId });
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('error is', err);
      //@ts-expect-error err.errors is not defined
      setError(err.errors?.[0]?.message || 'OTP verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <h2 className="text-2xl font-semibold text-center">
            Verify Your Account
          </h2>
        </div>

        <p className="text-center text-gray-600">
          We&apos;ve sent a 6-digit verification code to your email. Please
          enter the code below to confirm your account.
        </p>

        <form onSubmit={handleOtpVerification} className="space-y-6">
          <InputOTP
            className=" w-full max-w-md p-2 space-y-2  "
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-2"
            >
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
            </motion.div>
          </InputOTP>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center p-4 text-red-800 bg-red-100 rounded-lg"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full"
            disabled={otp.length !== 6 || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">Didn&apos;t receive the code?</p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useSignUp } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import { motion } from "framer-motion";
import { CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { OtpComponent } from "@/components/authComponents/otpComponent";

export default function SignUpComponent() {
  const { isLoaded, signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerifying(true);
    } catch (err) {
      //@ts-expect-error err.errors is not defined
      setError(err.errors?.[0]?.message || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = (strategy: OAuthStrategy) => {
    return signUp?.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sign-up/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  if (verifying) {
    return <OtpComponent strategy="password" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-center text-gray-800">
          Sign Up
        </motion.h2>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 text-sm text-red-500 bg-red-100 border border-red-400 rounded-md">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              id="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {password && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
              <p className="text-xs text-gray-600">Password must contain:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li className="flex items-center">
                  {password.length > 8 ? <CheckCircle className="w-3 h-3 text-green-500 mr-2" /> : <XCircle className="w-3 h-3 text-red-500 mr-2" />}
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  {password.match(/[A-Z]/) && password.match(/[a-z]/) ? <CheckCircle className="w-3 h-3 text-green-500 mr-2" /> : <XCircle className="w-3 h-3 text-red-500 mr-2" />}
                  Upper and lowercase letters
                </li>
                <li className="flex items-center">
                  {password.match(/\d/) ? <CheckCircle className="w-3 h-3 text-green-500 mr-2" /> : <XCircle className="w-3 h-3 text-red-500 mr-2" />}
                  At least one number
                </li>
                <li className="flex items-center">
                  {password.match(/[^a-zA-Z\d]/) ? <CheckCircle className="w-3 h-3 text-green-500 mr-2" /> : <XCircle className="w-3 h-3 text-red-500 mr-2" />}
                  At least one special character
                </li>
              </ul>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? "Signing up..." : "Sign up with Email"}
          </motion.button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleGoogleSignUp("oauth_google")}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Image src="https://authjs.dev/img/providers/google.svg" alt="Google logo" height="24" width="24" className="mr-2" />
          Sign up with Google
        </motion.button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex justify-center">
          <Link href="/sign-in" className="text-sm font-medium text-black hover:text-blue-500">
            Already have an account? Sign In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

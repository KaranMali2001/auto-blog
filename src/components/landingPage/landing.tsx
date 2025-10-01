"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
export function LandingPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl p-8 space-y-8 text-center bg-white rounded-lg shadow-xl"
        >
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-5xl font-bold text-gray-800">
            Welcome to Auto Blog
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-lg text-gray-600">
            Automatically generate blog content from your GitHub repository activity. Turn your code commits into engaging blog posts seamlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center gap-4"
          >
            <Button asChild size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

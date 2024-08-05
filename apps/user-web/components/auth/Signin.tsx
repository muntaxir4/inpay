"use client";

import image from "@/public/next.svg";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { label } from "@/components/ui/label";
import { handleSignin } from "./handleSubmit";
import { useToast } from "@/components/ui/use-toast";

import { useRouter } from "next/navigation";

export default function Signin() {
  const { toast } = useToast();
  const router = useRouter();
  return (
    <div className="h-full mx-4 lg:grid lg:grid-cols-2 ">
      <div className="hidden bg-muted lg:block">
        <Image
          src={image}
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <form method="post" onSubmit={(e) => handleSignin(e, toast, router)}>
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid gap-6 text-sm">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-balance text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center ">
                  <label htmlFor="password">Password</label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                    tabIndex={-1}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import image from "@/public/next.svg";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleSignin } from "./handleSubmit";
import { useToast } from "@/components/ui/use-toast";

import { useRouter } from "next/navigation";
import GoogleSignin from "./GoogleSignin";
import { useEffect } from "react";

export default function Signin() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (localStorage?.getItem("inpay") === "true") {
      router.push("/");
    }
  }, []);

  return (
    <div className="h-full mx-4 lg:grid lg:grid-cols-2 w-full">
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
              <h1 className="text-3xl font-bold">Sign in</h1>
              <p className="text-balance text-muted-foreground">
                Enter your email below to sign in to your account
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
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password">Password</label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
              <GoogleSignin toast={toast} router={router}>
                <Button type="button" variant="outline" className="w-full">
                  Sign in with Google
                </Button>
              </GoogleSignin>
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

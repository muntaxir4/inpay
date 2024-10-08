"use client";

import image from "@/public/singup.png";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

import { useToast } from "@/components/ui/use-toast";

import { useRouter } from "next/navigation";
import { handleSignup } from "./handleSubmit";
import GoogleSignin from "./GoogleSignin";
import { useEffect } from "react";

export default function Signup() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (localStorage?.getItem("inpay") === "true") {
      router.push("/");
    }
  }, []);

  return (
    <div className="h-full grid lg:grid-cols-2 mx-4 w-full">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid gap-6 text-sm">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Signup</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <form method="post" onSubmit={(e) => handleSignup(e, toast, router)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <label htmlFor="firstName">Firstname</label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="lastName">Lastname</label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

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
                <label htmlFor="password">Password</label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Create your acccount
              </Button>
              <GoogleSignin toast={toast} router={router}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full dark:bg-secondary/40 dark:border-slate-600"
                >
                  Sign up with
                  <img
                    src="https://www.vectorlogo.zone/logos/google/google-ar21.svg"
                    alt="Google Logo"
                    className="w-16 h-8 mx-2"
                  />
                </Button>
              </GoogleSignin>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-muted p-4 mb-8 sm:p-20">
        <Image
          src={image}
          alt="Image"
          width="600"
          height="600"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

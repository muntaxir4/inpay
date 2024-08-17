"use client";

import image from "@/public/next.svg";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { label } from "@/components/ui/label";
import Image from "next/image";

import { useToast } from "@/components/ui/use-toast";

import { useRouter } from "next/navigation";
import { handleSignup } from "./handleSubmit";

export default function Signup() {
  const { toast } = useToast();
  const router = useRouter();
  return (
    <div className="h-full lg:grid lg:grid-cols-2 mx-4 w-full">
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
              <Button variant="outline" className="w-full">
                Signup with Google
              </Button>
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
      <div className="hidden bg-muted lg:block">
        <Image
          src={image}
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

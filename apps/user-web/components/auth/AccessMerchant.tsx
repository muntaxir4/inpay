"use client";
import image from "@/public/merchant.png";
import {
  googleLogout,
  GoogleOAuthProvider,
  useGoogleLogin,
} from "@react-oauth/google";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

function AccessHandler() {
  const { toast } = useToast();
  const router = useRouter();
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSignin,
    onError: (error) => {
      console.error(error);
    },
    flow: "auth-code",
  });
  async function handleGoogleSignin({ code }: { code: string }) {
    toast({
      title: "Logging in",
      duration: 15000,
    });
    try {
      const timeoutId = setTimeout(() => {
        toast({
          title: "The server was asleep. Waking up...",
          duration: 10000,
        });
      }, 2000);
      const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
      await axios.post(
        API_URL + "/auth/access/merchant",
        {
          code,
        },
        {
          withCredentials: true,
        }
      );
      googleLogout();
      clearTimeout(timeoutId);
      toast({
        title: "Logged in",
        duration: 2000,
      });
      router.push("/merchant");
    } catch (error) {
      toast({
        title: "Error",
        description: "Signin with Google failed",
        variant: "destructive",
        duration: 3000,
      });
    }
  }
  return (
    <div className="grid items-center">
      <Button
        className="text-lg rounded-full p-6"
        onClick={() => googleLogin()}
      >
        Continue with{" "}
        <img
          src="https://www.vectorlogo.zone/logos/google/google-ar21.svg"
          alt="Google Logo"
          className="w-fit h-10 mx-2"
        />
      </Button>
    </div>
  );
}

export default function AccessMerchant() {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  return (
    <div className="flex flex-col gap-8 p-4 justify-center items-center">
      <div>
        <Image src={image} alt="merchant" />
      </div>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AccessHandler />
      </GoogleOAuthProvider>
    </div>
  );
}

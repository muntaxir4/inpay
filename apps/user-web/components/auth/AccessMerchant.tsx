"use client";
import {
  googleLogout,
  GoogleOAuthProvider,
  useGoogleLogin,
} from "@react-oauth/google";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AccessHandler />
    </GoogleOAuthProvider>
  );
}

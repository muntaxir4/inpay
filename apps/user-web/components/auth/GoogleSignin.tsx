"use client";
import {
  GoogleOAuthProvider,
  useGoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import axios from "axios";
import { toast as typeToast } from "@/components/ui/use-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function GoogleSigninHandler({
  children,
  toast,
  router,
}: {
  children: React.ReactNode;
  toast: typeof typeToast;
  router: AppRouterInstance;
}) {
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
      duration: 3000,
    });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
      const response = await axios.post(
        API_URL + "/auth/signin/google",
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
      router.push("/app");
    } catch (error) {
      toast({
        title: "Error",
        description: "Signin with Google failed",
        variant: "destructive",
        duration: 3000,
      });
    }
  }
  return <div onClick={() => googleLogin()}>{children}</div>;
}

export default function GoogleSignin({
  children,
  toast,
  router,
}: {
  children: React.ReactNode;
  toast: typeof typeToast;
  router: AppRouterInstance;
}) {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleSigninHandler toast={toast} router={router}>
        {children}
      </GoogleSigninHandler>
    </GoogleOAuthProvider>
  );
}

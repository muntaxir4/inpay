import { FeaturesSectionDemo } from "./ac/features-section";
import Link from "next/link";
import HomeTagLine from "./HomeTagLine";
import HomeLinks from "./HomeLinks";

export default function HomePage() {
  return (
    <div>
      <HomeTagLine />
      <HomeLinks />
      <FeaturesSectionDemo />
      <div className="flex flex-col sm:flex-row justify-around text-sm">
        <div className="flex gap-5 pb-5 mx-8 text-muted-foreground">
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
        <div className="flex gap-5 justify-end pb-5 mx-8 text-muted-foreground">
          <Link href="/docs">Docs</Link>
          <Link href="https://github.com/muntaxir4/inpay" target="_blank">
            Source Code
          </Link>
          <Link href="https://mallik.tech" target="_blank">
            <p>Muntasir Mallik</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

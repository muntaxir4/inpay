import Link from "next/link";

export default function Docs() {
  return (
    <div className="grid justify-items-center items-center content-center gap-8">
      <h2 className="text-2xl font-semibold">API Documentations</h2>
      <ul className="list-disc grid gap-3">
        <li className="underline">
          <Link href="/docs/auth">Auth Route</Link>
        </li>
        <li className="underline">
          <Link href="/docs/user">User Route</Link>
        </li>
        <li className="underline">
          <Link href="/docs/ramp">Ramp Route</Link>
        </li>
        <li className="underline">
          <Link href="/docs/merchant">Merchant Route</Link>
        </li>
      </ul>
    </div>
  );
}

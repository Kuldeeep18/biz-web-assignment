import Link from "next/link";
import { Pup } from "@/components/illustrations/Pup";

export default function NotFound() {
  return (
    <section className="page-wrap grid min-h-[70vh] place-items-center pt-10 pb-28 text-center">
      <div className="grid justify-items-center gap-5">
        <Pup pose="sit" className="w-32" title="Teddy, looking puzzled" />
        <p className="font-scrawl text-toffee-deep">sniff, sniff… nothing here</p>
        <h1 className="font-plush text-[clamp(2.6rem,6vw,4.6rem)]">This page has wandered off</h1>
        <p className="max-w-md text-cocoa-soft">The puppy you&apos;re looking for may have already gone home. Have a look at who&apos;s available now.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/puppies" className="btn">
            See available puppies
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}

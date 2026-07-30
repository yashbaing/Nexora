import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function NotFoundView() {
  return (
    <section className="bg-noise relative isolate flex min-h-[80vh] items-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="orb top-0 left-1/3 h-96 w-[32rem] bg-mint/12" />
      </div>

      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-5 text-[clamp(3rem,9vw,6rem)] text-chalk">
          This position <span className="text-gradient-mint">doesn&apos;t exist.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-[16.5px] leading-relaxed text-ash">
          The page you were after has moved, or never existed. The markets are still open,
          though — they always are.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Back to home
            <ArrowRight size={15} />
          </Link>
          <Link href="/markets" className="btn btn-ghost">
            Browse markets
          </Link>
        </div>
      </div>
    </section>
  );
}

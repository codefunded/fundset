import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-balance lg:text-5xl">Start Building</h2>
          <p className="mt-4">
            Ship your app faster then ever before and share your modules with the world.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/docs">
                <span>Get Started</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/docs/modules">
                <span>Building modules</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

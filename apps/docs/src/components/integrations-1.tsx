import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Ethereum, Postgres } from '@/components/logos';

export default function IntegrationsSection() {
  return (
    <section>
      <div className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-balance md:text-4xl">
              Integrate with your favorite backend
            </h2>
            <p className="text-muted-foreground mt-6">
              Connect seamlessly with popular settlement layers and easily switch between them.{' '}
              <br /> More coming soon!
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <IntegrationCard
              title="Postgres"
              description="Power your app with the world's most trusted open-source database."
              link="/docs/pg"
            >
              <Postgres />
            </IntegrationCard>

            <IntegrationCard
              title="EVM"
              description="Tap into the unstoppable liquidity and composability of the Ethereum ecosystem."
              link="/docs/evm"
            >
              <Ethereum />
            </IntegrationCard>
          </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  children,
  link,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  link?: string;
}) => {
  return (
    <Card className="p-6">
      <div className="relative">
        <div className="*:size-10">{children}</div>

        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
        </div>

        <div className="flex gap-3 border-t border-dashed pt-6">
          <Button asChild variant="secondary" size="sm" className="gap-1 pr-2 shadow-none">
            <Link href={link ?? ''}>
              Learn More
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

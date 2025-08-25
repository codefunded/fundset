'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { useState, useActionState } from 'react';

const LoginWithGoogle = () => {
  const t = useTranslations('Auth');

  return (
    <Button
      type="button"
      onClick={() => authClient.signIn.social({ provider: 'google' })}
      variant="outline"
      className="w-full"
    >
      {t('login_with_google')}
    </Button>
  );
};

const SignupForm = ({ switchToLogin }: { switchToLogin: () => void }) => {
  const t = useTranslations('Auth');
  const [, formAction, isPending] = useActionState(async (_: unknown, formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const res = await authClient.signUp.email({
      name: email,
      email,
      password,
    });
    switchToLogin();
    return res;
  }, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('signup_title')}</CardTitle>
        <CardDescription>{t('signup_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('email_placeholder')}
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">{t('password')}</Label>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">{t('repeat_password')}</Label>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex flex-col gap-3">
              <Button disabled={isPending} type="submit" className="w-full">
                {t('signup')}
              </Button>
              <LoginWithGoogle />
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('already_have_account')}{' '}
            <button onClick={switchToLogin} className="underline underline-offset-4">
              {t('login_title')}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const LoginForm = ({ switchToSignup }: { switchToSignup: () => void }) => {
  const t = useTranslations('Auth');
  const [, formAction, isPending] = useActionState(async (_: unknown, formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const res = await authClient.signIn.email({
      email,
      password,
    });
    return res;
  }, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login_title')}</CardTitle>
        <CardDescription>{t('login_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            authClient.signIn.email({
              email,
              password,
            });
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('email_placeholder')}
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">{t('password')}</Label>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex flex-col gap-3">
              <Button disabled={isPending} type="submit" className="w-full">
                {t('login')}
              </Button>
              <LoginWithGoogle />
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('dont_have_account')}{' '}
            <button onClick={switchToSignup} className="underline underline-offset-4">
              {t('signup_title')}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PgAuthComponent = () => {
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('Auth');
  const [authPage, setAuthPage] = useState<'signup' | 'login'>('login');

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {session?.user ? (
        <Button variant="outline" onClick={() => authClient.signOut()}>
          {t('disconnect')}
        </Button>
      ) : (
        <div className={'flex w-sm flex-col gap-6'}>
          {authPage === 'signup' ? (
            <SignupForm switchToLogin={() => setAuthPage('login')} />
          ) : (
            <LoginForm switchToSignup={() => setAuthPage('signup')} />
          )}
        </div>
      )}
      {isPending ? (
        <div>{t('loading')}</div>
      ) : (
        <div>{session && JSON.stringify(session, null, 2)}</div>
      )}
    </div>
  );
};

export default PgAuthComponent;

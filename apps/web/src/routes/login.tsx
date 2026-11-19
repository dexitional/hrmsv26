import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { api, errorMessage } from '#/lib/api-client'
import { loginSchema } from '#/lib/schemas'
import { getSession } from '#/server/session'

// Only same-site paths, so ?next= can't be used as an open redirect.
const safeNext = (next?: string) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin')

const GOOGLE_ERRORS: Record<string, string> = {
  no_account: 'That Google account has no HRMS access. Ask an administrator to add your email.',
  account_disabled: 'Your HRMS account has been disabled.',
  google_mismatch: 'This email is linked to a different Google account.',
  google_not_configured: 'Google sign-in has not been set up yet. Use your email and password.',
  google_failed: 'Google sign-in failed. Please try again.',
  invalid_state: 'The sign-in link expired. Please try again.',
  cancelled: 'Google sign-in was cancelled.',
}

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ next: z.string().optional(), error: z.string().optional() }),
  beforeLoad: async ({ search }) => {
    if (await getSession()) throw redirect({ href: safeNext(search.next) })
  },
  head: () => ({ meta: [{ title: 'Sign in · UCC HRMS' }] }),
  component: LoginPage,
})

type Values = z.infer<typeof loginSchema>

// Bold, flat inputs with a hard offset shadow, in the UCC navy.
const BRUTAL_INPUT =
  'h-11 w-full rounded-md border-2 border-primary bg-white px-3 text-[15px] font-semibold text-foreground shadow-[4px_4px_0_var(--primary)] outline-none placeholder:font-medium placeholder:text-muted-foreground focus:border-primary-hover focus:shadow-[2px_2px_0_var(--primary)] aria-[invalid=true]:border-secondary-foreground aria-[invalid=true]:shadow-[4px_4px_0_var(--secondary-foreground)]'

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const { next, error: googleError } = Route.useSearch()
  const [devEmail, setDevEmail] = useState('')
  const config = useQuery({
    queryKey: ['auth-config'],
    queryFn: () => api.get<{ google: boolean; devLogin: boolean }>('/auth/config'),
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(loginSchema) })
  const login = useMutation({
    mutationFn: (values: Values) => api.post('/auth/login', values),
    onSuccess: () => navigate({ href: safeNext(next) }),
    onError: (err) => setError('root', { message: errorMessage(err) }),
  })
  const target = encodeURIComponent(safeNext(next))
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1.1fr_1fr]">
      <div className="hero-band relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="dot-grid absolute inset-0 opacity-50" aria-hidden="true" />
        {/* The UCC crest, large and faint, set into the gradient behind the text. */}
        <img
          src="/ucc-crest.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -right-20 h-[34rem] w-auto -translate-y-1/2 opacity-[0.13] mix-blend-luminosity select-none xl:-right-8"
        />
        <div className="relative flex items-center gap-3">
          <img src="/ucc-crest-sm.png" alt="" className="h-12 w-auto" />
          <div>
            <p className="text-[25.8px] leading-tight font-extrabold tracking-tight">University of Cape Coast</p>
            <p className="text-xs text-white/60">Directorate of Human Resource</p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <p className="font-mono text-xs tracking-widest text-secondary uppercase">HR Management System</p>
          <p className="mt-4 text-4xl leading-tight font-extrabold">
            The advance Human resource ERP for the university - in one place
          </p>
          <p className="mt-4 text-white/65">For HR officers and technical support team.</p>
        </div>
        {/* Adinkra band along the bottom edge, turned white to show on the gradient. */}
        <div aria-hidden="true" className="h-[72px]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px] bg-[url('/adinkra.png')] bg-[length:auto_72px] bg-bottom-left bg-repeat-x opacity-90 brightness-0 invert"
        />
      </div>
      <div className="flex flex-col items-center justify-center bg-primary-soft/40 px-6 py-12">
        <form
          method="post"
          onSubmit={handleSubmit((v) => login.mutate(v))}
          noValidate
          className="flex w-full max-w-sm flex-col gap-5 rounded-md border-2 border-primary bg-[color-mix(in_oklab,var(--secondary)_55%,white)] p-6 shadow-[5px_5px_0_var(--primary)]"
        >
          <div className="mb-4">
            <img src="/ucc-crest-sm.png" alt="University of Cape Coast crest" className="mb-3 h-14 w-auto" />
            <h1 className="text-xl font-black tracking-tight text-primary">UCC HR Management System</h1>
            <p className="text-base font-semibold text-muted-foreground">Sign in to continue</p>
          </div>
          {googleError && (
            <p
              role="alert"
              className="rounded-md border-2 border-primary bg-white px-3 py-2 text-sm font-semibold text-secondary-foreground"
            >
              {GOOGLE_ERRORS[googleError] ?? 'Sign-in failed. Please try again.'}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="Email address"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={BRUTAL_INPUT}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs font-semibold text-secondary-foreground">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={BRUTAL_INPUT}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-xs font-semibold text-secondary-foreground">
                {errors.password.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p
              role="alert"
              className="rounded-md border-2 border-primary bg-white px-3 py-2 text-sm font-semibold text-secondary-foreground"
            >
              {errors.root.message}
            </p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="mx-auto mt-6 inline-flex h-11 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-primary bg-primary px-5 text-base font-bold text-primary-foreground shadow-[4px_4px_0_var(--foreground)] transition-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {login.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="size-4" />
              </>
            )}
          </button>
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-primary/60 uppercase">
            <span className="h-0.5 flex-1 bg-primary/20" /> or <span className="h-0.5 flex-1 bg-primary/20" />
          </div>
          <a
            href={`/api/auth/google?next=${target}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-md border-2 border-primary bg-white px-4 text-[15px] font-bold text-primary shadow-[4px_4px_0_var(--primary)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <GoogleMark /> Continue with Google
          </a>
          {config.data?.devLogin && (
            <div className="rounded-md border-2 border-dashed border-primary/40 bg-white/70 p-3">
              <p className="mb-2 text-[11px] font-bold tracking-wider text-primary/70 uppercase">
                Development sign-in (stands in for Google)
              </p>
              <div className="flex gap-2">
                <input
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  placeholder="account email"
                  className="h-9 min-w-0 flex-1 rounded-md border-2 border-primary/40 bg-white px-2 text-sm"
                />
                <a
                  href={`/api/auth/dev?email=${encodeURIComponent(devEmail)}&next=${target}`}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-bold text-white"
                >
                  Go
                </a>
              </div>
            </div>
          )}
          <p className="mb-4 w-full text-center text-xs font-medium text-muted-foreground">Powered by MIS-DICTS</p>
        </form>
        <p className="mt-8 text-xs font-medium text-muted-foreground">All rights reserved, UCC-DHR &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

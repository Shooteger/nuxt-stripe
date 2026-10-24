import { describe, expectTypeOf, it } from 'vitest'
import type Stripe from 'stripe'
import type { Stripe as ClientStripe } from '@stripe/stripe-js'
// Resolved through package.json "exports" → dist/types.d.mts (the file consumers get)
import type { ServerStripe, Stripe as ReexportedClientStripe } from '@shooteger/nuxt-stripe'
import type { ServerStripe as SourceServerStripe } from '../../src/types'

describe('type exports', () => {
  it('ServerStripe from the built package is the Stripe server class, not any', () => {
    expectTypeOf<ServerStripe>().not.toBeAny()
    expectTypeOf<ServerStripe>().toEqualTypeOf<Stripe>()
  })

  it('ServerStripe from source is the Stripe server class', () => {
    expectTypeOf<SourceServerStripe>().not.toBeAny()
    expectTypeOf<SourceServerStripe>().toEqualTypeOf<Stripe>()
  })

  it('re-exports the client Stripe type', () => {
    expectTypeOf<ReexportedClientStripe>().not.toBeAny()
    expectTypeOf<ReexportedClientStripe>().toEqualTypeOf<ClientStripe>()
  })
})

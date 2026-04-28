import { loadStripe } from "@stripe/stripe-js"

// Singleton — do not instantiate inside a component
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
)

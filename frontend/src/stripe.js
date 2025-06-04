// src/stripe.js
import { loadStripe } from "@stripe/stripe-js";

// Замените строку на ваш реальный публичный ключ из Stripe Dashboard
const stripePromise = loadStripe("pk_test_51RVCOW4Zhmozro8jLHjnn8vZWNNR9rFx9dOQmKmDIT4Y9MycoSbNzWo8NCR6Q2raN1dvYkT6jmerYfQdHHfHSBog00yy3juPWW");

export default stripePromise;

import { STRIPE_SECRET_KEY, PORT } from "../config/index.js";
import Stripe from "stripe";
const stripe = Stripe(STRIPE_SECRET_KEY);

export const checkout = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log(STRIPE_SECRET_KEY);
    //const {eventId } = req.body;

    // Log the eventId
    //console.log("Event ID:", eventId);
    console.log("Inside checkout backend:", req.body.items);
    console.log("Eventid", req.body.eventId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        return {
          price_data: {
            currency: "pkr",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),

      // success_url: `/payment/success?eventId=${req.body.eventId}`,
      // cancel_url: "http://localhost:5173/payment/cancel",
      success_url: `https://eventhubfrontend.vercel.app/payment/success?eventId=${req.body.eventId}`,
      cancel_url: "https://eventhubfrontend.vercel.app/payment/cancel",
    });
    console.log("Eventid", req.body.eventId);

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

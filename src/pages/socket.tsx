import io from "socket.io-client";
import { number, string } from "zod";


type priceHandler = (price: number) => void;
type priceContainer = Map<string, number>;

type SubscriptionCallbacks = Map<string, priceHandler>

type FinnhubMessage = {
  type: "ping" | "trade",
  data?: {s: string, p: number}[]
}

type subscribable = {
  subscribe: (cb: priceHandler, stock: string) => void,
  dispatch: (message: FinnhubMessage) => void
}

const createSubscribable:(() => subscribable) = () => {
  const subscription: SubscriptionCallbacks = new Map();
  const payload: priceContainer = new Map();

  return {
    subscribe: (cb, symbol) => {
      subscription.set(symbol, cb);
    },

    dispatch: (message) => {
      message.data?.forEach((tradeInstance) => {
        payload.set(tradeInstance.s, tradeInstance.p);
      })
      for (const [key, cb] of subscription) {
        const price = payload.get(key);
        if (price !== undefined) {
          cb(price);
        }
      }
    }
  }
}

export const socketSubscription = createSubscribable();
export const socket = io();
socket.on("message", (message: {data?: [], type:string}) => {
  console.log(message);
});

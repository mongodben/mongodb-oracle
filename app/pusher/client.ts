import Pusher from "pusher-js";

// Enable pusher logging - don't include this in production
Pusher.logToConsole = false;

const PUSHER_APP_KEY = process.env.PUSHER_APP_KEY;
if (!PUSHER_APP_KEY) {
  throw new Error(
    `throw new Error('Invalid/Missing environment variable: "PUSHER_APP_KEY"');`
  );
}

export const pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: "us2",
});

import Pusher from "pusher";

const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
if(!PUSHER_APP_ID) {
  throw new Error(`throw new Error('Invalid/Missing environment variable: "PUSHER_APP_ID"');`)
}
const PUSHER_APP_KEY = process.env.PUSHER_APP_KEY;
if(!PUSHER_APP_KEY) {
  throw new Error(`throw new Error('Invalid/Missing environment variable: "PUSHER_APP_KEY"');`)
}
const PUSHER_APP_SECRET = process.env.PUSHER_APP_SECRET;
if(!PUSHER_APP_SECRET) {
  throw new Error(`throw new Error('Invalid/Missing environment variable: "PUSHER_APP_SECRET"');`)
}

const pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_APP_KEY,
  secret: PUSHER_APP_SECRET,
  cluster: "us2",
  useTLS: true,
});

export type PusherAnswerEvent = {
  message_id: string;
  text: string;
};

export async function streamAnswer(event: {
  conversation_id: string;
  message_id: string;
  text: string;
}) {
  return await pusher.trigger(event.conversation_id, "answer", {
    message_id: event.message_id,
    text: event.text,
  });
}

import Pusher from "pusher";

const USE_STREAMING =
  process.env.NEXT_PUBLIC_USE_STREAMING === "true" ? true : false;

const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
if(!PUSHER_APP_ID && USE_STREAMING) {
  throw new Error(`throw new Error('Invalid/Missing environment variable: "PUSHER_APP_ID"');`)
}
const PUSHER_APP_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
if(!PUSHER_APP_KEY && USE_STREAMING) {
  throw new Error(`throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_PUSHER_APP_KEY"');`)
}
const PUSHER_APP_SECRET = process.env.PUSHER_APP_SECRET;
if(!PUSHER_APP_SECRET && USE_STREAMING) {
  throw new Error(`throw new Error('Invalid/Missing environment variable: "PUSHER_APP_SECRET"');`)
}

function createPusher() {
  return new Pusher({
    appId: PUSHER_APP_ID!,
    key: PUSHER_APP_KEY!,
    secret: PUSHER_APP_SECRET!,
    cluster: "us2",
    useTLS: true,
  });
}


export type PusherAnswerEvent = {
  message_id: string;
  text: string;
};

export async function streamAnswer(event: {
  conversation_id: string;
  message_id: string;
  text: string;
}) {
  const pusher = createPusher();
  return await pusher.trigger(event.conversation_id, "answer", {
    message_id: event.message_id,
    text: event.text,
  });
}

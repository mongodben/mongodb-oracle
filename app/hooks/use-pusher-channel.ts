import React from "react";
import { pusher } from "@/pusher/client";

type UsePusherChannelProps<E> = {
  channelName: string | undefined;
  eventName: string;
  onEvent: (event: E) => void;
};

export default function usePusherChannel<E>({ channelName, eventName, onEvent }: UsePusherChannelProps<E>) {
  const onEventRef = React.useRef(onEvent);
  React.useEffect(() => {
    if (channelName) {
      const eventHandler = (event: E) => {
        onEventRef.current(event);
      }
      const channel = pusher.subscribe(channelName);
      channel.bind(eventName, eventHandler);
      return () => {
        channel.unbind();
        channel.unsubscribe();
        channel.disconnect();
        pusher.unsubscribe(channelName);
        pusher.unbind();
      };
    }
  }, [channelName]);
}

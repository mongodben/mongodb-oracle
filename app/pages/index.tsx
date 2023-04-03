import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

import Head from "next/head";
import Image from "next/image";

import { CONTAINER } from "@/styles/constants";

import useMongoDBOracle from "@/hooks/use-mongodb-oracle";

import { H2, Body } from "@leafygreen-ui/typography";
import Toggle from "@leafygreen-ui/toggle";
import { PusherAnswerEvent } from "@/pusher/server";
import usePusherChannel from "@/hooks/use-pusher-channel";
import Footer from "@/components/footer";
import Message from "@/components/message";
import Loader from "@/components/loader";
import { useCallback } from "react";
import { appName } from "@/appConfig";

export default function Home() {
  const {
    messages,
    status,
    conversation_id,
    addAnswerToMessages,
    updateMessageAtIndex,
    getMessageIndex,
  } = useMongoDBOracle((state) => ({
    messages: state.messages,
    status: state.status,
    conversation_id: state.conversation_id,
    addAnswerToMessages: state.addAnswerToMessages,
    updateMessageAtIndex: state.updateMessageAtIndex,
    getMessageIndex: state.getMessageIndex,
  }));
  const [withLlm, setWithLlm] = useState(false);

  const onAnswerEvent = useCallback(
    ({ message_id, text }: PusherAnswerEvent) => {
      let message_index = getMessageIndex(message_id);
      if (message_index === -1) {
        message_index = addAnswerToMessages(message_id, text);
      }
      updateMessageAtIndex(message_index, (message) => ({
        ...message,
        children: text,
      }));
    },
    [getMessageIndex, addAnswerToMessages, updateMessageAtIndex]
  );

  usePusherChannel({
    channelName: conversation_id,
    eventName: "answer",
    onEvent: onAnswerEvent,
  });

  const messageWrapperRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    if (!messageWrapperRef.current) return;
    messageWrapperRef.current.scrollTop =
      messageWrapperRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    switch (status) {
      case "loading":
        controls.start({ y: 7, x: 0 });
        break;
      default:
        controls.stop();
        break;
    }
  }, [status, controls]);

  return (
    <>
      <Head>
        <title>{appName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo/logo-only.png" />
      </Head>
      <main className="flex flex-col h-screen pt-4">
        <header className={`${CONTAINER} flex-row`}>
          <h1 className="text-center text-2xl">{appName} </h1>
          <div className="flex items-center justify-center pt-2">
            <Body className="pr-3">LLM Summarization</Body>

            <Toggle
              aria-labelledby="with-lmm"
              checked={withLlm}
              onClick={() => {
                setWithLlm(!withLlm);
              }}
              size="small"
            />
          </div>

          {/* COMMENTING OUT FOR DEMO 😢 */}
          {/* <div className="w-[400px] absolute left-8 top-8">
            <Image
              src="/logo/logo-long-cropped.png"
              height={110}
              width={600}
              alt="${appName} Logo"
            />
          </div>
          <div className="relative flex items-center justify-center animate-[floating_6s_cubic-bezier(.76,0,.24,1)_infinite] select-none">
            <div className="relative">
              <div className="text-[140px]">🧙</div>
              <div className="absolute bottom-0 text-[70px] w-full text-center">
                🔮
              </div>
              <div className="absolute bottom-0 text-[40px] right-[20px] top-[125px] rotate-[20deg] w-full text-center">
                <motion.div
                  animate={controls}
                  initial={{ y: -7, x: -6 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  🫱
                </motion.div>
              </div>
              <div className="absolute bottom-0 text-[40px] left-[20px] top-[125px] rotate-[-20deg] w-full text-center">
                <motion.div
                  initial={{ y: -7, x: -6 }}
                  animate={controls}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  🫲
                </motion.div>
              </div>
            </div>
          </div>
          {status === "first-load" && (
            <div>
              <H2 className="text-[20px] md:text-[32px]" as="h1">
                Hey there, I&apos;m the Oracle!
              </H2>
              <Body className="text-[16px] mt-2">
                I&apos;ve spent eons poring over the MongoDB documentation. Ask
                me how to do anything in MongoDB or Atlas - I&apos;ll do my best
                to help you on your quest.
              </Body>
            </div>
          )} */}
        </header>

        <hr className="px-4 max-w-[320px] border-2 mx-auto w-full rounded border-lg-green-dark2 my-4" />

        <div
          ref={messageWrapperRef}
          className={`${CONTAINER} flex-grow overflow-y-scroll py-4 bg-lg-gray-dark1/5 rounded-lg`}
        >
          {messages.length > 0 && (
            <ul className="flex-grow space-y-2 flex flex-col overflow-hidden">
              {messages.map(({ id, type, children, level }) => (
                <Message key={id} type={type} level={level}>
                  {children}
                </Message>
              ))}
            </ul>
          )}

          {status === "loading" && (
            <div
              style={{ animationDelay: "300ms" }}
              className="ml-2 mr-auto fade-in"
            >
              <Loader />
            </div>
          )}
        </div>
        <Footer withLlm={withLlm} />
      </main>
    </>
  );
}

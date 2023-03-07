import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";

import { CONTAINER } from "@/styles/constants";

import useMongoDBOracle from "@/hooks/use-mongodb-oracle";

import { H2, Body } from "@leafygreen-ui/typography";

import Oracle from "@/components/oracle";
import Footer from "@/components/footer";
import Message from "@/components/message";
import Loader from "@/components/loader";

export default function Home() {
  const messages = useMongoDBOracle((state) => state.messages);
  const status = useMongoDBOracle((state) => state.status);

  return (
    <>
      <Head>
        <title>MongoDB Oracle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo/logo-only.png" />
      </Head>
      <main className="flex flex-col h-screen pt-4">
        <header className={`${CONTAINER} flex-row`}>
          <div className="md:relative top-6 pb-10">
            <Image
              src="/logo/logo-long-cropped.png"
              height={110}
              width={600}
              alt="MongoDB Oracle Logo"
            />
          </div>

          <div className="flex items-center gap-4">
            <Oracle />
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
          </div>
        </header>

        <hr className="px-4 max-w-[320px] border-2 mx-auto w-full rounded border-lg-green-dark2 my-4" />

        <div className={`${CONTAINER} flex-grow overflow-y-scroll h-[500px]`}>
          {messages.length > 0 && (
            <ul className="flex-grow space-y-2 flex flex-col overflow-hidden">
              {messages.map(({ id, type, children }) => (
                <Message key={id} type={type}>
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
        <Footer />
      </main>
    </>
  );
}

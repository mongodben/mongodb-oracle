import Head from "next/head";
import Footer from "@/components/footer";
import Message from "@/components/message";
import { CONTAINER } from "@/styles/constants";
import Logo from "@leafygreen-ui/logo";
import useMongoDBOracle from "@/hooks/use-mongodb-oracle";
import Intro from "@/components/intro";
import Oracle from "@/components/oracle";
import { H2, Body } from "@leafygreen-ui/typography";

export default function Home() {
  const messages = useMongoDBOracle((state) => state.messages);

  return (
    <>
      <Head>
        <title>MongoDB Oracle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col min-h-screen pt-4">
        <header className={`${CONTAINER}`}>
          <Logo
            className="md:absolute top-6 left-6"
            height={40}
            name="MongoDBLogo"
          />
        </header>
        <div className={`${CONTAINER} flex-grow`}>
          <div className="flex items-center gap-4">
            <Oracle />
            <div>
              <H2 className="text-[20px] md:text-[32px]" as="h1">
                Hey there! I'm the Oracle!
              </H2>
              <Body className="text-[16px] mt-2">
                I'm a MongoDB Atlas Wizard. I've spent eons pouring over the
                documentation. Ask me how to do anything in Atlas - I'll do my
                best to help you on your quest.
              </Body>
            </div>
          </div>
          {messages.length > 0 && (
            <ul className="flex-grow space-y-2 flex flex-col mt-8">
              {messages.map(({ id, type, children }) => (
                <Message key={id} type={type}>
                  {children}
                </Message>
              ))}
            </ul>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}

import Head from "next/head";
import Footer from "@/components/footer";
import Message from "@/components/message";
import { CONTAINER } from "@/styles/constants";
import Logo from "@leafygreen-ui/logo";
import useMongoDBOracle from "@/hooks/use-mongodb-oracle";
import Intro from "@/components/intro";

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
          {messages.length === 0 && <Intro />}
          {messages.length > 0 && (
            <ul className="flex-grow space-y-2 flex flex-col">
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

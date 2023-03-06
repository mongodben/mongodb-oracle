import Head from "next/head";
import Footer from "@/components/footer";
import Message from "@/components/message";
import { CONTAINER } from "@/styles/constants";
import Logo from "@leafygreen-ui/logo";
import useMongoDBOracle from "@/hooks/use-mongodb-oracle";

export default function Home() {
  const messages = useMongoDBOracle((state) => state.messages);

  return (
    <>
      <Head>
        <title>MongoDB Oracle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col min-h-screen">
        <header>
          <Logo
            className="absolute top-6 left-6"
            height={40}
            name="MongoDBLogo"
          />
        </header>
        <ul className={`${CONTAINER} flex-grow space-y-2 flex flex-col`}>
          {messages.map(({ id, type, children }) => (
            <Message key={id} type={type}>
              {children}
            </Message>
          ))}
        </ul>
        <Footer />
      </main>
    </>
  );
}

import Head from "next/head";
import Footer from "@/components/footer";
import { CONTAINER } from "@/constants/styles";
import Logo from "@leafygreen-ui/logo";

export default function Home() {
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
        <div className={`${CONTAINER} flex-grow`}></div>
        <Footer
          onSubmit={() => {
            console.log("Hello world!");
          }}
        />
      </main>
    </>
  );
}

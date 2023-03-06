import Head from "next/head";
import { Body } from "@leafygreen-ui/typography";
import Footer from "@/components/footer";
import { CONTAINER } from "@/constants/styles";

export default function Home() {
  return (
    <>
      <Head>
        <title>MongoDB Oracle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col min-h-screen">
        <header className="h-10 bg-red-500">Header</header>
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

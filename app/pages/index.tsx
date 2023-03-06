import Head from "next/head";
import { Body } from "@leafygreen-ui/typography";

export default function Home() {
  return (
    <>
      <Head>
        <title>MongoDB Oracle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Body>Hello world!</Body>
      </main>
    </>
  );
}

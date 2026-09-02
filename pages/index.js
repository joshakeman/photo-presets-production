import * as React from "react";
import Image from "next/image";
import Planets from "../components/planets";
import Harp from "../components/harp";
import Layout from "../components/layout";
import curl from "../public/images/curl.png";
import Collections from "../components/collections-section";
import "react-before-after-slider-component/dist/build.css";
import Head from "next/head";
import Hero from "../components/hero";

const IndexPage = () => {
  return (
    <>
      <Head>
        <title>Photo Presets Store | Vintage-Inspired Collections</title>
        <meta
          name="description"
          content="Browse vintage-inspired photo presets featuring classic literature themes like Austen, Poe, and Dickens."
        />
      </Head>

      <Layout
        backgroundColor={"bg-backgroundBlueFaded"}
        backgroundImage={"bg-victorianPattern"}
      >
        <Hero />

        <Collections />
      </Layout>
    </>
  );
};

export default IndexPage;

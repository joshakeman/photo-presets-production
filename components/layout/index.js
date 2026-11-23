import React from "react";
import Menu from "../menu";

export default function Layout({ backgroundColor, backgroundImage, children }) {
  return (
    <div
      className={`${backgroundColor} ${backgroundImage} flex h-full min-h-screen flex-col bg-auto bg-repeat bg-blend-soft-light px-4 pt-6 sm:px-8 lg:px-12`}
    >
      <Menu />
      {children}
    </div>
  );
}

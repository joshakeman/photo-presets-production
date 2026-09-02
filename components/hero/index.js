import React from "react";
import Image from "next/image";
import Planets from "../planets";
import ExamplePresets from "../example-presets";
import Harp from "../harp";
import curl from "../../public/images/curl.png";

export default function Hero() {
  return (
    <>
      <Planets />
      <div className="mx-auto w-full max-w-6xl">
        {/* Decorative images: aria-hidden="true" for screen readers */}
        <div className="flex justify-center items-center p-4">
          <div className="px-3.5">
            <h2 className="french-news text-center text-xl leading-loose">
              Instantly{" "}
              <span className="text-accent italic">Transmogriphy</span> Your
              Photographs with
            </h2>
            <p className="french-news text-center text-xl">
              <span className="text-accent">MACHINE-AGE WIZARDRY!</span> As if
              from Outer Space!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 px-4 md:grid-cols-[2fr_3fr]">
          <div className="order-2 md:order-1">
            <Harp />
          </div>
          <div className="order-1 md:order-2">
            <ExamplePresets />
          </div>
        </div>
        {/* More descriptive heading */}
        <h2
          id="stunning-text"
          className="french-news text-2xl text-center menu-text mt-4 mb-8"
          aria-labelledby="stunning-text"
        >
          Examine our gallery of transformations below!
        </h2>
      </div>
    </>
  );
}

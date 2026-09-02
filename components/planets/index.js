import React from "react";
import starsLeft from "../../public/images/hero-image/stars-left.png";
import starsRight from "../../public/images/hero-image/stars-right.png";
import logo from "../../public/images/hero-image/logo-no-background.png";
import BlurredImage from "../blurred-image";

export default function Planets() {
  return (
    <section
      className="flex min-w-fit mt-4 mb-4 items-center"
      aria-labelledby="hero-heading"
    >
      <h1 id="hero-heading" className="sr-only">
        Welcome to Photo Presets
      </h1>

      <div className="relative z-0 -mr-6 translate-y-1/2 flex-1 sm:-mr-8 lg:-mr-10">
        <BlurredImage
          src={starsLeft}
          alt=""
          width={400}
          height={400}
          priority
        />
      </div>

      <div className="relative z-10 w-[38%] flex-none">
        <BlurredImage
          src={logo}
          alt="Site Logo, which looks like a ringed planet with the words Photo Presets"
          width={400}
          height={400}
          priority
        />
      </div>

      <div className="relative z-0 -ml-6 translate-y-1/2 flex-1 sm:-ml-8 lg:-ml-10">
        <BlurredImage
          src={starsRight}
          alt=""
          width={400}
          height={400}
          priority
        />
      </div>
    </section>
  );
}

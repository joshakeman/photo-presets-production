import React from "react";
import Image from "next/image";
import harp from "../../public/images/assets/current-mobile.webp";
import BlurredImage from "../blurred-image";

export default function Harp() {
  return (
    <div className="flex items-center justify-center">
      {/* <Image className="grow" src={harp} alt="" role="presentation" priority /> */}
      <BlurredImage
        className="h-auto w-full max-w-md"
        src={harp}
        alt=""
        role="presentation"
        priority
      />
    </div>
  );
}

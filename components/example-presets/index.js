import React from "react";
import Image from "next/image";
import DupinExample from "../../public/images/assets/dupin-example.webp";
import HaveshamExample from "../../public/images/assets/havesham-example.webp";
import HighburyExample from "../../public/images/assets/highbury-example.webp";

export default function ExamplePresets() {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <Image
        className="h-auto w-full"
        src={DupinExample}
        alt="Dupin Example"
        placeholder="blur"
      />
      <Image
        className="h-auto w-full"
        src={HaveshamExample}
        alt="Havesham Example"
        placeholder="blur"
      />
      <Image
        className="h-auto w-full"
        src={HighburyExample}
        alt="Highbury Example"
        placeholder="blur"
      />
    </div>
  );
}

import React from "react";
import MenuButton from "../../public/images/assets/menu.webp";
import Portmanteau from "../../public/images/assets/portmanteau.webp";
import Image from "next/image";

export default function Menu() {
  return (
    <nav
      className="relative z-20 -mb-20 flex w-full items-center justify-between sm:-mb-24 lg:-mb-28"
      role="navigation"
      aria-label="Main menu"
    >
      <Image
        className="h-auto w-[20%] max-w-56"
        src={MenuButton}
        alt="Menu"
        priority
      />
      <Image
        className="h-auto w-[15%] max-w-44"
        src={Portmanteau}
        alt="Portmanteau"
        priority
      />
    </nav>
  );
}

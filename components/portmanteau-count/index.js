import Image from "next/image";
import Portmanteau from "../../public/images/assets/portmanteau.webp";

export default function PortmanteauCount({ count, priority = false, className = "" }) {
  return (
    <span className={`relative block ${className}`}>
      <Image
        src={Portmanteau}
        alt=""
        className="h-auto w-full"
        priority={priority}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1889"
        aria-hidden="true"
      >
        <text
          x="800"
          y="1275"
          textAnchor="middle"
          dominantBaseline="middle"
          className="french-news fill-black"
          fontSize="300"
        >
          {count}
        </text>
      </svg>
    </span>
  );
}

import Link from "next/link";
import { useAuth } from "../../context/authContext";

const buttonClasses =
  "bg-black border-2 border-accent py-2 px-6 w-[30%] sm:w-[50%] md:w-[45%] lg:w-[40%] bourbonbase text-base md:text-xl lg:text-2xl text-accent text-center letterpress-button focus:ring-2 focus:ring-offset-2 whitespace-nowrap";

export default function Auth() {
  const { user, authReady, logout } = useAuth();

  if (!authReady) {
    return (
      <span className={`${buttonClasses} opacity-60`} aria-hidden="true">
        LOGIN
      </span>
    );
  }

  return user ? (
    <button className={buttonClasses} onClick={logout} type="button">
      LOGOUT
    </button>
  ) : (
    <Link className={buttonClasses} href="/account">
      LOGIN
    </Link>
  );
}

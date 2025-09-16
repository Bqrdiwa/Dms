import { Image } from "@heroui/react";
import BaseAuth from "./BaseAuth";
import LoginPageHero from "../../assets/login-hero.jpg";

export default function AuthPage() {
  return (
    <div className="flex w-full h-screen">
      <div className="flex items-center justify-center flex-1">
        <BaseAuth />
      </div>
      <Image classNames={{ wrapper: "w-1/2 h-full rounded-none", img:"rounded-none h-full object-cover" }} src={LoginPageHero} />
    </div>
  );
}

import { Image } from "@heroui/react";
import { motion } from "framer-motion";
import Logo from "../../public/logo.png";

export default function LoadingLayout() {
  return (
    <motion.div
      exit={{ opacity: 0, scale: 0 }}
      className="w-screen h-screen flex items-center justify-center"
    >
      <div className="gap-2 flex z-10 items-center flex-col backdrop-saturate-200 bg-foreground/5 border-3 border-divider p-10 text-center h-fit w-fit">
        <Image src={Logo} />
        <h1 className="font-bold border-b-3 text-2xl text-default-900 uppercase">
          bandar imam petrochemical company
        </h1>
        <h2 className="font-semibold text-xl text-default-800">
          DOCUMENT MANAGEMENT SYSTEM
        </h2>
      </div>
    </motion.div>
  );
}

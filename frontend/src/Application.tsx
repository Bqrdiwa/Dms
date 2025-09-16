import { Outlet } from "react-router-dom";

import { useTheme } from "./hooks/useTheme";
import { motion } from "framer-motion";
import { AnimatedGridPattern } from "./layouts/DarkVeil";

const App = () => {
  useTheme();
  return (
    <div className="h-screen relative">
      <motion.div>
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
        />
      </motion.div>
      <div className="fixed h-screen w-full top-0 left-0">
        <Outlet />
      </div>
    </div>
  );
};

export default App;

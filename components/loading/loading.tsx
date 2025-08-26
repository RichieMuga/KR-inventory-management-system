import { motion } from "framer-motion";

export default function Loading() {
  const colors = ["bg-kr-orange", "bg-kr-yellow", "bg-kr-maroon"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex gap-3">
        {colors.map((color, i) => (
          <motion.span
            key={i}
            className={`h-5 w-5 rounded-full ${color}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

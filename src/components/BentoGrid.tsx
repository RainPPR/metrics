import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-12",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export const BentoCard = ({
  children,
  className,
  title,
  description,
  icon,
}: BentoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-gray-100 p-6 transition-all duration-300 hover:border-pink-100 hover:shadow-2xl hover:shadow-pink-100/20",
        className
      )}
    >
      {icon && <div className="mb-4 text-slate-400 group-hover:text-pink-400 transition-colors duration-300">{icon}</div>}
      <div className="z-10 flex flex-col gap-1">
        {title && <h3 className="text-xl font-bold tracking-tight text-slate-900 font-mono">{title}</h3>}
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="mt-4 flex-1">{children}</div>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:bg-gradient-to-br from-pink-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100" />
    </div>
  );
};

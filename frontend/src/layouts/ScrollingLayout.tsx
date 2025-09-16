import type { ReactNode } from "react";

export default function ScrollingLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 flex-1 overflow-y-auto">{children}</div>;
}

import { Navigation } from "@/components/navigation";
import { Providers } from "../Providers";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navigation />
      <main>{children}</main>
    </Providers>
  );
}

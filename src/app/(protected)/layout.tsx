import { Navigation } from "@/components/layoutComponents/navigation";
import { Providers } from "../Providers";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navigation />
      <main>{children}</main>
    </Providers>
  );
}

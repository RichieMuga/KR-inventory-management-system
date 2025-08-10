import StoreProvider from "@/lib/StoreProvider";
import "@/app/globals.css"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreProvider>{children}</StoreProvider>
    </>
  );
}

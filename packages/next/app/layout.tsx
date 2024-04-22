import { RootNavigation } from "../components/RootNavigation";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          overscrollBehaviorY: "none",
          overscrollBehaviorX: "none",
        }}
      >
        <Providers>
          <RootNavigation>{children}</RootNavigation>
        </Providers>
      </body>
    </html>
  );
}

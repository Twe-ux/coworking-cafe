import "@/assets/site/font/bootstrap-font/bootstrap-icons.min.css";
import "@/assets/site/font/font-awsome/css-js/all.min.css";
import "@/assets/site/scss/main.scss";
import { ReduxProvider } from "../components/providers/ReduxProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}

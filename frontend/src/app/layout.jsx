export const metadata = {
  title: "InternHub",
  description: "InternHub app",
};

import ThemeRegistry from "../lib/themeRegistry";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

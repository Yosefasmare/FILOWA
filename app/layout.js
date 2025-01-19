import "./globals.css";


export const metadata = {
  title: "FILOWA",
  description: "Find Lost wallet and withdraw it",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body  className="bg-gray-950">
        {children}
      </body>
    </html>
  );
}

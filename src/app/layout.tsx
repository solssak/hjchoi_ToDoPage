import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="items-center min-h-screen gap-16 p-8 pb-20 justify-items-center bg-blue-50">
          {children}
        </div>
      </body>
    </html>
  );
}

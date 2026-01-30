export default function MarmosetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}

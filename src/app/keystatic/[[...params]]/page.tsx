import KeystaticPage from './KeystaticPage';

export default async function Page({ params }: { params: Promise<{ params?: string[] }> }) {
  const resolvedParams = await params;
  return <KeystaticPage params={resolvedParams} />;
}

export function generateStaticParams() {
  return [{ params: [] }];
}

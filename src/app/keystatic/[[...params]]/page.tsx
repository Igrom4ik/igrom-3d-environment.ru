import KeystaticPage from './KeystaticPage';

export default function Page() {
  return <KeystaticPage />;
}

export function generateStaticParams() {
  return [{ params: [] }];
}

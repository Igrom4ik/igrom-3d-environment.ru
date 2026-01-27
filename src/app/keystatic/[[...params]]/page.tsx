import KeystaticWrapper from "./KeystaticWrapper";

export default function Page() {
  return <KeystaticWrapper />;
}

export function generateStaticParams() {
  return [{ params: [] }];
}

import { getSecrets } from '@/utils/secrets';
import SecretsManager from './SecretsManager';

// export const dynamic = 'force-dynamic';

export default async function SecretsPage() {
  const secrets = getSecrets();
  
  return <SecretsManager initialSecrets={secrets} />;
}

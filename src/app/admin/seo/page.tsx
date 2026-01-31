import { getSiteSettings } from '@/utils/siteSettings';
import SeoManager from './SeoManager';

// export const dynamic = 'force-dynamic';

export default async function SeoPage() {
  const settings = getSiteSettings();
  
  return <SeoManager initialSettings={settings} />;
}

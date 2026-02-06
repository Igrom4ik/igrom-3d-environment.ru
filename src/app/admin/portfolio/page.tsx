import { getAlbums } from '@/utils/reader';
import PortfolioManager from './PortfolioManager';

export const dynamic = 'force-dynamic';

export default async function PortfolioAdminPage() {
    console.log('[PortfolioAdminPage] Fetching albums...');
    const rawAlbums = await getAlbums();
    console.log(`[PortfolioAdminPage] Found ${rawAlbums.length} albums`);
    
    // Sanitize albums for Client Component (remove functions)
    // IMPORTANT: Include priority and hidden fields!
    const albums = rawAlbums.map((album: any) => ({
        slug: album.slug,
        entry: {
            title: album.entry.title,
            publishing: album.entry.publishing || {},
            categorization: album.entry.categorization || {},
            priority: album.entry.priority || 0,
            hidden: album.entry.hidden || false
        }
    }));

    return <PortfolioManager initialAlbums={albums} />;
}

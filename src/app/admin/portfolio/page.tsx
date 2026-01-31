import { getAlbums } from '@/utils/reader';
import PortfolioManager from './PortfolioManager';

export const dynamic = 'force-dynamic';

export default async function PortfolioAdminPage() {
    const rawAlbums = await getAlbums();
    
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

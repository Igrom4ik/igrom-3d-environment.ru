import { NextResponse } from 'next/server';
import { ContentService } from '../../../../core/content/ContentService';

export async function POST(request: Request) {
    try {
        const { slugs } = await request.json() as { slugs: string[] };
        
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return NextResponse.json({ projects: [] });
        }

        const allProjectsData = await ContentService.getAllProjects();
        const projectMap = new Map(allProjectsData.map((p) => [p.slug, p.entry]));
        
        const projects = slugs
            .map(slug => {
                const project = projectMap.get(slug);
                if (!project) return null;
                
                let image = '';
                if (typeof project.cover === 'string') {
                    image = project.cover;
                } else if (project.cover && typeof project.cover === 'object') {
                    image = project.cover.src || '';
                }

                return {
                    title: project.title,
                    image,
                    slug: slug
                };
            })
            .filter(Boolean);

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

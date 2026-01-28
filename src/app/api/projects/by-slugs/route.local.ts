import { NextResponse } from 'next/server';
import { getPosts } from '@/utils/utils';
import type { Metadata } from '@/types';

export async function POST(request: Request) {
    try {
        const { slugs } = await request.json() as { slugs: string[] };
        
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return NextResponse.json({ projects: [] });
        }

        const allProjects = getPosts(["src", "app", "(site)", "work", "projects"]);
        const projectMap = new Map(allProjects.map((p) => [p.slug, p]));
        
        const projects = slugs
            .map(slug => projectMap.get(slug))
            .filter(Boolean)
            .map((p) => {
                if (!p) return null;
                return {
                    title: p.metadata.title,
                    image: p.metadata.cover || p.metadata.image || (p.metadata.images?.[0] || ''),
                    slug: p.slug
                };
            })
            .filter(Boolean);

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

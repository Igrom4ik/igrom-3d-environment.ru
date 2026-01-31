import { NextRequest, NextResponse } from 'next/server';
import { getGitStatus, deployToGit, triggerVercelDeploy } from '../../../admin/deploy/logic';

export const dynamic = 'force-static';

export async function GET() {
  const result = await getGitStatus();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const { action, message } = await req.json();
    
    if (action === 'git') {
      const result = await deployToGit(message);
      return NextResponse.json(result);
    }
    
    if (action === 'vercel') {
      const result = await triggerVercelDeploy();
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

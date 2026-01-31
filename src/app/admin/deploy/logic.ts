// Logic for deployment actions (used by API route)

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getGitStatus() {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    return { success: true, status: stdout };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deployToGit(message: string) {
  try {
    if (!message) throw new Error('Commit message is required');
    
    // Add all changes
    await execAsync('git add .');
    
    // Commit
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    
    // Push
    await execAsync('git push');
    
    return { success: true, message: 'Successfully pushed to Git!' };
  } catch (error: any) {
    console.error('Git deploy error:', error);
    return { success: false, error: error.message || 'Failed to deploy to Git' };
  }
}

export async function triggerVercelDeploy() {
  const deployHook = process.env.VERCEL_DEPLOY_HOOK;
  
  if (!deployHook) {
    return { success: false, error: 'VERCEL_DEPLOY_HOOK environment variable is not set' };
  }

  try {
    const response = await fetch(deployHook, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to trigger Vercel hook');
    return { success: true, message: 'Vercel deployment triggered!' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

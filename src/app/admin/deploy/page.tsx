import React from 'react';
import DeployManager from './DeployManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Deploy Manager | Admin',
};

export default function DeployPage() {
  return <DeployManager />;
}

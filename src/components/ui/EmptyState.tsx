import React from 'react';
import { Music } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-spotify-subtext">
        {icon || <Music size={48} />}
      </div>
      <h3 className="text-white font-bold text-xl">{title}</h3>
      <p className="text-spotify-subtext max-w-xs">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

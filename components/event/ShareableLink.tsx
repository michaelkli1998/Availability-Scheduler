'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils/url';
import toast from 'react-hot-toast';

interface ShareableLinkProps {
  url: string;
  title?: string;
}

export default function ShareableLink({ url, title = 'Share this event' }: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-indigo-600" />
        {title}
      </h3>
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm text-gray-700 overflow-x-auto whitespace-nowrap">
          {url}
        </div>
        <Button
          onClick={handleCopy}
          variant={copied ? 'secondary' : 'primary'}
          className="flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Share this link with participants so they can mark their availability
      </p>
    </div>
  );
}

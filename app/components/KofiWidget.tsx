'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function KofiWidget() {
  useEffect(() => {
    // Initialize widget after script loads
    if (typeof window !== 'undefined' && (window as any).kofiWidgetOverlay) {
      (window as any).kofiWidgetOverlay.draw('joltt', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support Me',
        'floating-chat.donateButton.background-color': '#00b9fe',
        'floating-chat.donateButton.text-color': '#fff'
      });
    }
  }, []);

  return (
    <Script
      src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
      strategy="lazyOnload"
      onLoad={() => {
        if ((window as any).kofiWidgetOverlay) {
          (window as any).kofiWidgetOverlay.draw('joltt', {
            'type': 'floating-chat',
            'floating-chat.donateButton.text': 'Support Me',
            'floating-chat.donateButton.background-color': '#00b9fe',
            'floating-chat.donateButton.text-color': '#fff'
          });
        }
      }}
    />
  );
}

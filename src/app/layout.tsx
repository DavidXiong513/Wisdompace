import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '《一生的整理》｜Wisdompace',
  description: 'Wisdompace | A lifelong practice of living',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Script
          id="baidu-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?cf82be166404ec197d496b5f3e14b561";
                var s = document.getElementsByTagName("script")[0]; 
                s.parentNode.insertBefore(hm, s);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

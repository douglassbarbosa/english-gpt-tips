import './styles/globals.css'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ThreeTone English – English in Three Styles',
  description: 'Learn to speak English in three native tones: Informal, Neutral, and Formal.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg text-slate-900 p-4 border-b border-slate-200">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
          <Image 
            src="/images/p2893928853.webp" 
            alt="芙莉莲" 
            width={40} 
            height={40} 
            className="rounded-full"
          />
          <span className="font-bold text-xl">葬送的芙莉莲</span>
        </Link>
        <div className="space-x-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            主页
          </Link>
          <Link href="/portfolio" className="hover:text-blue-600 transition-colors">
            作品集
          </Link>
          <Link href="/qanything" className="hover:text-blue-600 transition-colors">
            芙莉莲问答
          </Link>
        </div>
      </nav>
    </header>
  );
} 
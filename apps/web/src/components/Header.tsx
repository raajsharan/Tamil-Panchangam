import Link from 'next/link';
import { Sun, Moon, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/context';

export function Header() {
  const { language, setLanguage, darkMode, setDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white tamil-text">
                {language === 'ta' ? 'தமிழ் பஞ்சாங்கம்' : 'Tamil Calendar'}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </Link>
            <Link
              href="/calendar"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {language === 'ta' ? 'மாதச் சந்தாள்' : 'Calendar'}
            </Link>
            <Link
              href="/special-days"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {language === 'ta' ? 'சிறப்பு நாட்கள்' : 'Special Days'}
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {language === 'ta' ? 'நிர்வாகம்' : 'Admin'}
            </Link>

            <button
              onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
              className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              {language === 'ta' ? 'EN' : 'தமிழ்'}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </Link>
            <Link
              href="/calendar"
              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {language === 'ta' ? 'மாதச் சந்தாள்' : 'Calendar'}
            </Link>
            <Link
              href="/special-days"
              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {language === 'ta' ? 'சிறப்பு நாட்கள்' : 'Special Days'}
            </Link>
            <Link
              href="/admin"
              className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {language === 'ta' ? 'நிர்வாகம்' : 'Admin'}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface FooterProps {
  language?: 'en' | 'ta';
}

export function Footer({ language = 'ta' }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold tamil-text">
                {language === 'ta' ? 'தமிழ் பஞ்சாங்கம்' : 'Tamil Calendar'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {language === 'ta'
                ? 'தினசரி தமிழ் சந்தாள் மற்றும் பஞ்சாங்கம் தகவல்கள்'
                : 'Daily Tamil calendar and Panchangam information'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ta' ? 'விரைவு இணைப்புகள்' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {language === 'ta' ? 'முகப்பு' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">
                  {language === 'ta' ? 'மாதச் சந்தாள்' : 'Calendar'}
                </Link>
              </li>
              <li>
                <Link href="/special-days" className="hover:text-white transition-colors">
                  {language === 'ta' ? 'சிறப்பு நாட்கள்' : 'Special Days'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ta' ? 'தொடர்பு' : 'Contact'}
            </h3>
            <p className="text-gray-400 text-sm">
              {language === 'ta'
                ? 'கேள்விகளுக்கு தயவுசெய்து எங்களைத் தொடர்புக்கொள்ளவும்'
                : 'Please contact us for any questions'}
            </p>
            <p className="text-gray-400 text-sm mt-2">admin@tamilcalendar.com</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            {language === 'ta'
              ? '© 2024 தமிழ் பஞ்சாங்கம். அனைத்து உரிமைகள் பாதுகாக்கப்பட்டவை.'
              : '© 2024 Tamil Calendar. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

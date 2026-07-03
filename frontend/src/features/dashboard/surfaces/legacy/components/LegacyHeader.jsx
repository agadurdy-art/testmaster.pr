// Extracted verbatim from pages/Dashboard.js (Faz1 refactor). Closed-over values
// from the Dashboard component body arrive as same-named props, so the JSX below
// is byte-identical to the original — including the learning_mode branch that
// hides the Tests block of the mobile menu for General English users.
import React from 'react';
import {
  Trophy, BarChart3, Mail, User, LogOut, X, Menu, LayoutDashboard,
  GraduationCap, CreditCard,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import LanguageSwitcher from '../../../../../components/LanguageSwitcher';
import ThemeToggle from '../../../../../components/ThemeToggle';
import { SUPPORT_EMAIL } from '../lib';

export default function LegacyHeader({
  bgHeader,
  isDark,
  isNightShift,
  textSecondary,
  mobileMenuOpen,
  setMobileMenuOpen,
  navigate,
  t,
  getText,
  user,
  onLogout,
  testModules,
  courses,
  startTest,
  learningMode,
}) {
  return (
      <header className={`sticky top-0 z-50 ${bgHeader} backdrop-blur-xl border-b shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">IELTS Ace</h1>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">🧪 Beta</span>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher iconOnly />
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => navigate('/progress')} className={`${textSecondary} hover:text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'}`}>
                <BarChart3 className="w-4 h-4 mr-2" />{getText('Progress', 'Tiến độ', 'İlerleme')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className={`${textSecondary} hover:text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'}`}>{t('navPricing')}</Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS Ace - Support Request')}&body=${encodeURIComponent(`Hi IELTS Ace Team,\n\nUser: ${user.name}\nEmail: ${user.email}\n\nMy question/issue:\n\n`)}`}
                className={`${textSecondary} hover:text-emerald-600 ${isDark ? 'hover:bg-emerald-900/30' : 'hover:bg-emerald-50'}`}
              >
                <Mail className="w-4 h-4 mr-2" />{getText('Contact', 'Liên hệ', 'İletişim')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')} className={`${textSecondary} hover:text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'}`}>
                <User className="w-4 h-4 mr-2" /><span data-lang-sample>{user.name}</span>
              </Button>
              <Button variant="ghost" onClick={onLogout} className={`text-red-500 hover:text-red-600 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}>
                <LogOut className="w-4 h-4 mr-2" />{t('navLogout')}
              </Button>
            </div>
            <button type="button" className={`md:hidden p-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : isNightShift ? 'border-amber-200 text-amber-700 hover:bg-amber-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${isDark ? 'border-gray-700 bg-gray-800' : isNightShift ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'} shadow-lg`}>
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <Button variant="ghost" className={`w-full justify-start ${textSecondary} font-medium`} onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                <LayoutDashboard className="w-4 h-4 mr-3" />{getText('Dashboard', 'Bảng điều khiển', 'Gösterge Paneli')}
              </Button>
              <Button variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate('/progress'); setMobileMenuOpen(false); }}>
                <BarChart3 className="w-4 h-4 mr-3" />{getText('Progress', 'Tiến độ', 'İlerleme')}
              </Button>
              {learningMode !== 'general_english' && (
                <>
                  <hr className={`my-2 ${isDark ? 'border-gray-700' : isNightShift ? 'border-amber-200' : 'border-gray-200'}`} />
                  <p className={`text-xs ${textSecondary} px-3 py-1`}>{getText('Tests', 'Bài kiểm tra', 'Testler')}</p>
                  {testModules.map((m) => (
                    <Button key={m.type} variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { startTest(m.type); setMobileMenuOpen(false); }}>
                      <m.icon className="w-4 h-4 mr-3" />{m.title}
                    </Button>
                  ))}
                </>
              )}
              <hr className={`my-2 ${isDark ? 'border-gray-700' : isNightShift ? 'border-amber-200' : 'border-gray-200'}`} />
              <p className={`text-xs ${textSecondary} px-3 py-1`}>{getText('Courses', 'Khóa học', 'Kurslar')}</p>
              <Button variant="ghost" className={`w-full justify-start text-blue-600 font-semibold`} onClick={() => { navigate('/unified'); setMobileMenuOpen(false); }}>
                <GraduationCap className="w-4 h-4 mr-3" />{getText('Learning Path', 'Lộ trình học', 'Öğrenme Yolu')}
              </Button>
              {courses.map((c) => (
                <Button key={c.id} variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate(c.route); setMobileMenuOpen(false); }}>
                  <span className="mr-3">{c.icon}</span>{c.name}
                </Button>
              ))}
              <hr className={`my-2 ${isDark ? 'border-gray-700' : isNightShift ? 'border-amber-200' : 'border-gray-200'}`} />
              <p className={`text-xs ${textSecondary} px-3 py-1`}>{getText('Account', 'Tài khoản', 'Hesap')}</p>
              <Button variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>
                <CreditCard className="w-4 h-4 mr-3" />{getText('Pricing', 'Giá cả', 'Fiyatlandırma')}
              </Button>
              <Button variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                <User className="w-4 h-4 mr-3" />{getText('Profile', 'Hồ sơ', 'Profil')}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-emerald-600" 
                onClick={() => {
                  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS Ace - Support Request')}&body=${encodeURIComponent(`Hi IELTS Ace Team,\n\nUser: ${user.name}\nEmail: ${user.email}\n\nMy question/issue:\n\n`)}`;
                  setMobileMenuOpen(false);
                }}
              >
                <Mail className="w-4 h-4 mr-3" />{getText('Contact Support', 'Liên hệ hỗ trợ', 'Destek ile İletişim')}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-3" />{getText('Logout', 'Đăng xuất', 'Çıkış Yap')}
              </Button>
            </div>
          </div>
        )}
      </header>
  );
}

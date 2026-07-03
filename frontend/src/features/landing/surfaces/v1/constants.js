// constants — COURSES config, verbatim from pages/LandingPage.js lines 175-225 (Faz1 wave 10).
// Course configurations with band ranges
export const COURSES = [
  {
    id: 'beginner',
    name: 'Beginner Course',
    nameVi: 'Khóa học Cơ bản',
    nameTr: 'Başlangıç Kursu',
    bandRange: 'Band 2.0 - 4.5',
    description: 'Essential English fundamentals with interactive lessons',
    descriptionVi: 'Kiến thức tiếng Anh cơ bản với bài học tương tác',
    descriptionTr: 'Etkileşimli derslerle temel İngilizce',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    icon: '🌱',
    apiEndpoint: '/api/beginner-english/lessons',
    previewRoute: '/beginner-course',
    directAccess: true
  },
  {
    id: 'mastery',
    name: 'Mastery Course',
    nameVi: 'Khóa học Trung cấp',
    nameTr: 'Ustalık Kursu',
    bandRange: 'Band 5.5 - 6.5',
    description: 'Intermediate IELTS skills with AI feedback',
    descriptionVi: 'Kỹ năng IELTS trung cấp với phản hồi AI',
    descriptionTr: 'AI geri bildirimi ile orta düzey IELTS becerileri',
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    icon: '📚',
    apiEndpoint: '/api/mastery-course/modules',
    previewRoute: '/mastery-course',
    directAccess: true
  },
  {
    id: 'advanced',
    name: 'Advanced Mastery',
    nameVi: 'Khóa học Nâng cao',
    nameTr: 'İleri Düzey Ustalık',
    bandRange: 'Band 6.5 - 9.0',
    description: 'Advanced strategies with expert AI evaluation',
    descriptionVi: 'Chiến lược nâng cao với đánh giá AI chuyên gia',
    descriptionTr: 'Uzman AI değerlendirmesiyle ileri stratejiler',
    color: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    icon: '🏆',
    apiEndpoint: '/api/advanced-mastery/modules',
    previewRoute: '/advanced-mastery',
    directAccess: true
  }
];

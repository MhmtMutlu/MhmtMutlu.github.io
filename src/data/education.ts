import type { Locale } from '../i18n/ui';

export const education: { school: Record<Locale, string>; degree: Record<Locale, string>; period: string }[] = [
  {
    school: { en: 'Nuh Naci Yazgan University', tr: 'Nuh Naci Yazgan Üniversitesi' },
    degree: { en: 'B.Sc. Electrical & Electronic Engineering', tr: 'Elektrik-Elektronik Mühendisliği, Lisans' },
    period: '2016 – 2020',
  },
  {
    school: { en: 'Fontys University of Applied Sciences', tr: 'Fontys Uygulamalı Bilimler Üniversitesi' },
    degree: { en: 'Erasmus+ Exchange Program', tr: 'Erasmus+ Değişim Programı' },
    period: '2019',
  },
];

export function getHolidays(year: number) {
  // 매년 고정된 양력 공휴일
  const common = [
    { date: `${year}-01-01`, name: '신정' },
    { date: `${year}-03-01`, name: '삼일절' },
    { date: `${year}-05-05`, name: '어린이날' },
    { date: `${year}-06-06`, name: '현충일' },
    { date: `${year}-08-15`, name: '광복절' },
    { date: `${year}-10-03`, name: '개천절' },
    { date: `${year}-10-09`, name: '한글날' },
    { date: `${year}-12-25`, name: '성탄절' },
  ];

  // 연도별로 바뀌는 음력 공휴일 (설날, 추석, 부처님오신날, 선거 등)
  const specific: Record<number, {date: string, name: string}[]> = {
    2024: [
      { date: '2024-02-09', name: '설연휴' }, { date: '2024-02-10', name: '설날' }, { date: '2024-02-11', name: '설연휴' }, { date: '2024-02-12', name: '대체공휴일' },
      { date: '2024-04-10', name: '국회의원선거' }, { date: '2024-05-15', name: '부처님오신날' },
      { date: '2024-09-16', name: '추석연휴' }, { date: '2024-09-17', name: '추석' }, { date: '2024-09-18', name: '추석연휴' }
    ],
    2025: [
      { date: '2025-01-28', name: '설연휴' }, { date: '2025-01-29', name: '설날' }, { date: '2025-01-30', name: '설연휴' },
      { date: '2025-05-05', name: '부처님오신날' }, { date: '2025-05-06', name: '대체공휴일' },
      { date: '2025-10-05', name: '추석연휴' }, { date: '2025-10-06', name: '추석' }, { date: '2025-10-07', name: '추석연휴' }, { date: '2025-10-08', name: '대체공휴일' }
    ],
    2026: [
      { date: '2026-02-16', name: '설연휴' }, { date: '2026-02-17', name: '설날' }, { date: '2026-02-18', name: '설연휴' },
      { date: '2026-05-24', name: '부처님오신날' }, { date: '2026-05-25', name: '대체공휴일' },
      { date: '2026-09-24', name: '추석연휴' }, { date: '2026-09-25', name: '추석' }, { date: '2026-09-26', name: '추석연휴' }
    ]
  };

  return [...common, ...(specific[year] || [])];
}

export interface PyqShiftDefinition {
  key: string;
  year: number;
  session: string;
  label: string;
}

export const PYQ_SHIFTS: PyqShiftDefinition[] = [
  { key: '2025_jan', year: 2025, session: 'Jan', label: '2025 Jan Shift' },
  { key: '2025_apr', year: 2025, session: 'Apr', label: '2025 Apr Shift' },
  { key: '2024_jan', year: 2024, session: 'Jan', label: '2024 Jan Shift' },
  { key: '2024_apr', year: 2024, session: 'Apr', label: '2024 Apr Shift' },
  { key: '2023_jan', year: 2023, session: 'Jan', label: '2023 Jan Shift' },
  { key: '2023_apr', year: 2023, session: 'Apr', label: '2023 Apr Shift' },
  { key: '2022_jun', year: 2022, session: 'Jun', label: '2022 Jun Shift' },
  { key: '2022_jul', year: 2022, session: 'Jul', label: '2022 Jul Shift' },
  { key: '2021_feb', year: 2021, session: 'Feb', label: '2021 Feb Shift' },
  { key: '2021_mar', year: 2021, session: 'Mar', label: '2021 Mar Shift' },
  { key: '2021_jul', year: 2021, session: 'Jul', label: '2021 Jul Shift' },
  { key: '2021_aug', year: 2021, session: 'Aug', label: '2021 Aug Shift' },
  { key: '2020_jan', year: 2020, session: 'Jan', label: '2020 Jan Shift' },
  { key: '2020_sep', year: 2020, session: 'Sep', label: '2020 Sep Shift' },
  { key: '2019_jan', year: 2019, session: 'Jan', label: '2019 Jan Shift' },
  { key: '2019_apr', year: 2019, session: 'Apr', label: '2019 Apr Shift' },
];

export const TOTAL_PYQ_SHIFTS_COUNT = PYQ_SHIFTS.length; // 16 total shift sessions
export const PYQ_SHIFT_KEYS = PYQ_SHIFTS.map((s) => s.key);

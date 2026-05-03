export const vi = {
  slug: 'uoc-chung-lon-nhat',
  topic: 'so-hoc',
  grade: 'lop-6',
  title: 'Ước chung lớn nhất (thuật toán Euclid)',
  gradeLabel: 'Lớp 6',
  intro:
    'Ước chung lớn nhất (ƯCLN) của hai số tự nhiên là số lớn nhất chia hết cả hai. Thuật toán Euclid tìm ƯCLN bằng cách thay liên tiếp (a, b) bằng (b, a mod b) cho đến khi b = 0 — khi đó a chính là ƯCLN.',
  instruction: 'Nhập hai số (1 – 999) rồi nhấn "Bước" để xem từng bước rút gọn',
  inputALabel: 'Số thứ nhất (a)',
  inputBLabel: 'Số thứ hai (b)',
  stepBtn: 'Bước',
  autoBtn: 'Tự động',
  resetBtn: 'Khởi động lại',
  tableHeaderA: 'a',
  tableHeaderB: 'b',
  tableHeaderQ: 'q',
  tableHeaderR: 'r',
  rowDescription: 'a = q · b + r',
  resultLabel: 'ƯCLN',
  lcmLabel: 'BCNN',
  theoremTitle: 'Thuật toán Euclid',
  theoremStatement:
    'Với mọi a, b ≥ 0 (không cùng bằng 0): ƯCLN(a, b) = ƯCLN(b, a mod b). Khi b = 0, ƯCLN = a.',
  exampleTitle: 'Ví dụ',
  exampleBody:
    'Tìm ƯCLN(48, 18). Bước 1: 48 = 2·18 + 12. Bước 2: 18 = 1·12 + 6. Bước 3: 12 = 2·6 + 0. Vậy ƯCLN(48, 18) = 6, và BCNN(48, 18) = 48·18 / 6 = 144.',
  nextTeaser: 'Sắp ra mắt: BCNN bằng phân tích thừa số nguyên tố',
};

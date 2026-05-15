export const vi = {
  slug: 'sang-eratosthenes',
  topic: 'so-hoc',
  grade: 'lop-6',
  gradeLabel: 'Lớp 6',
  title: 'Sàng Eratosthenes',
  intro:
    'Cách đơn giản nhất để tìm tất cả số nguyên tố từ 1 đến 100: lần lượt gạch bỏ các bội số của từng số nguyên tố nhỏ nhất. Những ô còn lại chính là số nguyên tố.',
  instruction:
    'Bấm vào số 2 trước, rồi 3, rồi 5, rồi 7 — và quan sát các bội số bị gạch dần. Sau bốn lần bấm, các số chưa bị gạch chính là tất cả số nguyên tố từ 2 đến 100.',
  legendTitle: 'Chú giải màu',
  legendLabels: {
    2: 'Bội của 2',
    3: 'Bội của 3',
    5: 'Bội của 5',
    7: 'Bội của 7',
  },
  primeTooltip:
    'Số nguyên tố là số tự nhiên lớn hơn 1, chỉ chia hết cho 1 và chính nó.',
  specialOne: 'Số 1 không phải số nguyên tố và không phải hợp số.',
  resetLabel: 'Đặt lại',
  theoremTitle: 'Sàng Eratosthenes là gì?',
  theoremStatement:
    'Sàng Eratosthenes là thuật toán cổ đại do nhà toán học Hy Lạp Eratosthenes (khoảng 276–194 TCN) phát minh. Để tìm số nguyên tố đến n: bắt đầu từ 2, gạch bỏ tất cả bội số của nó; chuyển sang số chưa bị gạch tiếp theo (3), gạch bỏ các bội; lặp lại cho đến khi đã xét hết các số đến √n. Tất cả số còn lại là số nguyên tố.',
  exampleTitle: 'Ví dụ',
  exampleBody:
    'Sau khi bấm vào 2, 3, 5 và 7, lưới 10×10 sẽ giữ lại đúng 25 số nguyên tố: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97. Mỗi số nguyên tố không bị gạch vì không phải bội số của số nào nhỏ hơn nó (trừ 1).',
  nextTeaser: 'Sắp ra mắt: Ước chung lớn nhất và thuật toán Euclid',
  announceRipple: /** @param {number} p @param {number[]} mults */ (p, mults) =>
    `Đã gạch các bội của ${p}: ${mults.join(', ')}`,
};

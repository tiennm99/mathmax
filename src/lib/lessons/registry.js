import { vi as gcdCopy } from './uoc-chung-lon-nhat/copy.vi.js';
import { vi as sieveCopy } from './sang-eratosthenes/copy.vi.js';
import { vi as diffSquaresCopy } from './hieu-hai-binh-phuong/copy.vi.js';
import { vi as linearCopy } from './duong-thang/copy.vi.js';
import { vi as pythagorasCopy } from './dinh-ly-pythagoras/copy.vi.js';
import { vi as sssCopy } from './tam-giac-bang-nhau/copy.vi.js';
import { vi as similarityCopy } from './tam-giac-dong-dang/copy.vi.js';
import { vi as inscribedCopy } from './goc-noi-tiep/copy.vi.js';

/**
 * @typedef {{slug: string, topic: string, grade: string, title: string,
 *            gradeLabel: string, intro: string, [k: string]: any}} LessonCopy
 */

// Order: by topic (số học → đại số → hình học), then by grade ascending.
/** @type {LessonCopy[]} */
export const lessons = [
  gcdCopy,
  sieveCopy,
  diffSquaresCopy,
  linearCopy,
  pythagorasCopy,
  sssCopy,
  similarityCopy,
  inscribedCopy,
];

/** @param {string} topic */
export function lessonsByTopic(topic) {
  return lessons.filter((l) => l.topic === topic);
}

/** @param {string} slug */
export function lessonBySlug(slug) {
  return lessons.find((l) => l.slug === slug);
}

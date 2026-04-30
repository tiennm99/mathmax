import { vi as sssCopy } from './tam-giac-bang-nhau/copy.vi.js';
import { vi as similarityCopy } from './tam-giac-dong-dang/copy.vi.js';
import { vi as inscribedCopy } from './goc-noi-tiep/copy.vi.js';

/**
 * @typedef {{slug: string, topic: string, grade: string, title: string,
 *            gradeLabel: string, intro: string, [k: string]: any}} LessonCopy
 */

/** @type {LessonCopy[]} */
export const lessons = [sssCopy, similarityCopy, inscribedCopy];

/** @param {string} topic */
export function lessonsByTopic(topic) {
  return lessons.filter((l) => l.topic === topic);
}

/** @param {string} slug */
export function lessonBySlug(slug) {
  return lessons.find((l) => l.slug === slug);
}

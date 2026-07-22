import { describe, it, expect, beforeEach } from 'vitest';
import { store, getLocalDateString, getDefaultState } from './index';
import { ALL_CHAPTERS } from '../data/chapters';

describe('Store XP & State Mutations', () => {
  const originalState = store.getState();

  beforeEach(() => {
    store.resetAllData();
  });

  it('clamps XP to 0 and never allows negative values', () => {
    const chId = ALL_CHAPTERS[0].id;
    store.toggleStage(chId, 'theory');
    expect(store.getState().xp).toBeGreaterThanOrEqual(0);

    store.toggleStage(chId, 'theory');
    expect(store.getState().xp).toBeGreaterThanOrEqual(0);

    for (let i = 0; i < 100; i++) {
      store.toggleStage(chId, 'theory');
    }
    expect(store.getState().xp).toBeGreaterThanOrEqual(0);
  });

  it('does not create chapter data for unknown chapter IDs', () => {
    const before = { ...store.getState().chapters };
    store.getChapterData('unknown_chapter_xyz');
    expect(store.getState().chapters).toEqual(before);
  });

  it('creates chapter data for valid chapter IDs', () => {
    const chId = ALL_CHAPTERS[0].id;
    const data = store.getChapterData(chId);
    expect(data.stages.theory).toBe(false);
    expect(store.getState().chapters[chId]).toBeDefined();
  });

  it('awards XP only on new study log entries, not updates', () => {
    const today = getLocalDateString();
    const initialXp = store.getState().xp;

    store.logStudySession({ date: today, lc: 2, pr: 0, tot: 2, qs: 10 }, true);
    expect(store.getState().xp).toBe(initialXp + 100);

    const beforeUpdate = store.getState().xp;
    store.logStudySession({ date: today, lc: 3, pr: 1, tot: 4, qs: 20 }, true);
    expect(store.getState().xp).toBe(beforeUpdate);
  });

  it('deleteStudyLog does not throw when deleting an unknown id', () => {
    expect(() => store.deleteStudyLog('does_not_exist')).not.toThrow();
  });
});

describe('Store MockTest ID handling', () => {
  beforeEach(() => {
    store.resetAllData();
  });

  it('generates numeric IDs for mock tests', () => {
    store.addMockTest({ name: 'Test A', date: '2026-07-23', ph: 90, ch: 85, ma: 80, to: 255 });
    const tests = store.getState().tests;
    expect(tests.length).toBe(1);
    expect(typeof tests[0].id).toBe('number');
  });

  it('deleteMockTest removes by numeric id', () => {
    store.addMockTest({ name: 'Test A', date: '2026-07-23', ph: 90, ch: 85, ma: 80, to: 255 });
    const id = store.getState().tests[0].id;
    store.deleteMockTest(id);
    expect(store.getState().tests.length).toBe(0);
  });

  it('deleteMockTest accepts string id fallback', () => {
    store.addMockTest({ name: 'Test A', date: '2026-07-23', ph: 90, ch: 85, ma: 80, to: 255 });
    const id = String(store.getState().tests[0].id);
    store.deleteMockTest(id);
    expect(store.getState().tests.length).toBe(0);
  });
});

describe('Store Mistake undo preserves dateAdded', () => {
  beforeEach(() => {
    store.resetAllData();
  });

  it('addMistake can preserve original dateAdded', () => {
    const originalDate = '2026-01-15';
    const mistake = {
      questionText: 'Q',
      sub: 'physics' as const,
      errorType: 'calculation' as const,
      status: 'open' as const,
    };

    store.addMistake(mistake, originalDate);
    const added = store.getState().mistakes[0];
    expect(added.dateAdded).toBe(originalDate);
  });
});

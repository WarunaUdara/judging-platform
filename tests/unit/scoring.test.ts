import { describe, expect, it } from 'vitest';

import {
  assignRanks,
  computeAverageScore,
  computeWeightedScore,
  validateScore,
  validateWeights,
  type CriterionScore,
} from '@/lib/utils/scoring';

describe('scoring utilities', () => {
  it('computes weighted score from criteria', () => {
    const scores: CriterionScore[] = [
      { criteriaId: 'c1', score: 8, maxScore: 10, weight: 40 },
      { criteriaId: 'c2', score: 6, maxScore: 10, weight: 60 },
    ];

    expect(computeWeightedScore(scores)).toBe(68);
  });

  it('computes average score and handles empty arrays', () => {
    expect(computeAverageScore([70, 80, 90])).toBe(80);
    expect(computeAverageScore([])).toBe(0);
  });

  it('assigns ranks in descending score order', () => {
    const ranked = assignRanks([
      { teamId: 'team-b', averageWeightedScore: 75 },
      { teamId: 'team-a', averageWeightedScore: 92 },
      { teamId: 'team-c', averageWeightedScore: 60 },
    ]);

    expect(ranked).toEqual([
      { teamId: 'team-a', rank: 1 },
      { teamId: 'team-b', rank: 2 },
      { teamId: 'team-c', rank: 3 },
    ]);
  });

  it('validates weight totals and score bounds', () => {
    expect(validateWeights([25, 25, 50])).toBe(true);
    expect(validateWeights([20, 20, 20])).toBe(false);

    expect(validateScore(8, 10)).toBe(true);
    expect(validateScore(-1, 10)).toBe(false);
    expect(validateScore(11, 10)).toBe(false);
  });
});

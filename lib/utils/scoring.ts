export interface CriterionScore {
  criteriaId: string;
  score: number;
  weight: number;
  maxScore: number;
}

/**
 * Computes the weighted score from an array of criterion scores.
 * Formula: sum(score / maxScore * weight)
 * @param scores Array of criterion scores with their weights
 * @returns Weighted score out of 100
 */
export function computeWeightedScore(scores: CriterionScore[]): number {
  return scores.reduce((total, s) => {
    return total + (s.score / s.maxScore) * s.weight;
  }, 0);
}

/**
 * Computes the average of multiple weighted scores
 * @param weightedScores Array of weighted scores
 * @returns Average weighted score
 */
export function computeAverageScore(weightedScores: number[]): number {
  if (weightedScores.length === 0) return 0;
  return weightedScores.reduce((a, b) => a + b, 0) / weightedScores.length;
}

/**
 * Assigns ranks to teams based on their average weighted scores
 * Teams with higher scores get lower rank numbers (1 is best)
 * @param entries Array of team entries with scores
 * @returns Array of team entries with ranks assigned
 */
export function assignRanks(
  entries: { teamId: string; averageWeightedScore: number }[]
): { teamId: string; rank: number }[] {
  return [...entries]
    .sort((a, b) => b.averageWeightedScore - a.averageWeightedScore)
    .map((entry, i) => ({ teamId: entry.teamId, rank: i + 1 }));
}

/**
 * Validates that criteria weights sum to 100
 * @param weights Array of weight values
 * @returns True if weights sum to 100, false otherwise
 */
export function validateWeights(weights: number[]): boolean {
  const sum = weights.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 0.01; // Allow for floating point errors
}

/**
 * Validates that a score is within the valid range
 * @param score The score to validate
 * @param maxScore The maximum allowed score
 * @returns True if score is valid, false otherwise
 */
export function validateScore(score: number, maxScore: number): boolean {
  return score >= 0 && score <= maxScore;
}

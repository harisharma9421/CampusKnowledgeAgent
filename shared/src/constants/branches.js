/**
 * Academic Branch Constants
 * Defines all supported engineering branches in the campus system.
 */

export const BRANCHES = {
  COMPUTER: 'computer_engineering',
  ELECTRONICS: 'electronics_engineering',
  CIVIL: 'civil_engineering',
  MECHANICAL: 'mechanical_engineering',
};

export const BRANCH_LABELS = {
  [BRANCHES.COMPUTER]: 'Computer Engineering',
  [BRANCHES.ELECTRONICS]: 'Electronics Engineering',
  [BRANCHES.CIVIL]: 'Civil Engineering',
  [BRANCHES.MECHANICAL]: 'Mechanical Engineering',
};

export const BRANCH_LIST = Object.values(BRANCHES);

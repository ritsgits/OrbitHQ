export function getProjectDerivedStatus(stats: { total: number, completed: number, inProgress: number, todo: number }) {
  if (stats.total === 0) return "TODO";
  if (stats.completed === stats.total && stats.total > 0) return "COMPLETED";
  if (stats.completed > 0 || stats.inProgress > 0) return "IN_PROGRESS";
  return "TODO";
}

export function getProjectProgress(stats: { total: number, completed: number }) {
  if (stats.total === 0) return 0;
  return Math.round((stats.completed / stats.total) * 100);
}

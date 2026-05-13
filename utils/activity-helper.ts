export const getActivityRoute = (entityType: string): string => {
  switch (entityType) {
    case "PROJECT":
      return "/projects"
    case "TASK":
      return "/tasks"
    case "LEAD":
      return "/crm"
    case "MEMBER":
      return "/team"
    default:
      return "/dashboard"
  }
}

import type { Project, FilterState } from "./types";

/**
 * Apply all active filters to the projects array and return matching projects.
 * Projects with null codYear always pass the COD year filter.
 */
export function applyFilters(projects: Project[], filters: FilterState): Project[] {
  return projects.filter((p) => {
    // Fuel type toggle
    if (!filters.fuels[p.fuel]) return false;

    // Status toggle
    if (!filters.statuses[p.status]) return false;

    // Capacity range
    if (p.capacityMw < filters.capacityRange[0] || p.capacityMw > filters.capacityRange[1]) {
      return false;
    }

    // COD year range — projects with null codYear always pass
    if (p.codYear !== null) {
      if (p.codYear < filters.codYearRange[0] || p.codYear > filters.codYearRange[1]) {
        return false;
      }
    }

    return true;
  });
}

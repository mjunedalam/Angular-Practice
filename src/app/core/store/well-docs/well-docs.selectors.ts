import { WellDoc } from '@models/well-design/well-docs.model';

export function selectDocsByCategory(docs: WellDoc[]): Map<string, WellDoc[]> {
  const map = new Map<string, WellDoc[]>();
  for (const doc of docs) {
    const list = map.get(doc.category) ?? [];
    map.set(doc.category, [...list, doc]);
  }
  return map;
}

export function selectCategories(docs: WellDoc[]): string[] {
  return [...new Set(docs.map(d => d.category))];
}

export function selectTotalDocCount(docs: WellDoc[]): number {
  return docs.length;
}

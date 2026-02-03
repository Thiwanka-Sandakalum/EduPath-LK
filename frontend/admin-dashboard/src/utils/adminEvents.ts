export const ADMIN_DATA_CHANGED_EVENT = 'edupath-admin-data-changed';

export type AdminDataChangeSource = 'institutions' | 'courses' | 'scholarships' | 'students' | 'other';

export function emitAdminDataChanged(source: AdminDataChangeSource = 'other') {
  try {
    window.dispatchEvent(new CustomEvent(ADMIN_DATA_CHANGED_EVENT, { detail: { source, at: Date.now() } }));
  } catch {
    // no-op
  }
}

export function onAdminDataChanged(handler: (event: Event) => void) {
  window.addEventListener(ADMIN_DATA_CHANGED_EVENT, handler);
  return () => window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, handler);
}

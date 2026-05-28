/** True when the event target is empty canvas (not a node, handle, or control). */
export function isPaneTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  if (
    target.closest('.react-flow__node') ||
    target.closest('.react-flow__edge') ||
    target.closest('.react-flow__handle') ||
    target.closest('.react-flow__controls')
  ) {
    return false
  }

  return Boolean(
    target.classList.contains('react-flow__pane') ||
      target.classList.contains('react-flow__background') ||
      target.closest('.react-flow__pane') ||
      target.closest('.react-flow__background'),
  )
}

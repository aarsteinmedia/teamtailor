import Teamtailor from '@/legacy'

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  Teamtailor.run()
} else {
  document.addEventListener('DOMContentLoaded', Teamtailor.run)
}

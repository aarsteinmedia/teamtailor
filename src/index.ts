import Teamtailor from '@/TeamTailor'

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  Teamtailor.run()
} else {
  document.addEventListener('DOMContentLoaded', Teamtailor.run)
}

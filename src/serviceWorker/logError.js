export default function logError() {
  self.addEventListener('error', function(e) {
    console.error('Error:', e);
  });
}

// app.js

// Helper function to fetch ICS data (may require a CORS proxy if needed)
async function fetchICS(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const icsText = await response.text();
    return icsText;
  } catch (error) {
    console.error('Error fetching ICS:', error);
  }
}

// Parse ICS data using ical.js
function parseICS(icsData) {
  const jcalData = ICAL.parse(icsData);
  const comp = new ICAL.Component(jcalData);
  const events = comp.getAllSubcomponents('vevent').map(eventComp => {
    const event = new ICAL.Event(eventComp);
    return {
      summary: event.summary,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate()
    };
  });
  return events;
}

// Handler for the import button
document.getElementById('import-btn').addEventListener('click', async () => {
  const icsUrl = document.getElementById('ics-url').value.trim();
  if (!icsUrl) {
    alert('Please enter a valid ICS URL.');
    return;
  }
  
  // Optional: Use a CORS proxy if you encounter CORS errors
  // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  // const finalUrl = proxyUrl + icsUrl;
  // For now, we try the URL directly.
  
  const icsData = await fetchICS(icsUrl);
  if (icsData) {
    const events = parseICS(icsData);
    console.log('Parsed events:', events);
    // Now, update the calendar grid with busy times.
    markBusySlots(events);
  }
});

// app.js (continued)

// Define time slots (example: a week with 1-hour intervals for one day)
// For simplicity, we assume a single day schedule from 8:00 to 18:00
function createGrid() {
  const gridContainer = document.getElementById('calendar-grid');
  gridContainer.innerHTML = ''; // Clear previous grid if any
  // Let's create 10 slots (8am to 6pm)
  for (let hour = 8; hour < 18; hour++) {
    const slot = document.createElement('div');
    slot.classList.add('slot');
    slot.dataset.hour = hour;
    slot.textContent = `${hour}:00 - ${hour + 1}:00`;
    // Allow clicking to mark available/unavailable (if not already busy)
    slot.addEventListener('click', () => toggleAvailability(slot));
    gridContainer.appendChild(slot);
  }
}

// Toggle slot availability (for manual marking)
function toggleAvailability(slot) {
  if (slot.classList.contains('busy')) return; // Busy slots are not clickable
  slot.classList.toggle('available');
}

// Mark slots as busy based on imported events
function markBusySlots(events) {
  // For each event, mark overlapping grid cells as busy.
  // (This example is very basic. You’ll want to adjust for real time ranges.)
  events.forEach(event => {
    // Assume the event falls on the same day as our grid.
    const startHour = event.start.getHours();
    const endHour = event.end.getHours();
    // Loop through our grid slots and mark busy if the slot hour overlaps the event.
    document.querySelectorAll('.slot').forEach(slot => {
      const slotHour = parseInt(slot.dataset.hour, 10);
      if (slotHour >= startHour && slotHour < endHour) {
        slot.classList.add('busy');
      }
    });
  });
}

// Initialize the grid when the page loads
createGrid();



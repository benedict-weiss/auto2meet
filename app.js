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


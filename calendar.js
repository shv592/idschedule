// calendar.js

// Function to generate the calendar
function generateCalendar(year, month, events) {
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = ''; // Clear previous calendar

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let row = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        cell.textContent = day;

        const eventKey = `${year}-${month + 1}-${day}`;
        if (events[eventKey]) {
            events[eventKey].forEach(event => {
                if (event) {
                    cell.innerHTML += `<div class="event">${event}</div>`;
                }
            });
        }

      

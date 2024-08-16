let currentYear = 2024;
let currentMonth = 7; // 0-based index for August

// Function to generate the calendar
function generateCalendar(year, month, events, weekendEvents) {
    const calendarBody = document.getElementById('calendar-body');
    const monthYear = document.getElementById('month-year');
    calendarBody.innerHTML = ''; // Clear previous calendar

    // Calculate the first Monday and last Sunday of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const firstMonday = new Date(firstDayOfMonth);
    while (firstMonday.getDay() !== 1) {
        firstMonday.setDate(firstMonday.getDate() - 1);
    }

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastSunday = new Date(lastDayOfMonth);
    while (lastSunday.getDay() !== 0) {
        lastSunday.setDate(lastSunday.getDate() + 1);
    }

    // Fill calendar with empty days before the first Monday
    const days = [];
    let currentDate = firstMonday;
    while (currentDate <= lastSunday) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    let row = document.createElement('tr');
    days.forEach((date, index) => {
        if (index % 7 === 0 && index !== 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }

        const cell = document.createElement('td');
        if (date.getMonth() === month) {
            const day = date.getDate();
            cell.textContent = day;

            const eventKey = `${year}-${month + 1}-${day}`;
            if (events[eventKey]) {
                events[eventKey].forEach(({ label, name }) => {
                    if (name) {
                        cell.innerHTML += `<div class="event ${label}">${name}</div>`;
                    }
                });
            }

            const weekendKey = `${year}-${month + 1}-${day}`;
            if (weekendEvents[weekendKey]) {
                weekendEvents[weekendKey].forEach(({ label, name }) => {
                    if (name) {
                        cell.innerHTML += `<div class="event citywide">${name}</div>`;
                    }
                });
            }
        }

        row.appendChild(cell);
    });

    if (row.children.length > 0) {
        calendarBody.appendChild(row);
    }

    // Update month and year display
    monthYear.textContent = `${getMonthName(month)} ${year}`;
}

// Function to get month name
function getMonthName(monthIndex) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
}

// Fetch data from Google Sheets as CSV
async function fetchEvents() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1k-j85Yo2CBqX21myqZJKjnbsPs3ovmUATkhDlLICzNQ/pub?gid=0&single=true&output=csv');
        const text = await response.text();
        console.log('Fetched CSV data:', text); // Log the raw CSV data to check

        const rows = text.split('\n').map(row => row.split(','));
        console.log('Parsed rows:', rows); // Log the parsed rows to check

        const events = {};
        const weekendEvents = {};

        rows.slice(1).forEach(row => {
            // Extract relevant columns
            const [startDate, endDate, ruhNames, sphNames, , , , weekendStartDate, weekendEndDate, , , , , cityWide] = row.slice(7, 15); // Adjust for columns H to P

            console.log('Processing row:', row); // Log each row for debugging

            // Handle weekday events
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                    if (!events[key]) {
                        events[key] = [];
                    }
                    if (ruhNames) {
                        events[key].push({ label: 'ruh', name: ruhNames });
                    }
                    if (sphNames) {
                        events[key].push({ label: 'sph', name: sphNames });
                    }
                }
            }

            // Handle weekend events
            if (weekendStartDate && weekendEndDate && cityWide) {
                const weekendStart = new Date(weekendStartDate);
                const weekendEnd = new Date(weekendEndDate);
                for (let d = weekendStart; d <= weekendEnd; d.setDate(d.getDate() + 1)) {
                    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                    if (!weekendEvents[key]) {
                        weekendEvents[key] = [];
                    }
                    weekendEvents[key].push({ label: 'citywide', name: cityWide });
                }
            }
        });

        console.log('Events data:', { events, weekendEvents }); // Log the final data structure to check

        return { events, weekendEvents };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { events: {}, weekendEvents: {} };
    }
}

// Event handlers for month navigation
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});

// Function to update calendar with the current month and year
function updateCalendar() {
    fetchEvents().then(({ events, weekendEvents }) => {
        generateCalendar(currentYear, currentMonth, events, weekendEvents);
    });
}

// Initialize calendar
updateCalendar();

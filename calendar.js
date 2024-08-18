let currentYear = 2024;
let currentMonth = 7; // 0-based index for August

// Function to generate the calendar
function generateCalendar(year, month, events, weekendEvents) {
    const calendarBody = document.getElementById('calendar-body');
    const monthYear = document.getElementById('month-year');
    calendarBody.innerHTML = ''; // Clear previous calendar

    // Calculate the first Monday and last Sunday of the month
    const firstDayOfMonth = new Date(year, month, 1);
    console.log('First day of month:', firstDayOfMonth);
    
    const firstMonday = new Date(firstDayOfMonth);
    while (firstMonday.getDay() !== 1) {
        firstMonday.setDate(firstMonday.getDate() - 1);
    }
    console.log('First Monday of month:', firstMonday);

    const lastDayOfMonth = new Date(year, month + 1, 0);
    console.log('Last day of month:', lastDayOfMonth);
    
    const lastSunday = new Date(lastDayOfMonth);
    while (lastSunday.getDay() !== 0) {
        lastSunday.setDate(lastSunday.getDate() + 1);
    }
    console.log('Last Sunday of month:', lastSunday);

    // Fill calendar with empty days before the first Monday
    const days = [];
    let currentDate = new Date(firstMonday); // Clone to avoid modifying the original
    while (currentDate <= lastSunday) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log('Days in calendar:', days);

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

            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log('Processing date:', key);
            
            // Add weekend class based on the day of the week
            if (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
                cell.classList.add('weekend');
            }

            // Display weekday events
            if (events[key]) {
                events[key].forEach(({ label, name }) => {
                    if (name) {
                        cell.innerHTML += `<div class="event ${label}">${name}</div>`;
                    }
                });
            }

            // Display weekend events
            if (weekendEvents[key]) {
                weekendEvents[key].forEach(({ label, name }) => {
                    if (name) {
                        cell.innerHTML += `<div class="event ${label}">${name}</div>`;
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
        const response = await fetch('https://docs.google.com/spreadsheets/d/1k-j85Yo2CBqX21myqZJKjnbsPs3ovmUATkhDlLICzNQ/pub?gid=68209812&single=true&output=csv');
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));

        const events = {};
        const weekendEvents = {};

        rows.slice(1).forEach(row => {
            // Extract relevant columns
            const [startDateStr, endDateStr, ruhNames, sphSchNames, weekendStartDateStr, weekendEndDateStr, cityWide] = row.slice(0, 7);

            console.log('Processing row:', row);
            console.log('Start Date:', startDateStr, 'End Date:', endDateStr, 'Weekend Start Date:', weekendStartDateStr, 'Weekend End Date:', weekendEndDateStr, 'Ruh Names:', ruhNames, 'Sph Sch Names:', sphSchNames, 'City Wide:', cityWide);

            // Convert strings to dates and set time to 00:00:00
            const startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(endDateStr);
            endDate.setHours(0, 0, 0, 0);

            console.log('Parsed start date:', startDate, 'Parsed end date:', endDate);

            // Handle weekday events (startDate to endDate)
            if (startDate && endDate) {
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                    if (!events[key]) {
                        events[key] = [];
                    }
                    
                    // Push ruhNames and sphSchNames to the corresponding date
                    if (ruhNames) {
                        events[key].push({ label: 'ruhNames', name: ruhNames });
                    }
                    if (sphSchNames) {
                        events[key].push({ label: 'sphSchNames', name: sphSchNames });
                    }
                }
            }

            // Convert strings to dates and set time to 00:00:00
            const weekendStartDate = new Date(weekendStartDateStr);
            weekendStartDate.setHours(0, 0, 0, 0);
            const weekendEndDate = new Date(weekendEndDateStr);
            weekendEndDate.setHours(0, 0, 0, 0);

            console.log('Parsed weekend start date:', weekendStartDate, 'Parsed weekend end date:', weekendEndDate);

            // Handle weekend events (weekendStartDate to weekendEndDate)
            if (weekendStartDate && weekendEndDate && cityWide) {
                for (let d = new Date(weekendStartDate); d <= weekendEndDate; d.setDate(d.getDate() + 1)) {
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                    if (!weekendEvents[key]) {
                        weekendEvents[key] = [];
                    }
                    
                    // Push cityWide event to the corresponding weekend date
                    weekendEvents[key].push({ label: 'cityWide', name: cityWide });
                }
            }
        });

        console.log('Events:', events);
        console.log('Weekend Events:', weekendEvents);

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

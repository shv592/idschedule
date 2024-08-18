// Initialize with the current date
const today = new Date();
today.setHours(0, 0, 0, 0); // Set the time to 00:00:00 for accurate comparison
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0-based index for months

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
    let currentDate = new Date(firstMonday); // Clone to avoid modifying the original
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

            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Highlight today's date (comparing full date)
            if (date.getTime() === today.getTime()) {
                cell.classList.add('highlight-today');
            }

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

// Function to generate the table view
function generateTable(events, weekendEvents) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear previous table data

    // Collect all keys (dates) and sort them
    const allKeys = Object.keys(events).concat(Object.keys(weekendEvents));
    const sortedKeys = [...new Set(allKeys)].sort();

    // Filter dates to only include those within the current month
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    sortedKeys.forEach(key => {
        const [year, month, day] = key.split('-').map(Number);
        const date = new Date(year, month - 1, day);



        if (date >= startDate && date <= endDate) {
            const row = document.createElement('tr');
    
           

            // Highlight today's date (comparing full date)
            if (date.getTime() === today.getTime()) {
                row.classList.add('highlight-today-row');
            }
           
    
            // Add weekend class if the date is a weekend
            if (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
                row.classList.add('weekend');
            }


            // Date Cell
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(date); // Format date using the existing formatDate function
            row.appendChild(dateCell);

            // RUH Names Cell
            const ruhCell = document.createElement('td');
            ruhCell.textContent = (events[key] || []).filter(e => e.label === 'ruhNames').map(e => e.name).join(', ');
            row.appendChild(ruhCell);

            // SPH/SCH Names Cell
            const sphSchCell = document.createElement('td');
            sphSchCell.textContent = (events[key] || []).filter(e => e.label === 'sphSchNames').map(e => e.name).join(', ');
            row.appendChild(sphSchCell);

            // Weekend Events Cell
            const weekendCell = document.createElement('td');
            weekendCell.textContent = (weekendEvents[key] || []).filter(e => e.label === 'cityWide').map(e => e.name).join(', ');
            row.appendChild(weekendCell);


            tableBody.appendChild(row);
        }
    });
}

// Function to format date as "Day, number Month year"
function formatDate(date) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
}

// Function to get month name
function getMonthName(monthIndex) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
}

async function fetchEvents() {
    console.log('Fetching events...');
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1k-j85Yo2CBqX21myqZJKjnbsPs3ovmUATkhDlLICzNQ/pub?gid=68209812&single=true&output=csv');
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));

        const events = {};
        const weekendEvents = {};

        rows.slice(1).forEach(row => {
            console.log('Processing row:', row);

            // Extract relevant columns
            const [startDateStr, endDateStr, ruhNames, sphSchNames, weekendStartDateStr, weekendEndDateStr, cityWide] = row.slice(0, 7);

            // Convert strings to dates and set time to 00:00:00
            const startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(endDateStr);
            endDate.setHours(0, 0, 0, 0);

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

        console.log('Fetched Events:', events);
        console.log('Fetched Weekend Events:', weekendEvents);

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

// Function to update calendar and table with the current month and year
function updateCalendar() {
    console.log('Updating calendar...');
    fetchEvents().then(({ events, weekendEvents }) => {
        console.log('Container Classes:', document.getElementById('calendar-container').classList);

        if (document.getElementById('calendar-container').classList.contains('show-table')) {
            console.log('Getting table...');
            generateTable(events, weekendEvents);
        } else {
            generateCalendar(currentYear, currentMonth, events, weekendEvents);
        }
    });
}

// Event handler for toggling view
document.getElementById('toggle-view').addEventListener('click', () => {
    const calendarView = document.getElementById('calendar-view');
    const tableView = document.getElementById('table-view');
    const toggleButton = document.getElementById('toggle-view');
    const container = document.getElementById('calendar-container');

    console.log('Toggling view');
    console.log('Calendar view display:', window.getComputedStyle(calendarView).display);
    console.log('Table view display:', window.getComputedStyle(tableView).display);

    if (container.classList.contains('show-table')) {
        calendarView.style.display = 'table';
        tableView.style.display = 'none';
        toggleButton.textContent = 'Show Table';
        container.classList.remove('show-table');
    } else {
        calendarView.style.display = 'none';
        tableView.style.display = 'table';
        toggleButton.textContent = 'Show Calendar';
        container.classList.add('show-table');
    }

    updateCalendar();
});

// Initialize calendar
updateCalendar();

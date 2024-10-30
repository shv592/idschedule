// Initialize with the current date
const today = new Date();
today.setHours(0, 0, 0, 0); // Set the time to 00:00:00 for accurate comparison
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0-based index for months
let events = {}; // Store events globally

// Function to generate the calendar
function generateCalendar(year, month) {
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
function generateTable(events) {
    const tableBody = document.getElementById('table-body');
    const monthYear = document.getElementById('month-year');
    tableBody.innerHTML = ''; // Clear previous table data

    // Collect all keys (dates) and sort them
    const allKeys = Object.keys(events);
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
            weekendCell.textContent = (events[key] || []).filter(e => e.label === 'cityWide').map(e => e.name).join(', ');
            row.appendChild(weekendCell);

            tableBody.appendChild(row);
        }
    });

    // Update month and year display
    monthYear.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
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
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vT8btU5R59fwA8BBsqKlvvT8TQu87YnIlscMjW6QhD5pF7FqUQ73SVjRe7AARUm04nuQieJ-hC0h_DO/pub?gid=76654142&single=true&output=csv');
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));

        const eventsData = {};

        rows.slice(1).forEach(row => {
            console.log('Processing row:', row);

            // Extract relevant columns
            const [eventDateStr, ruhNames, sphSchNames, cityWide] = row.slice(0, 4);
            const eventDate = new Date(eventDateStr);
            eventDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

            // Convert to key format
            const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

            if (!eventsData[key]) {
                eventsData[key] = [];
            }

            // Push names to the corresponding date
            if (ruhNames) {
                eventsData[key].push({ label: 'ruhNames', name: ruhNames });
            }
            if (sphSchNames) {
                eventsData[key].push({ label: 'sphSchNames', name: sphSchNames });
            }
            if (cityWide) {
                eventsData[key].push({ label: 'cityWide', name: cityWide });
            }
        });

        console.log('Fetched Events:', eventsData);
        events = eventsData; // Store globally
        return { events };

    } catch (error) {
        console.error('Error fetching data:', error);
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

// Function to update calendar and table view
async function updateCalendar() {
    await fetchEvents(); // Fetch events from Google Sheets
    generateCalendar(currentYear, currentMonth); // Update calendar display
    generateTable(events); // Update table display
}

// Toggle view function
document.getElementById('toggle-view').addEventListener('click', function() {
    const calendarView = document.getElementById('calendar-view');
    const tableView = document.getElementById('table-view');
    if (calendarView.style.display === 'none') {
        calendarView.style.display = 'block';
        tableView.style.display = 'none';
        updateCalendar(); // Generate calendar when switched to calendar view
    } else {
        calendarView.style.display = 'none';
        tableView.style.display = 'block';
        generateTable(events); // Generate table when switched to table view
    }
});

// Initial call to fetch events and generate calendar
updateCalendar();

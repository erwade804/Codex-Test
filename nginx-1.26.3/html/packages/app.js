window.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Call the API (placeholder)
        await fetchCSV();

        // 2. Load the CSV file automatically
        const csvResponse = await fetch('../data/packages.csv'); // must be in the same folder
        const csvText = await csvResponse.text();

        // 3. Parse CSV
        const data = csvText.trim().split('\n').map(row => row.split(','));

        // helper: parse "YYYY-MM-DD HH:MM:SS" -> Date, and format as "Month Day, Year HH:MM am/pm"
        function formatTimestamp(ts) {
            if (!ts) return '';
            const [datePart, timePart] = ts.split(' ');
            if (!datePart || !timePart) return ts;
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);
            if ([year, month, day, hour, minute].some(v => Number.isNaN(v))) return ts;
            const d = new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0);
            const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
            const mon = monthNames[d.getMonth()];
            const dayNum = d.getDate();
            const yr = d.getFullYear();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            let hour12 = d.getHours() % 12;
            if (hour12 === 0) hour12 = 12;
            const period = d.getHours() >= 12 ? 'PM' : 'AM';
            return `${mon} ${dayNum}, ${yr} ${hour12}:${minutes} ${period}`;
        }

        // 4. Display in table
        const tableHeader = document.getElementById('tableHeader');
        const tableBody = document.getElementById('tableBody');

        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        // Header
        data[0].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        // find timestamp column index (case-insensitive)
        const timestampIndex = data[0].findIndex(h => String(h).trim().toLowerCase() === 'timestamp');

        // Body
        for (let i = 1; i < data.length; i++) {
            const tr = document.createElement('tr');
            data[i].forEach((cell, colIndex) => {
                const td = document.createElement('td');
                // format timestamp column
                if (colIndex === timestampIndex) {
                    td.textContent = formatTimestamp(cell);
                } else {
                    td.textContent = cell;
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        }

    } catch (err) {
        console.error('Error loading data:', err);
    }
});



async function fetchCSV() {
    const apiResponse = await fetch('http://ws-wh-ww:8000/copy');
    console.log('API response:', apiResponse);
} 
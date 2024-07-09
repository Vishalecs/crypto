const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';

const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-sSJwfiydQsCmQSZFheRLGoga"
    }
};

let cryptoData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: null, direction: 'asc' };
let searchTerm = '';

async function fetchCryptoData(retryCount = 3) {
    try {
        console.log("Fetching data from API...");
        const response = await fetch(url, options);
        console.log("Response status:", response.status);
        
        if (response.status === 429) {
            if (retryCount > 0) {
                console.error("Rate limit exceeded. Retrying in 60 seconds...");
                alert("Rate limit exceeded. Retrying in 60 seconds...");
                setTimeout(() => fetchCryptoData(retryCount - 1), 60000); // Retry after 60 seconds
            } else {
                console.error("Rate limit exceeded. Please try again later.");
                alert("Rate limit exceeded. Please try again later.");
            }
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Data fetched successfully:", result);
        cryptoData = result;
        displayCryptoData(currentPage, getFilteredAndSortedData());
        setupPagination(cryptoData);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to fetch data. Please try again later.");
    }
}

function getFilteredAndSortedData() {
    let filteredData = cryptoData.filter(crypto => crypto.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (currentSort.column) {
        filteredData.sort((a, b) => {
            let aValue, bValue;

            if (currentSort.column === 'price') {
                aValue = a.current_price;
                bValue = b.current_price;
            } else if (currentSort.column === 'volume') {
                aValue = a.total_volume;
                bValue = b.total_volume;
            }

            if (currentSort.direction === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
    }
    
    return filteredData;
}

function displayCryptoData(page, data) {
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = ''; 

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach((crypto, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', crypto.id); // Set data attribute with crypto id
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td><img src="${crypto.image}" alt="${crypto.name}" width="20"></td>
            <td>${crypto.name}</td>
            <td>${crypto.current_price}</td>
            <td>${crypto.total_volume}</td>
            <td>${crypto.market_cap}</td>
            <td><i class="fav-icon ${checkFavorite(crypto.id) ? 'fas' : 'far'} fa-star" data-id="${crypto.id}"></i></td>
        `;
        tableBody.appendChild(row);

        // Add click event listener to the entire row except the favorite column
        row.querySelectorAll('td:not(:last-child)').forEach(cell => {
            cell.addEventListener('click', () => {
                navigateToCoinDetail(crypto.id);
            });
        });

        // Add click event listener to the favorite icon
        const favIcon = row.querySelector('.fav-icon');
        favIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event from bubbling up to the row
            toggleFavorite(crypto.id, favIcon);
        });
    });
}

function setupPagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const pageCount = Math.ceil(data.length / rowsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-btn');
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => {
            currentPage = i;
            displayCryptoData(currentPage, getFilteredAndSortedData());
            document.querySelector('.pagination-btn.active').classList.remove('active');
            button.classList.add('active');
        });
        pagination.appendChild(button);
    }
}

function checkFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(id);
}

function toggleFavorite(id, iconElement) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(id)) {
        favorites = favorites.filter(fav => fav !== id);
        iconElement.classList.remove('fas');
        iconElement.classList.add('far');
    } else {
        favorites.push(id);
        iconElement.classList.remove('far');
        iconElement.classList.add('fas');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function navigateToCoinDetail(id) {
    window.location.href = `coin.html?id=${id}`;
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    displayCryptoData(currentPage, getFilteredAndSortedData());
    setupPagination(getFilteredAndSortedData());
}

document.getElementById('search-box').addEventListener('input', (event) => {
    searchTerm = event.target.value;
    currentPage = 1;
    displayCryptoData(currentPage, getFilteredAndSortedData());
    setupPagination(getFilteredAndSortedData());
});

// Event listeners for sorting
document.getElementById('price-header').addEventListener('click', () => sortTable('price'));
document.getElementById('volume-header').addEventListener('click', () => sortTable('volume'));

// Fetch and display crypto data on page load
fetchCryptoData();

const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo-api_key=CG-sSJwfiydQsCmQSZFheRLGoga';

async function fetchCryptoData(retryCount = 3) {
    try {
        const response = await fetch(url);
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
        
        const result = await response.json();
        displayFavoriteCryptoData(result);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to fetch data. Please try again later.");
    }
}

function displayFavoriteCryptoData(data) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteCryptos = data.filter(crypto => favorites.includes(crypto.id));
    
    const favoritesTableBody = document.getElementById('favorites-table-body');
    favoritesTableBody.innerHTML = ''; // Clear existing content
    
    favoriteCryptos.forEach((crypto, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', crypto.id); // Set data attribute with crypto id
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${crypto.image}" alt="${crypto.name}" width="20"></td>
            <td>${crypto.name}</td>
            <td>${crypto.current_price}</td>
            <td>${crypto.total_volume}</td>
            <td>${crypto.market_cap}</td>
            <td><i class="fav-icon ${checkFavorite(crypto.id) ? 'fas' : 'far'} fa-star" data-id="${crypto.id}"></i></td>
        `;
        favoritesTableBody.appendChild(row);

        // Add click event listener to the row excluding the favorites column
        row.addEventListener('click', (event) => {
            if (!event.target.classList.contains('fav-icon')) {
                navigateToCoinDetail(crypto.id);
            }
        });
    });

    // Add event listeners to favorite icons
    document.querySelectorAll('.fav-icon').forEach(icon => {
        icon.addEventListener('click', (event) => {
            const cryptoId = event.target.getAttribute('data-id');
            toggleFavorite(cryptoId, event.target);
            event.stopPropagation(); // Prevent row click event
        });
    });
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
    
    // Update display immediately after toggling favorite
    fetchCryptoData();
}

function navigateToCoinDetail(id) {
    window.location.href = `coin.html?id=${id}`;
}

// Fetch and display favorite crypto data on page load
fetchCryptoData();

let cryptoId = null;
let coinChart = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    cryptoId = urlParams.get('id');

    if (cryptoId) {
        fetchCryptoDetails(cryptoId);
        fetchChartData(cryptoId, 30); // Default to 30 days
    } else {
        console.error('Cryptocurrency ID not provided.');
    }
});

async function fetchCryptoDetails(id) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch cryptocurrency detail. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Cryptocurrency detail fetched successfully:", data);
        displayCryptoDetails(data);
    } catch (error) {
        console.error("Failed to fetch cryptocurrency detail:", error);
    }
}

function displayCryptoDetails(crypto) {
    document.title = `${crypto.name} - Crypto Tracker`; // Change the title dynamically

    const cryptoDetail = document.getElementById('crypto-detail');
    cryptoDetail.innerHTML = `
        <div class="crypto-card">
            <img src="${crypto.image.large}" alt="${crypto.name}" class="crypto-image">
            <div class="crypto-info">
                <h2>${crypto.name} (${crypto.symbol.toUpperCase()})</h2>
                <p>Description: ${crypto.description.en.split(".")[0]}</p>
                <p>Market Cap: $${crypto.market_data.market_cap.usd.toLocaleString()}</p>
                <p>Current Price: $${crypto.market_data.current_price.usd}</p>
                <p>24h Volume: $${crypto.market_data.total_volume.usd.toLocaleString()}</p>
            </div>
        </div>
    `;
}

async function fetchChartData(coinId, days) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chart data. Status: ${response.status}`);
        }
        const chartData = await response.json();
        updateChart(chartData.prices);
    } catch (error) {
        console.error("Error while fetching chart data", error);
    }
}

function updateChart(prices) {
    const labels = prices.map(price => new Date(price[0]).toLocaleDateString());
    const data = prices.map(price => price[1]);

    const ctx = document.getElementById('coinChart').getContext('2d');
    
    if (coinChart) {
        coinChart.destroy();
    }

    coinChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price (USD)',
                data: data,
                borderWidth: 1,
                borderColor: '#eebc1d',
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

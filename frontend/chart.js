let currentChart = null; // chart global

export function renderChart(ctx, months, pokok, bunga, penalti) {
  if (currentChart) currentChart.destroy(); // hapus chart lama sebelum buat baru

  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Pokok',
          data: pokok,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        },
        {
          label: 'Bunga',
          data: bunga,
          backgroundColor: 'rgba(255, 99, 132, 0.6)'
        },
        {
          label: 'Penalti',
          data: penalti,
          backgroundColor: 'rgba(255, 206, 86, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Estimasi Komposisi Pokok vs Bunga per Bulan' },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  window.currentChart = currentChart;

}

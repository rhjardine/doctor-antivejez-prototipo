// Lógica específica para la página del Dashboard (gráficos, etc.)
function initDashboardPage() {
    console.log("Inicializando página: Dashboard");
    
    // Por ahora, solo inicializamos un gráfico de ejemplo
    const ctx = document.getElementById('activePatientsChart')?.getContext('2d');
    if (!ctx) return;

    // Datos simulados
    const labels = ['Q1 \'23', 'Q2 \'23', 'Q3 \'23', 'Q4 \'23', 'Q1 \'24'];
    const data = {
        labels: labels,
        datasets: [{
            label: 'Pacientes Activos',
            data: [70, 90, 109, 120, 126],
            fill: true,
            borderColor: 'rgb(35, 188, 239)',
            backgroundColor: 'rgba(35, 188, 239, 0.2)',
            tension: 0.3
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
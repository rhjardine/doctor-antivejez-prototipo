
// Variables del dashboard
let dashboardStats = null;
let chartData = null;
let chartsInitialized = false;

// ===== INICIALIZACIÓN DEL DASHBOARD =====
async function initDashboard() {
    console.log('📊 Inicializando Dashboard...');
    
    try {
        // Cargar estadísticas
        await loadDashboardStats();
        
        // Cargar datos de gráficos
        await loadChartData();
        
        // Inicializar gráficos
        initializeCharts();
        
        // Configurar eventos
        setupDashboardEvents();
        
        console.log('✅ Dashboard inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
        showDashboardError(error.message);
    }
}

// ===== CARGA DE ESTADÍSTICAS =====
async function loadDashboardStats() {
    try {
        const response = await EstadisticasAPI.getDashboardStats();
        
        if (response.success) {
            dashboardStats = response.data;
            updateStatsCards(dashboardStats);
        } else {
            throw new Error('No se pudieron cargar las estadísticas');
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar datos de ejemplo en caso de error
        const statsEjemplo = {
            totalPacientes: 511,
            pacientesNuevos: 43,
            edadBiologicaPromedio: 52.3,
            totalTests: 156
        };
        updateStatsCards(statsEjemplo);
    }
}

// ===== ACTUALIZACIÓN DE TARJETAS DE ESTADÍSTICAS =====
function updateStatsCards(stats) {
    const cards = [
        {
            selector: '.stat-card:nth-child(1) .stat-value',
            value: stats.edadBiologicaPromedio,
            suffix: ''
        },
        {
            selector: '.stat-card:nth-child(2) .stat-value',
            value: stats.totalPacientes,
            suffix: ''
        },
        {
            selector: '.stat-card:nth-child(3) .stat-value',
            value: stats.pacientesNuevos,
            suffix: ''
        }
    ];

    cards.forEach(card => {
        const element = document.querySelector(card.selector);
        if (element) {
            element.textContent = card.value + card.suffix;
        }
    });

    // Actualizar títulos de las tarjetas también
    const titles = document.querySelectorAll('.stat-card h3');
    if (titles.length >= 3) {
        titles[0].textContent = 'Edad Biológica Promedio';
        titles[1].textContent = 'Pacientes Registrados';
        titles[2].textContent = 'Nuevos Registros';
    }
}

// ===== CARGA DE DATOS DE GRÁFICOS =====
async function loadChartData() {
    try {
        const response = await EstadisticasAPI.getChartData();
        
        if (response.success) {
            chartData = response.data;
        } else {
            throw new Error('No se pudieron cargar los datos de gráficos');
        }
    } catch (error) {
        console.error('Error cargando datos de gráficos:', error);
        // Datos de ejemplo para los gráficos
        chartData = {
            pacientesActivos: [
                { periodo: 'Q1 23', activos: 70, oncoardio: 50 },
                { periodo: 'Q2 23', activos: 85, oncoardio: 60 },
                { periodo: 'Q3 23', activos: 95, oncoardio: 70 },
                { periodo: 'Q4 23', activos: 110, oncoardio: 85 },
                { periodo: 'Q1 24', activos: 125, oncoardio: 95 }
            ],
            edadBiologica: {
                cronologica: [40, 45, 50, 55, 60, 65, 70, 75],
                biologica: [35, 42, 48, 52, 55, 58, 62, 68]
            },
            distribucionPorGrupos: [
                { grupo: '20-30', pacientes: 15 },
                { grupo: '30-40', pacientes: 25 },
                { grupo: '40-50', pacientes: 30 },
                { grupo: '50-60', pacientes: 20 },
                { grupo: '60+', pacientes: 10 }
            ]
        };
    }
}

// ===== INICIALIZACIÓN DE GRÁFICOS =====
function initializeCharts() {
    if (chartsInitialized) return;
    
    try {
        // Gráfico de Pacientes Activos
        createPacientesActivosChart();
        
        // Gráfico de Edad Biológica vs Cronológica
        createEdadBiologicaChart();
        
        // Gráfico de Evolución de Edad Biológica
        createEvolucionChart();
        
        // Gráfico de Comparación por Grupos
        createComparacionChart();
        
        chartsInitialized = true;
        console.log('📈 Gráficos inicializados');
        
    } catch (error) {
        console.error('Error inicializando gráficos:', error);
    }
}

// ===== GRÁFICO DE PACIENTES ACTIVOS =====
function createPacientesActivosChart() {
    const chartContainer = document.querySelector('.chart-card:first-child .chart-placeholder');
    if (!chartContainer || !chartData) return;

    const canvas = document.createElement('canvas');
    canvas.width = chartContainer.offsetWidth;
    canvas.height = 300;
    
    chartContainer.innerHTML = '';
    chartContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Datos para el gráfico
    const data = chartData.pacientesActivos;
    const maxValue = Math.max(...data.map(d => Math.max(d.activos, d.oncoardio)));
    
    // Configuración del gráfico
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Dibujar fondo del gráfico
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Dibujar líneas de la cuadrícula
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
    
    // Dibujar datos
    const stepX = chartWidth / (data.length - 1);
    
    // Línea de pacientes activos
    ctx.strokeStyle = '#4789FF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((item, index) => {
        const x = padding + index * stepX;
        const y = padding + chartHeight - (item.activos / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Línea de oncoardio
    ctx.strokeStyle = '#2ECCBC';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((item, index) => {
        const x = padding + index * stepX;
        const y = padding + chartHeight - (item.oncoardio / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Puntos en las líneas
    data.forEach((item, index) => {
        const x = padding + index * stepX;
        
        // Punto activos
        const yActivos = padding + chartHeight - (item.activos / maxValue) * chartHeight;
        ctx.fillStyle = '#4789FF';
        ctx.beginPath();
        ctx.arc(x, yActivos, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Punto oncoardio
        const yOncoardio = padding + chartHeight - (item.oncoardio / maxValue) * chartHeight;
        ctx.fillStyle = '#2ECCBC';
        ctx.beginPath();
        ctx.arc(x, yOncoardio, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Labels en el eje X
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    data.forEach((item, index) => {
        const x = padding + index * stepX;
        ctx.fillText(item.periodo, x, canvas.height - 10);
    });
    
    // Labels en el eje Y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue / 5) * (5 - i));
        const y = padding + (chartHeight / 5) * i + 4;
        ctx.fillText(value.toString(), padding - 10, y);
    }
}

// ===== OTROS GRÁFICOS (SIMPLIFICADOS) =====
function createEdadBiologicaChart() {
    const charts = document.querySelectorAll('.chart-card');
    if (charts.length < 2) return;
    
    const chartContainer = charts[1].querySelector('.chart-placeholder');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #4789FF 0%, #2ECCBC 100%);
            height: 100%;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
        ">
            📊 Gráfico de Edad Biológica vs Cronológica
        </div>
    `;
}

function createEvolucionChart() {
    // Implementación simplificada para el tercer gráfico
    const allCharts = document.querySelectorAll('.chart-placeholder');
    if (allCharts.length < 3) return;
    
    const chartContainer = allCharts[2];
    if (!chartContainer) return;
    
    chartContainer.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
            height: 100%;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
        ">
            📈 Evolución Edad Biológica
        </div>
    `;
}

function createComparacionChart() {
    // Implementación simplificada para el cuarto gráfico
    const allCharts = document.querySelectorAll('.chart-placeholder');
    if (allCharts.length < 4) return;
    
    const chartContainer = allCharts[3];
    if (!chartContainer) return;
    
    chartContainer.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #F39C12 0%, #E67E22 100%);
            height: 100%;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
        ">
            📊 Comparación por Grupos
        </div>
    `;
}

// ===== CONFIGURACIÓN DE EVENTOS =====
function setupDashboardEvents() {
    // Evento para el filtro de tiempo
    const timeFilter = document.querySelector('.chart-filter');
    if (timeFilter) {
        timeFilter.addEventListener('change', (e) => {
            const selectedPeriod = e.target.value;
            console.log('Filtro de tiempo cambiado:', selectedPeriod);
            
            // Aquí se recargarían los datos según el período seleccionado
            window.toastManager.info(
                'Filtro aplicado',
                `Mostrando datos para: ${selectedPeriod}`,
                2000
            );
        });
    }

    // Eventos para las tarjetas de estadísticas (clicks para más detalles)
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const cardTitles = ['Edad Biológica', 'Pacientes', 'Nuevos Registros'];
            const title = cardTitles[index] || 'Estadística';
            
            window.toastManager.info(
                `Detalle de ${title}`,
                'Funcionalidad de detalle en desarrollo',
                3000
            );
        });
        
        // Agregar efecto hover
        card.style.cursor = 'pointer';
    });

    // Eventos para los gráficos
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach((chart, index) => {
        chart.addEventListener('click', () => {
            const chartTitles = ['Pacientes Activos', 'Edad Biológica', 'Evolución', 'Comparación'];
            const title = chartTitles[index] || 'Gráfico';
            
            window.toastManager.info(
                `Gráfico de ${title}`,
                'Click para ver en pantalla completa (próximamente)',
                3000
            );
        });
    });

    // Actualización automática cada 5 minutos
    setInterval(() => {
        if (window.router.getCurrentRoute() === 'dashboard') {
            console.log('🔄 Actualizando datos del dashboard...');
            loadDashboardStats();
        }
    }, 5 * 60 * 1000); // 5 minutos
}

// ===== MANEJO DE ERRORES =====
function showDashboardError(message) {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;
    
    appRoot.innerHTML = `
        <div class="error-container" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: #f39c12;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1.5rem;
                color: white;
                font-size: 2rem;
            ">
                📊
            </div>
            <h2 style="color: #f39c12; margin-bottom: 1rem;">Error en Dashboard</h2>
            <p style="color: #6b7280; margin-bottom: 1.5rem; max-width: 500px;">
                ${message}
            </p>
            <div style="display: flex; gap: 1rem;">
                <button onclick="initDashboard()" style="
                    padding: 0.75rem 1.5rem;
                    background: #4789ff;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    🔄 Reintentar
                </button>
                <button onclick="goToHistorias()" style="
                    padding: 0.75rem 1.5rem;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    📋 Ir a Historias
                </button>
            </div>
        </div>
    `;
}

// ===== FUNCIONES PÚBLICAS =====

// Función para refrescar el dashboard
function refreshDashboard() {
    if (window.router.getCurrentRoute() === 'dashboard') {
        initDashboard();
    }
}

// Función para obtener estadísticas actuales
function getCurrentStats() {
    return dashboardStats;
}

// Función para obtener datos de gráficos
function getCurrentChartData() {
    return chartData;
}

// Exportar funciones para uso global
window.initDashboard = initDashboard;
window.refreshDashboard = refreshDashboard;
window.getCurrentStats = getCurrentStats;
window.getCurrentChartData = getCurrentChartData;

console.log('📊 Dashboard.js cargado correctamente');
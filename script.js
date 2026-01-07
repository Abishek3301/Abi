// Global variables
let currentPage = 'landing';
let sensorData = {
    temperature: 50.0,
    vibration: 2.5,
    pressure: 125.0,
    rpm: 2000
};
let sensorHistory = [];
let alerts = [];
let maintenanceHistory = [];
let currentPrediction = null;
let charts = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check current page
    const path = window.location.pathname;
    if (path.includes('dashboard.html')) {
        currentPage = 'dashboard';
        initializeDashboard();
    } else if (path.includes('login.html')) {
        currentPage = 'login';
        initializeLogin();
    } else {
        currentPage = 'landing';
        initializeLanding();
    }
}

// Landing page initialization
function initializeLanding() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .stat-item').forEach(card => {
        observer.observe(card);
    });
}

// Login page initialization
function initializeLogin() {
    // Toggle between login and signup (don't override HTML defaults)
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Event listeners for toggling
    loginToggle.addEventListener('click', function() {
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    });

    signupToggle.addEventListener('click', function() {
        signupToggle.classList.add('active');
        loginToggle.classList.remove('active');
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Password toggle functionality
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                targetInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const btn = e.target.querySelector('.auth-btn');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');

    // Show loading
    btnText.style.display = 'none';
    loader.style.display = 'flex';

    // Simulate authentication delay
    setTimeout(() => {
        // Check credentials
        const users = JSON.parse(localStorage.getItem('predixai_users') || '[]');
        const validUser = users.find(user => user.email === email && user.password === password);

        // Reset button
        btnText.style.display = 'flex';
        loader.style.display = 'none';

        if (validUser) {
            // Store current user session
            localStorage.setItem('predixai_current_user', JSON.stringify(validUser));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error
            alert('Invalid email or password. Please try again.');
        }
    }, 1500);
}

function handleSignup(e) {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const company = document.getElementById('signup-company').value;
    const termsAgreed = document.getElementById('terms-agree').checked;

    // Validate password confirmation
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    if (!termsAgreed) {
        alert('Please agree to the Terms & Conditions to continue.');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('predixai_users') || '[]');
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        alert('An account with this email already exists. Please use a different email or try logging in.');
        return;
    }

    const btn = e.target.querySelector('.auth-btn');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');

    // Show loading
    btnText.style.display = 'none';
    loader.style.display = 'flex';

    // Simulate signup delay
    setTimeout(() => {
        // Create new user account
        const newUser = {
            id: Date.now(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password, // In a real app, this would be hashed
            company: company,
            createdAt: new Date().toISOString()
        };

        // Store user
        users.push(newUser);
        localStorage.setItem('predixai_users', JSON.stringify(users));

        // Reset button
        btnText.style.display = 'flex';
        loader.style.display = 'none';

        // Show success message and switch to login tab
        alert('Account created successfully! You can now log in with your credentials.');

        // Switch to login tab automatically
        const loginToggle = document.getElementById('login-toggle');
        const signupToggle = document.getElementById('signup-toggle');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }, 1500);
}

function handleContact(e) {
    e.preventDefault();

    const btn = e.target.querySelector('.btn-primary');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');

    // Show loading
    btnText.style.display = 'none';
    loader.style.display = 'flex';

    // Simulate contact form submission (demo)
    setTimeout(() => {
        // Reset button
        btnText.style.display = 'flex';
        loader.style.display = 'none';

        // Show success message and reset form
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        e.target.reset();
    }, 1500);
}

// Dashboard initialization
function initializeDashboard() {
    console.log('Initializing dashboard...');

    try {
        // Check if user is logged in
        const currentUser = JSON.parse(localStorage.getItem('predixai_current_user') || 'null');
        if (!currentUser) {
            console.log('No user logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        console.log('User logged in:', currentUser.firstName);

        // Initialize sample maintenance history if empty
        initializeSampleMaintenanceHistory();

        // Load maintenance history from localStorage
        loadMaintenanceHistoryFromStorage();

        // Display current user name
        displayCurrentUser();

        // Initialize sidebar navigation
        initializeSidebar();

        // Initialize sensors
        initializeSensors();

        // Initialize charts
        initializeCharts();

        // Load initial data (non-blocking)
        setTimeout(() => {
            console.log('Loading initial data...');
            refreshData();
        }, 100);

        // Set up auto-refresh every 30 seconds
        setInterval(refreshData, 30000);

        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error loading dashboard. Please try logging in again.');
        window.location.href = 'login.html';
    }
}

// Initialize maintenance history with sample data if empty
function initializeSampleMaintenanceHistory() {
    const existingHistory = localStorage.getItem('predixai_maintenance_history');
    let currentHistory = [];

    if (existingHistory) {
        try {
            currentHistory = JSON.parse(existingHistory);
        } catch (e) {
            console.error('Error parsing existing maintenance history:', e);
            currentHistory = [];
        }
    }

    // Always ensure we have at least some sample data for demo purposes
    if (currentHistory.length === 0) {
        const sampleHistory = [
            {
                id: 1,
                machineName: "Pump Station A",
                machineHealth: "Warning",
                predictedRUL: 450,
                maintenanceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
                maintenanceType: "Preventive Maintenance",
                priority: "Medium",
                assignedEngineer: "John Smith",
                notes: "Regular inspection and lubrication of bearings",
                status: "scheduled",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 2,
                machineName: "Conveyor Belt B",
                machineHealth: "Critical",
                predictedRUL: 120,
                maintenanceDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                maintenanceType: "Emergency Repair",
                priority: "High",
                assignedEngineer: "Sarah Johnson",
                notes: "Replace worn drive belt and check motor alignment",
                status: "scheduled",
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 3,
                machineName: "Cooling Fan C",
                machineHealth: "Healthy",
                predictedRUL: 780,
                maintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
                maintenanceType: "Routine Inspection",
                priority: "Low",
                assignedEngineer: "Mike Davis",
                notes: "Clean fan blades and check motor bearings",
                status: "completed",
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 4,
                machineName: "Pressure Valve D",
                machineHealth: "Warning",
                predictedRUL: 320,
                maintenanceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
                maintenanceType: "Calibration",
                priority: "Medium",
                assignedEngineer: "Lisa Chen",
                notes: "Recalibrate pressure sensor and check valve operation",
                status: "completed",
                createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
                completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 5,
                machineName: "Motor Assembly E",
                machineHealth: "Critical",
                predictedRUL: 85,
                maintenanceDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
                maintenanceType: "Overhaul",
                priority: "High",
                assignedEngineer: "David Wilson",
                notes: "Complete motor disassembly, inspection, and reassembly",
                status: "scheduled",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 6,
                machineName: "Gearbox F",
                machineHealth: "Healthy",
                predictedRUL: 650,
                maintenanceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
                maintenanceType: "Oil Change",
                priority: "Low",
                assignedEngineer: "Tom Anderson",
                notes: "Change gearbox oil and inspect for leaks",
                status: "completed",
                createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
                completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                scheduledDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ];

        localStorage.setItem('predixai_maintenance_history', JSON.stringify(sampleHistory));
        console.log('Sample maintenance history initialized with', sampleHistory.length, 'records');
        maintenanceHistory = sampleHistory;
    }
}

function loadMaintenanceHistoryFromStorage() {
    const storedHistory = localStorage.getItem('predixai_maintenance_history');
    if (storedHistory) {
        maintenanceHistory = JSON.parse(storedHistory);
    }
}

function displayCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('predixai_current_user') || '{}');
    const userNameElement = document.getElementById('current-user-name');

    if (currentUser && currentUser.firstName && currentUser.lastName) {
        userNameElement.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    } else if (currentUser && currentUser.name) {
        userNameElement.textContent = currentUser.name;
    } else {
        userNameElement.textContent = 'Demo User';
    }
}

function initializeSidebar() {
    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'machines': 'Machine Management',
        'sensors': 'Sensor Management',
        'upload': 'Data Upload & Analysis',
        'predictions': 'AI Predictions',
        'alerts': 'System Alerts',
        'maintenance': 'Schedule Maintenance',
        'history': 'Maintenance History',
        'reports': 'Maintenance Reports'
    };

    const subtitles = {
        'overview': 'Monitor your equipment health in real-time',
        'machines': 'Add, edit, and monitor different machines and equipment',
        'sensors': 'Control and monitor sensor readings',
        'upload': 'Upload sensor data files for AI analysis and predictions',
        'predictions': 'AI-powered maintenance predictions',
        'alerts': 'View system alerts and notifications',
        'maintenance': 'Plan and schedule maintenance activities',
        'history': 'View scheduled and completed maintenance',
        'reports': 'Generate maintenance reports'
    };

    document.getElementById('page-title').textContent = titles[tabName] || 'Dashboard';
    document.getElementById('page-subtitle').textContent = subtitles[tabName] || '';

    // Show/hide tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load tab-specific data
    loadTabData(tabName);

    // Update current machine name in header if switching away from machines tab
    if (tabName !== 'machines') {
        const currentMachine = getCurrentMachine();
        if (currentMachine) {
            document.getElementById('current-machine-name').textContent = currentMachine.name;
        }
    }
}

function loadTabData(tabName) {
    console.log('Loading tab data for:', tabName);
    switch(tabName) {
        case 'alerts':
            loadAlerts();
            initializeAlertFilters();
            break;
        case 'upload':
            initializeUploadTab();
            break;
        case 'maintenance':
            initializeMaintenanceForm();
            break;
        case 'history':
            loadMaintenanceHistory();
            initializeHistoryFilters();
            break;
        case 'machines':
            loadMachines();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function initializeAlertFilters() {
    // Add event listeners to filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Reload alerts with new filter
            loadAlerts();
        });
    });
}

function initializeSensors() {
    // Temperature slider
    const tempSlider = document.getElementById('temp-slider');
    const tempValue = document.getElementById('temp-value');
    tempSlider.addEventListener('input', function() {
        sensorData.temperature = parseFloat(this.value);
        tempValue.textContent = sensorData.temperature.toFixed(1);
        updateSensorChart('temp', sensorData.temperature);
    });

    // Vibration slider
    const vibSlider = document.getElementById('vib-slider');
    const vibValue = document.getElementById('vib-value');
    vibSlider.addEventListener('input', function() {
        sensorData.vibration = parseFloat(this.value);
        vibValue.textContent = sensorData.vibration.toFixed(1);
        updateSensorChart('vib', sensorData.vibration);
    });

    // Pressure slider
    const pressSlider = document.getElementById('press-slider');
    const pressValue = document.getElementById('press-value');
    pressSlider.addEventListener('input', function() {
        sensorData.pressure = parseFloat(this.value);
        pressValue.textContent = sensorData.pressure.toFixed(1);
        updateSensorChart('press', sensorData.pressure);
    });

    // RPM slider
    const rpmSlider = document.getElementById('rpm-slider');
    const rpmValue = document.getElementById('rpm-value');
    rpmSlider.addEventListener('input', function() {
        sensorData.rpm = parseInt(this.value);
        rpmValue.textContent = sensorData.rpm;
        updateSensorChart('rpm', sensorData.rpm);
    });
}

function initializeCharts() {
    // Trends chart
    const trendsCtx = document.getElementById('trends-chart').getContext('2d');
    charts.trends = new Chart(trendsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }, {
                label: 'Vibration (mm/s)',
                data: [],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
            }, {
                label: 'Pressure (PSI)',
                data: [],
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                tension: 0.4
            }, {
                label: 'RPM',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    // Risk chart
    const riskCtx = document.getElementById('risk-chart').getContext('2d');
    charts.risk = new Chart(riskCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Failure Risk (%)',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    // Individual sensor charts
    const sensorCharts = ['temp', 'vib', 'press', 'rpm'];
    sensorCharts.forEach(sensor => {
        const ctx = document.getElementById(`${sensor}-chart`).getContext('2d');
        charts[sensor] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: getSensorLabel(sensor),
                    data: [],
                    borderColor: getSensorColor(sensor),
                    backgroundColor: getSensorColor(sensor, 0.1),
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        ticks: {
                            color: '#94a3b8',
                            maxTicksLimit: 5
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    });
}

function getSensorLabel(sensor) {
    const labels = {
        temp: 'Temperature (°C)',
        vib: 'Vibration (mm/s)',
        press: 'Pressure (PSI)',
        rpm: 'RPM'
    };
    return labels[sensor] || sensor;
}

function getSensorColor(sensor, alpha = 1) {
    const colors = {
        temp: `rgba(239, 68, 68, ${alpha})`,
        vib: `rgba(245, 158, 11, ${alpha})`,
        press: `rgba(6, 182, 212, ${alpha})`,
        rpm: `rgba(16, 185, 129, ${alpha})`
    };
    return colors[sensor] || `rgba(99, 102, 241, ${alpha})`;
}

// API functions
async function sendSensorData() {
    showLoading();

    try {
        const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sensorData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        currentPrediction = result;

        // Generate individual sensor predictions
        const sensorPredictions = generateIndividualSensorPredictions(sensorData);

        // Update UI
        updateOverview(result);
        updatePredictions(result, sensorPredictions);

        // Update current machine health status
        const currentMachine = getCurrentMachine();
        if (currentMachine) {
            updateMachineHealthStatus(currentMachine.id, result);
            // Refresh machine stats after updating health status
            const machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');
            updateMachineStats(machines);

            // If machines tab is active, refresh the display
            if (document.getElementById('machines-tab') && document.getElementById('machines-tab').classList.contains('active')) {
                loadMachines();
            }
        }

        // Add to history
        sensorHistory.push({
            timestamp: new Date().toISOString(),
            sensorData: { ...sensorData },
            prediction: result,
            sensorPredictions: sensorPredictions
        });

        // Update charts
        updateTrendsChart();
        updateRiskChart();

        // Check for alerts based on sensor readings and predictions
        checkSensorAlerts(sensorData, result, sensorPredictions);

    } catch (error) {
        console.error('Backend not available, using mock data:', error);

        // Generate mock prediction data based on sensor readings
        const mockResult = generateMockPrediction(sensorData);
        const sensorPredictions = generateIndividualSensorPredictions(sensorData);
        currentPrediction = mockResult;

        // Update UI with mock data
        updateOverview(mockResult);
        updatePredictions(mockResult, sensorPredictions);

        // Add to history
        sensorHistory.push({
            timestamp: new Date().toISOString(),
            sensorData: { ...sensorData },
            prediction: mockResult,
            sensorPredictions: sensorPredictions
        });

        // Update charts
        updateTrendsChart();
        updateRiskChart();

        // Check for alerts based on sensor readings and predictions
        checkSensorAlerts(sensorData, mockResult, sensorPredictions);
    } finally {
        hideLoading();
    }
}

function generateIndividualSensorPredictions(sensorData) {
    const predictions = {};

    // Temperature prediction
    predictions.temperature = generateSensorPrediction(
        'temperature',
        sensorData.temperature,
        { optimal: [40, 70], warning: [35, 75], critical: [75, 100] },
        'Temperature monitoring system',
        'Check cooling system and ventilation',
        'Temperature exceeds safe operating limits'
    );

    // Vibration prediction
    predictions.vibration = generateSensorPrediction(
        'vibration',
        sensorData.vibration,
        { optimal: [0, 3], warning: [3, 5], critical: [5, 10] },
        'Vibration monitoring system',
        'Inspect bearings and mounting components',
        'Excessive vibration detected, potential mechanical failure'
    );

    // Pressure prediction
    predictions.pressure = generateSensorPrediction(
        'pressure',
        sensorData.pressure,
        { optimal: [100, 150], warning: [90, 160], critical: [160, 200] },
        'Pressure monitoring system',
        'Check pressure relief valves and pump performance',
        'Pressure levels outside safe operating range'
    );

    // RPM prediction
    predictions.rpm = generateSensorPrediction(
        'rpm',
        sensorData.rpm,
        { optimal: [1800, 2200], warning: [1700, 2300], critical: [2300, 2500] },
        'RPM monitoring system',
        'Check motor performance and load conditions',
        'RPM outside optimal operating range'
    );

    return predictions;
}

function generateSensorPrediction(sensorName, value, ranges, system, maintenance, alert) {
    let status = 'normal';
    let confidence = 0.95;
    let prediction = system;
    let recommendation = `Continue monitoring ${sensorName} levels.`;
    let riskLevel = 'low';

    // Determine status based on value ranges
    if (value >= ranges.critical[0]) {
        status = 'critical';
        confidence = 0.85;
        prediction = alert;
        recommendation = maintenance;
        riskLevel = 'high';
    } else if (value >= ranges.warning[0] && value <= ranges.warning[1] && (value < ranges.optimal[0] || value > ranges.optimal[1])) {
        status = 'warning';
        confidence = 0.75;
        prediction = `${sensorName.charAt(0).toUpperCase() + sensorName.slice(1)} levels require attention`;
        recommendation = `Monitor ${sensorName} closely and consider ${maintenance.toLowerCase()}`;
        riskLevel = 'medium';
    } else if (value >= ranges.optimal[0] && value <= ranges.optimal[1]) {
        status = 'normal';
        confidence = 0.95;
        prediction = `${system} operating normally`;
        recommendation = 'Continue routine maintenance schedule.';
        riskLevel = 'low';
    }

    // Calculate remaining useful life based on status
    let rul = 1000; // hours
    if (status === 'critical') {
        rul = Math.max(50, Math.floor(Math.random() * 200) + 50);
    } else if (status === 'warning') {
        rul = Math.max(200, Math.floor(Math.random() * 500) + 200);
    } else {
        rul = Math.max(500, Math.floor(Math.random() * 1000) + 500);
    }

    return {
        sensor: sensorName,
        value: value,
        status: status,
        confidence: confidence,
        prediction: prediction,
        recommendation: recommendation,
        riskLevel: riskLevel,
        rul: rul,
        timestamp: new Date().toISOString()
    };
}

function checkSensorAlerts(sensorData, prediction, sensorPredictions) {
    // Check individual sensor AI predictions for alerts

    // Temperature alerts based on AI prediction
    if (sensorPredictions.temperature.status === 'critical') {
        addSensorAlert('AI Temperature Analysis', sensorData.temperature,
            'critical', sensorPredictions.temperature.prediction,
            sensorPredictions.temperature.recommendation);
    } else if (sensorPredictions.temperature.status === 'warning') {
        addSensorAlert('AI Temperature Analysis', sensorData.temperature,
            'warning', sensorPredictions.temperature.prediction,
            sensorPredictions.temperature.recommendation);
    }

    // Vibration alerts based on AI prediction
    if (sensorPredictions.vibration.status === 'critical') {
        addSensorAlert('AI Vibration Analysis', sensorData.vibration,
            'critical', sensorPredictions.vibration.prediction,
            sensorPredictions.vibration.recommendation);
    } else if (sensorPredictions.vibration.status === 'warning') {
        addSensorAlert('AI Vibration Analysis', sensorData.vibration,
            'warning', sensorPredictions.vibration.prediction,
            sensorPredictions.vibration.recommendation);
    }

    // Pressure alerts based on AI prediction
    if (sensorPredictions.pressure.status === 'critical') {
        addSensorAlert('AI Pressure Analysis', sensorData.pressure,
            'critical', sensorPredictions.pressure.prediction,
            sensorPredictions.pressure.recommendation);
    } else if (sensorPredictions.pressure.status === 'warning') {
        addSensorAlert('AI Pressure Analysis', sensorData.pressure,
            'warning', sensorPredictions.pressure.prediction,
            sensorPredictions.pressure.recommendation);
    }

    // RPM alerts based on AI prediction
    if (sensorPredictions.rpm.status === 'critical') {
        addSensorAlert('AI RPM Analysis', sensorData.rpm,
            'critical', sensorPredictions.rpm.prediction,
            sensorPredictions.rpm.recommendation);
    } else if (sensorPredictions.rpm.status === 'warning') {
        addSensorAlert('AI RPM Analysis', sensorData.rpm,
            'warning', sensorPredictions.rpm.prediction,
            sensorPredictions.rpm.recommendation);
    }

    // Overall system alert if health is critical or warning
    if (prediction.health_status === 'Critical') {
        addSensorAlert('AI System Health', prediction.failure_risk,
            'critical', `System health critical: ${prediction.root_cause}`,
            prediction.recommendation);
    } else if (prediction.health_status === 'Warning') {
        addSensorAlert('AI System Health', prediction.failure_risk,
            'warning', `System health warning: ${prediction.root_cause}`,
            prediction.recommendation);
    }
}

function addSensorAlert(sensorType, value, severity, title, message) {
    // Check if similar alert already exists recently (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentAlert = alerts.find(alert =>
        alert.title.includes(sensorType) &&
        alert.severity === severity &&
        new Date(alert.timestamp) > fiveMinutesAgo
    );

    if (recentAlert) {
        return; // Don't add duplicate alerts
    }

    const alert = {
        id: Date.now(),
        severity: severity,
        title: `${sensorType}: ${title}`,
        message: `${message} (Current value: ${value})`,
        timestamp: new Date().toLocaleString(),
        sensorData: { ...sensorData }
    };

    alerts.unshift(alert);

    // Keep only last 10 alerts
    if (alerts.length > 10) {
        alerts = alerts.slice(0, 10);
    }

    updateAlertsBadge();
    loadAlerts();
}

function generateMockPrediction(sensorData) {
    // Calculate health score based on sensor readings
    let healthScore = 100;
    let rootCause = 'Normal operation';
    let recommendation = 'Continue normal operation. Schedule routine maintenance.';

    // Temperature check (optimal: 40-70°C)
    if (sensorData.temperature > 70) {
        healthScore -= Math.min(30, (sensorData.temperature - 70) * 2);
        rootCause = 'High temperature detected';
        recommendation = 'Check cooling system and ventilation.';
    } else if (sensorData.temperature < 40) {
        healthScore -= Math.min(20, (40 - sensorData.temperature));
        rootCause = 'Low temperature detected';
        recommendation = 'Check heating system.';
    }

    // Vibration check (optimal: 0-5 mm/s)
    if (sensorData.vibration > 5) {
        healthScore -= Math.min(25, (sensorData.vibration - 5) * 5);
        rootCause = 'High vibration levels';
        recommendation = 'Inspect bearings and mounting.';
    }

    // Pressure check (optimal: 100-150 PSI)
    if (sensorData.pressure > 150) {
        healthScore -= Math.min(20, (sensorData.pressure - 150) * 0.2);
        rootCause = 'High pressure detected';
        recommendation = 'Check pressure relief valves.';
    } else if (sensorData.pressure < 100) {
        healthScore -= Math.min(15, (sensorData.pressure - 100) * 0.3);
        rootCause = 'Low pressure detected';
        recommendation = 'Check pump performance.';
    }

    // RPM check (optimal: 1800-2200 RPM)
    if (sensorData.rpm > 2200) {
        healthScore -= Math.min(20, (sensorData.rpm - 2200) * 0.01);
        rootCause = 'High RPM detected';
        recommendation = 'Reduce load or check governor.';
    } else if (sensorData.rpm < 1800) {
        healthScore -= Math.min(15, (1800 - sensorData.rpm) * 0.02);
        rootCause = 'Low RPM detected';
        recommendation = 'Check power supply and load.';
    }

    // Determine health status
    let healthStatus = 'Healthy';
    if (healthScore < 70) {
        healthStatus = 'Warning';
    }
    if (healthScore < 40) {
        healthStatus = 'Critical';
    }

    const failureRisk = Math.max(0, Math.min(100, 100 - healthScore));

    return {
        health_status: healthStatus,
        failure_risk: Math.round(failureRisk),
        remaining_useful_life: Math.max(50, Math.round(healthScore * 10)),
        anomaly_detected: failureRisk > 20,
        anomaly_probability: failureRisk / 100,
        root_cause: rootCause,
        recommendation: recommendation,
        confidence: Math.max(0.1, healthScore / 100)
    };
}

async function refreshData() {
    // Send current sensor data for prediction
    await sendSensorData();

    // Add system check message to alerts every 30 seconds
    addSystemCheckAlert();
}

function addSystemCheckAlert() {
    const healthStatus = currentPrediction ? currentPrediction.health_status : 'Unknown';
    const failureRisk = currentPrediction ? currentPrediction.failure_risk : 0;

    const alert = {
        id: Date.now(),
        severity: healthStatus === 'Critical' ? 'critical' : healthStatus === 'Warning' ? 'warning' : 'info',
        title: `System Health: ${healthStatus}`,
        message: `Current health status: ${healthStatus}, Failure risk: ${failureRisk}%, Last checked: ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toLocaleString(),
        sensorData: { ...sensorData }
    };

    alerts.unshift(alert);

    // Keep only last 10 alerts
    if (alerts.length > 10) {
        alerts = alerts.slice(0, 10);
    }

    updateAlertsBadge();
    loadAlerts();
}

function updateOverview(prediction) {
    // Update health indicator
    const healthCircle = document.querySelector('.health-circle');
    const healthPercentage = document.getElementById('health-percentage');
    const healthLabel = document.getElementById('health-label');

    const healthPercent = Math.max(0, 100 - prediction.failure_risk);
    healthPercentage.textContent = Math.round(healthPercent);

    // Update health circle color
    let healthColor = '#10b981'; // green
    if (prediction.health_status === 'Warning') {
        healthColor = '#f59e0b'; // yellow
    } else if (prediction.health_status === 'Critical') {
        healthColor = '#ef4444'; // red
    }

    healthCircle.style.background = `conic-gradient(${healthColor} ${healthPercent}%, rgba(255,255,255,0.1) ${healthPercent}%)`;
    healthLabel.textContent = prediction.health_status;

    // Update risk meter
    const riskBar = document.getElementById('risk-bar');
    const riskValue = document.getElementById('risk-value');
    riskBar.style.width = `${prediction.failure_risk}%`;
    riskValue.textContent = `${prediction.failure_risk}%`;

    // Update RUL
    const rulValue = document.getElementById('rul-value');
    rulValue.textContent = prediction.remaining_useful_life;

    // Update system status indicator
    const statusIndicator = document.getElementById('system-status');
    const statusText = document.getElementById('status-text');

    statusIndicator.className = 'status-indicator';
    if (prediction.health_status === 'Healthy') {
        statusIndicator.classList.add('healthy');
        statusText.textContent = 'System Healthy';
    } else if (prediction.health_status === 'Warning') {
        statusIndicator.classList.add('warning');
        statusText.textContent = 'Warning Detected';
    } else {
        statusIndicator.classList.add('critical');
        statusText.textContent = 'Critical Issue';
    }

    // Update current sensor readings in overview
    const overviewTemp = document.getElementById('overview-temp');
    const overviewVib = document.getElementById('overview-vib');
    const overviewPress = document.getElementById('overview-press');
    const overviewRpm = document.getElementById('overview-rpm');

    if (overviewTemp) overviewTemp.textContent = `${sensorData.temperature.toFixed(1)}°C`;
    if (overviewVib) overviewVib.textContent = `${sensorData.vibration.toFixed(1)} mm/s`;
    if (overviewPress) overviewPress.textContent = `${sensorData.pressure.toFixed(1)} PSI`;
    if (overviewRpm) overviewRpm.textContent = sensorData.rpm.toString();
}

function updatePredictions(prediction) {
    // Update prediction values
    document.getElementById('anomaly-status').textContent = prediction.anomaly_detected ? 'Yes' : 'No';

    // Create detailed root cause analysis with all sensor information
    const rootCauseDetails = generateRootCauseDetails(sensorData);
    document.getElementById('root-cause').innerHTML = rootCauseDetails;

    document.getElementById('failure-prob').textContent = `${prediction.failure_risk}%`;
    document.getElementById('current-health').textContent = prediction.health_status;
    document.getElementById('recommendation-text').textContent = prediction.recommendation;
    document.getElementById('anomaly-score').textContent = prediction.anomaly_probability.toFixed(3);
    document.getElementById('confidence').textContent = `${Math.round((1 - prediction.anomaly_probability) * 100)}%`;
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}

function generateRootCauseDetails(sensorData) {
    const rootCauses = [];

    // Temperature root cause
    if (sensorData.temperature > 75) {
        rootCauses.push(`<div class="root-cause-item temperature">
            <div class="cause-header">
                <span class="cause-sensor">🌡️ Temperature Issue</span>
                <span class="cause-severity critical">Critical</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.temperature.toFixed(1)}°C (Above normal range >75°C)</p>
                <p><strong>Root Cause:</strong> High temperature detected in the system</p>
                <p><strong>Impact:</strong> Can cause component failure and reduced equipment life</p>
                <p><strong>Recommendation:</strong> Check cooling system immediately</p>
            </div>
        </div>`);
    } else if (sensorData.temperature > 70) {
        rootCauses.push(`<div class="root-cause-item temperature">
            <div class="cause-header">
                <span class="cause-sensor">🌡️ Temperature Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.temperature.toFixed(1)}°C (Elevated >70°C)</p>
                <p><strong>Root Cause:</strong> Temperature rising above optimal range</p>
                <p><strong>Impact:</strong> Monitor closely to prevent escalation</p>
                <p><strong>Recommendation:</strong> Monitor cooling system and ventilation</p>
            </div>
        </div>`);
    } else if (sensorData.temperature < 35) {
        rootCauses.push(`<div class="root-cause-item temperature">
            <div class="cause-header">
                <span class="cause-sensor">🌡️ Temperature Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.temperature.toFixed(1)}°C (Below normal <35°C)</p>
                <p><strong>Root Cause:</strong> Low temperature detected</p>
                <p><strong>Impact:</strong> Can affect system performance and efficiency</p>
                <p><strong>Recommendation:</strong> Check heating system</p>
            </div>
        </div>`);
    }

    // Pressure root cause
    if (sensorData.pressure > 170) {
        rootCauses.push(`<div class="root-cause-item pressure">
            <div class="cause-header">
                <span class="cause-sensor">⚙️ Pressure Issue</span>
                <span class="cause-severity critical">Critical</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.pressure.toFixed(1)} PSI (Dangerously high >170 PSI)</p>
                <p><strong>Root Cause:</strong> Critical pressure level detected</p>
                <p><strong>Impact:</strong> Immediate safety risk and equipment damage</p>
                <p><strong>Recommendation:</strong> Check pressure relief valves immediately</p>
            </div>
        </div>`);
    } else if (sensorData.pressure > 150) {
        rootCauses.push(`<div class="root-cause-item pressure">
            <div class="cause-header">
                <span class="cause-sensor">⚙️ Pressure Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.pressure.toFixed(1)} PSI (High >150 PSI)</p>
                <p><strong>Root Cause:</strong> Pressure rising above optimal range</p>
                <p><strong>Impact:</strong> Monitor to prevent system overload</p>
                <p><strong>Recommendation:</strong> Monitor pressure systems closely</p>
            </div>
        </div>`);
    } else if (sensorData.pressure < 90) {
        rootCauses.push(`<div class="root-cause-item pressure">
            <div class="cause-header">
                <span class="cause-sensor">⚙️ Pressure Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.pressure.toFixed(1)} PSI (Low <90 PSI)</p>
                <p><strong>Root Cause:</strong> Pressure below optimal range</p>
                <p><strong>Impact:</strong> Can affect system performance and efficiency</p>
                <p><strong>Recommendation:</strong> Check pump performance</p>
            </div>
        </div>`);
    }

    // Vibration root cause
    if (sensorData.vibration > 7) {
        rootCauses.push(`<div class="root-cause-item vibration">
            <div class="cause-header">
                <span class="cause-sensor">📊 Vibration Issue</span>
                <span class="cause-severity critical">Critical</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.vibration.toFixed(1)} mm/s (Excessive >7 mm/s)</p>
                <p><strong>Root Cause:</strong> Excessive vibration levels detected</p>
                <p><strong>Impact:</strong> Indicates severe mechanical issues or misalignment</p>
                <p><strong>Recommendation:</strong> Inspect bearings and mounting urgently</p>
            </div>
        </div>`);
    } else if (sensorData.vibration > 5) {
        rootCauses.push(`<div class="root-cause-item vibration">
            <div class="cause-header">
                <span class="cause-sensor">📊 Vibration Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.vibration.toFixed(1)} mm/s (High >5 mm/s)</p>
                <p><strong>Root Cause:</strong> Elevated vibration levels</p>
                <p><strong>Impact:</strong> Early sign of potential bearing or mounting issues</p>
                <p><strong>Recommendation:</strong> Schedule bearing inspection</p>
            </div>
        </div>`);
    }

    // RPM root cause
    if (sensorData.rpm > 2400) {
        rootCauses.push(`<div class="root-cause-item rpm">
            <div class="cause-header">
                <span class="cause-sensor">🔄 RPM Issue</span>
                <span class="cause-severity critical">Critical</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.rpm} RPM (Excessive >2400 RPM)</p>
                <p><strong>Root Cause:</strong> RPM significantly above normal range</p>
                <p><strong>Impact:</strong> High stress on components, potential for failure</p>
                <p><strong>Recommendation:</strong> Reduce load or check governor</p>
            </div>
        </div>`);
    } else if (sensorData.rpm > 2200) {
        rootCauses.push(`<div class="root-cause-item rpm">
            <div class="cause-header">
                <span class="cause-sensor">🔄 RPM Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.rpm} RPM (High >2200 RPM)</p>
                <p><strong>Root Cause:</strong> RPM above optimal operating range</p>
                <p><strong>Impact:</strong> Increased wear and energy consumption</p>
                <p><strong>Recommendation:</strong> Monitor engine load and performance</p>
            </div>
        </div>`);
    } else if (sensorData.rpm < 1700) {
        rootCauses.push(`<div class="root-cause-item rpm">
            <div class="cause-header">
                <span class="cause-sensor">🔄 RPM Warning</span>
                <span class="cause-severity warning">Warning</span>
            </div>
            <div class="cause-details">
                <p><strong>Current Value:</strong> ${sensorData.rpm} RPM (Low <1700 RPM)</p>
                <p><strong>Root Cause:</strong> RPM below optimal operating range</p>
                <p><strong>Impact:</strong> Reduced performance and efficiency</p>
                <p><strong>Recommendation:</strong> Check power supply and load conditions</p>
            </div>
        </div>`);
    }

    // If no specific root causes, show normal operation
    if (rootCauses.length === 0) {
        return `<div class="root-cause-item normal">
            <div class="cause-header">
                <span class="cause-sensor">✅ System Status</span>
                <span class="cause-severity normal">Normal</span>
            </div>
            <div class="cause-details">
                <p><strong>All sensors operating within normal parameters</strong></p>
                <p>All monitored systems (Temperature, Pressure, Vibration, RPM) are functioning optimally.</p>
                <p><strong>Recommendation:</strong> Continue normal operation with routine maintenance schedule.</p>
            </div>
        </div>`;
    }

    return rootCauses.join('');
}

function updateSensorChart(sensor, value) {
    if (!charts[sensor]) return;

    const chart = charts[sensor];
    const maxPoints = 20;

    // Add new data point
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(value);

    // Keep only last maxPoints
    if (chart.data.labels.length > maxPoints) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

function updateTrendsChart() {
    if (!charts.trends || sensorHistory.length === 0) return;

    const latest = sensorHistory[sensorHistory.length - 1];
    const time = new Date(latest.timestamp).toLocaleTimeString();

    // Update each dataset
    charts.trends.data.labels.push(time);
    charts.trends.data.datasets[0].data.push(latest.sensorData.temperature);
    charts.trends.data.datasets[1].data.push(latest.sensorData.vibration);
    charts.trends.data.datasets[2].data.push(latest.sensorData.pressure);
    charts.trends.data.datasets[3].data.push(latest.sensorData.rpm);

    // Keep only last 20 points
    const maxPoints = 20;
    if (charts.trends.data.labels.length > maxPoints) {
        charts.trends.data.labels.shift();
        charts.trends.data.datasets.forEach(dataset => dataset.data.shift());
    }

    charts.trends.update();
}

function updateRiskChart() {
    if (!charts.risk || sensorHistory.length === 0) return;

    const latest = sensorHistory[sensorHistory.length - 1];
    const time = new Date(latest.timestamp).toLocaleTimeString();

    charts.risk.data.labels.push(time);
    charts.risk.data.datasets[0].data.push(latest.prediction.failure_risk);

    // Keep only last 20 points
    const maxPoints = 20;
    if (charts.risk.data.labels.length > maxPoints) {
        charts.risk.data.labels.shift();
        charts.risk.data.datasets[0].data.shift();
    }

    charts.risk.update();
}

function addAlert(prediction) {
    const alert = {
        id: Date.now(),
        severity: prediction.health_status === 'Critical' ? 'critical' : 'warning',
        title: `${prediction.health_status}: ${prediction.root_cause}`,
        message: prediction.recommendation,
        timestamp: new Date().toLocaleString(),
        sensorData: { ...sensorData }
    };

    alerts.unshift(alert);

    // Keep only last 10 alerts
    if (alerts.length > 10) {
        alerts = alerts.slice(0, 10);
    }

    updateAlertsBadge();
    loadAlerts();
}

function loadAlerts() {
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = '';

    if (alerts.length === 0) {
        alertsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No alerts at this time.</p>';
        return;
    }

    // Get current filter
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

    // Filter alerts based on selected filter
    let filteredAlerts = alerts;
    if (activeFilter !== 'all') {
        filteredAlerts = alerts.filter(alert => {
            switch(activeFilter) {
                case 'critical':
                    return alert.severity === 'critical';
                case 'warning':
                    return alert.severity === 'warning';
                case 'info':
                    return alert.severity === 'info';
                default:
                    return true;
            }
        });
    }

    if (filteredAlerts.length === 0) {
        alertsList.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No ${activeFilter} alerts at this time.</p>`;
        return;
    }

    filteredAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <div class="alert-icon ${alert.severity}">
                <i class="fas fa-exclamation-${alert.severity === 'critical' ? 'triangle' : 'circle'}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.timestamp}</div>
            </div>
        `;
        alertsList.appendChild(alertItem);
    });
}

function updateAlertsBadge() {
    const badge = document.getElementById('alerts-badge');
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    badge.textContent = criticalCount > 0 ? criticalCount : alerts.length;
}

function initializeMaintenanceForm() {
    console.log('Initializing maintenance form...');

    // Pre-fill form with current data
    if (currentPrediction) {
        const machineHealthSelect = document.getElementById('machine-health');
        const predictedRulInput = document.getElementById('predicted-rul');

        if (machineHealthSelect) {
            machineHealthSelect.value = currentPrediction.health_status.toLowerCase();
        }
        if (predictedRulInput) {
            predictedRulInput.value = currentPrediction.remaining_useful_life;
        }

        // Suggest maintenance date based on priority
        const suggestedDate = new Date();
        if (currentPrediction.health_status === 'Critical') {
            suggestedDate.setDate(suggestedDate.getDate() + 1); // Tomorrow for critical
        } else if (currentPrediction.health_status === 'Warning') {
            suggestedDate.setDate(suggestedDate.getDate() + 7); // Next week for warning
        } else {
            suggestedDate.setDate(suggestedDate.getDate() + 30); // Next month for healthy
        }

        const maintenanceDateInput = document.getElementById('maintenance-date');
        if (maintenanceDateInput) {
            maintenanceDateInput.value = suggestedDate.toISOString().split('T')[0];
        }
    }

    // Add form submission handler
    const maintenanceForm = document.getElementById('maintenance-form');
    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', handleMaintenanceForm);
        console.log('Maintenance form event listener attached');
    } else {
        console.error('Maintenance form not found');
    }
}

function handleMaintenanceForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const maintenanceRecord = {
        id: Date.now(),
        machineName: formData.get('machine-name') || document.getElementById('machine-name').value,
        machineHealth: formData.get('machine-health') || document.getElementById('machine-health').value,
        predictedRUL: formData.get('predicted-rul') || document.getElementById('predicted-rul').value,
        maintenanceDate: formData.get('maintenance-date'),
        maintenanceType: formData.get('maintenance-type'),
        priority: formData.get('priority'),
        assignedEngineer: formData.get('assigned-engineer'),
        notes: formData.get('maintenance-notes'),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        scheduledDate: formData.get('maintenance-date')
    };

    // Load existing data from localStorage first
    const existingData = localStorage.getItem('predixai_maintenance_history');
    let currentHistory = [];
    if (existingData) {
        try {
            currentHistory = JSON.parse(existingData);
        } catch (e) {
            console.error('Error parsing existing maintenance history:', e);
            currentHistory = [];
        }
    }

    // Add new record
    currentHistory.push(maintenanceRecord);

    // Save to localStorage
    localStorage.setItem('predixai_maintenance_history', JSON.stringify(currentHistory));

    // Update global array to match
    maintenanceHistory = currentHistory;

    console.log('Maintenance scheduled:', maintenanceRecord);
    console.log('Total maintenance records after save:', currentHistory.length);
    console.log('Global maintenanceHistory length:', maintenanceHistory.length);

    // Switch to history tab to show the new record
    switchTab('history');

    // Force refresh the history tab data after a short delay
    setTimeout(() => {
        if (document.getElementById('history-tab') && document.getElementById('history-tab').classList.contains('active')) {
            loadMaintenanceHistory();
        }
    }, 100);

    // Show success message after tab switch
    setTimeout(() => {
        alert('Maintenance scheduled successfully!');
    }, 200);
}

function loadMaintenanceHistory() {
    // Load maintenance history from localStorage
    const storedHistory = localStorage.getItem('predixai_maintenance_history');

    if (storedHistory) {
        try {
            maintenanceHistory = JSON.parse(storedHistory);
        } catch (e) {
            console.error('Error parsing maintenance history:', e);
            maintenanceHistory = [];
        }
    } else {
        maintenanceHistory = [];
    }

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (!maintenanceHistory || maintenanceHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No maintenance records found.</p>';
        updateHistoryStats();
        return;
    }

    // Get current filter
    const activeFilter = document.querySelector('#history-tab .filter-btn.active')?.getAttribute('data-filter') || 'all';

    // Filter records based on selected filter
    let filteredRecords = maintenanceHistory;
    if (activeFilter !== 'all') {
        filteredRecords = maintenanceHistory.filter(record => {
            switch(activeFilter) {
                case 'scheduled':
                    return record.status === 'scheduled';
                case 'completed':
                    return record.status === 'completed';
                case 'overdue':
                    return record.status === 'scheduled' && new Date(record.scheduledDate) < new Date();
                default:
                    return true;
            }
        });
    }

    if (filteredRecords.length === 0) {
        historyList.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No ${activeFilter} maintenance records.</p>`;
        updateHistoryStats();
        return;
    }

    // Sort by scheduled date (most recent first)
    filteredRecords.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

    filteredRecords.forEach(record => {
        const isOverdue = record.status === 'scheduled' && new Date(record.scheduledDate) < new Date();
        const statusClass = isOverdue ? 'overdue' : record.status;
        const statusText = isOverdue ? 'Overdue' : record.status.charAt(0).toUpperCase() + record.status.slice(1);

        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${statusClass}`;
        historyItem.innerHTML = `
            <div class="history-summary">
                <div class="summary-main">
                    <div class="summary-title">
                        <strong>${record.maintenanceType.charAt(0).toUpperCase() + record.maintenanceType.slice(1)}</strong>
                        <span class="summary-date">${new Date(record.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div class="summary-meta">
                        <span class="summary-priority priority-${record.priority}">${record.priority.toUpperCase()}</span>
                        <span class="summary-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="summary-details">
                    <span class="summary-machine">Machine: ${record.machineName}</span>
                    <span class="summary-assigned">Assigned: ${record.assignedEngineer}</span>
                    <span class="summary-notes">${record.notes.substring(0, 60)}${record.notes.length > 60 ? '...' : ''}</span>
                </div>
                <div class="summary-actions">
                    ${record.status === 'scheduled' ?
                        `<button class="action-btn small" onclick="markMaintenanceComplete(${record.id})">
                            <i class="fas fa-check"></i> Complete
                        </button>` :
                        ''
                    }
                    <button class="action-btn small secondary" onclick="viewMaintenanceDetails(${record.id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        `;
        historyList.appendChild(historyItem);
    });

    updateHistoryStats();
}

function initializeHistoryFilters() {
    // Add event listeners to history filter buttons
    document.querySelectorAll('#history-tab .filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('#history-tab .filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Reload history with new filter
            loadMaintenanceHistory();
        });
    });
}

function updateHistoryStats() {
    // Always load fresh data from localStorage
    const storedHistory = localStorage.getItem('predixai_maintenance_history');
    let currentHistory = [];

    if (storedHistory) {
        try {
            currentHistory = JSON.parse(storedHistory);
            // Update global array to keep it in sync
            maintenanceHistory = currentHistory;
        } catch (e) {
            console.error('Error parsing maintenance history for stats:', e);
            currentHistory = [];
            maintenanceHistory = [];
        }
    }

    // Calculate statistics
    const totalScheduled = currentHistory.filter(r => r.status === 'scheduled').length;
    const totalCompleted = currentHistory.filter(r => r.status === 'completed').length;
    const totalOverdue = currentHistory.filter(r =>
        r.status === 'scheduled' && new Date(r.scheduledDate) < new Date()
    ).length;

    // Update DOM elements immediately when history tab is active
    const updateElements = () => {
        const scheduledEl = document.getElementById('total-scheduled');
        const completedEl = document.getElementById('total-completed');
        const overdueEl = document.getElementById('total-overdue');

        if (scheduledEl) scheduledEl.textContent = totalScheduled;
        if (completedEl) completedEl.textContent = totalCompleted;
        if (overdueEl) overdueEl.textContent = totalOverdue;
    };

    // If history tab is currently active, update immediately
    if (document.getElementById('history-tab').classList.contains('active')) {
        updateElements();
    } else {
        // Use setTimeout for safety
        setTimeout(updateElements, 100);
    }

    console.log('History stats updated:', { totalScheduled, totalCompleted, totalOverdue });
}

function markMaintenanceComplete(recordId) {
    const record = maintenanceHistory.find(r => r.id === recordId);
    if (record) {
        record.status = 'completed';
        record.completedAt = new Date().toISOString();
        localStorage.setItem('predixai_maintenance_history', JSON.stringify(maintenanceHistory));
        loadMaintenanceHistory();
        alert('Maintenance marked as completed!');
    }
}

function viewMaintenanceDetails(recordId) {
    const record = maintenanceHistory.find(r => r.id === recordId);
    if (record) {
        const details = `
Maintenance Details:

Type: ${record.maintenanceType.charAt(0).toUpperCase() + record.maintenanceType.slice(1)}
Priority: ${record.priority.toUpperCase()}
Status: ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}

Machine: ${record.machineName}
Health Status: ${record.machineHealth}
Predicted RUL: ${record.predictedRUL} hours

Scheduled Date: ${new Date(record.scheduledDate).toLocaleDateString()}
Assigned Engineer: ${record.assignedEngineer}

Notes: ${record.notes}

Created: ${new Date(record.createdAt).toLocaleString()}
${record.completedAt ? `Completed: ${new Date(record.completedAt).toLocaleString()}` : ''}
        `;
        alert(details);
    }
}

function editMaintenanceRecord(recordId) {
    // For now, just show an alert. In a full implementation, this would open an edit form.
    alert('Edit functionality would be implemented in a production system. Record ID: ' + recordId);
}

function resetMaintenanceForm() {
    document.getElementById('maintenance-form').reset();

    // Re-fill with current data
    if (currentPrediction) {
        document.getElementById('machine-health').value = currentPrediction.health_status.toLowerCase();
        document.getElementById('predicted-rul').value = currentPrediction.remaining_useful_life;

        const suggestedDate = new Date();
        if (currentPrediction.health_status === 'Critical') {
            suggestedDate.setDate(suggestedDate.getDate() + 1);
        } else if (currentPrediction.health_status === 'Warning') {
            suggestedDate.setDate(suggestedDate.getDate() + 7);
        } else {
            suggestedDate.setDate(suggestedDate.getDate() + 30);
        }
        document.getElementById('maintenance-date').value = suggestedDate.toISOString().split('T')[0];
    }
}

function loadReports() {
    // Update report statistics
    document.getElementById('total-readings').textContent = sensorHistory.length;
    document.getElementById('anomalies-count').textContent = sensorHistory.filter(h => h.prediction.anomaly_detected).length;
    document.getElementById('maintenance-actions').textContent = alerts.length;
}

function loadMachines() {
    console.log('Loading machines...');
    // Initialize with default machine if none exist
    let machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');

    if (machines.length === 0) {
        // Create default machine
        const defaultMachine = {
            id: 1,
            name: 'PredixAI Industrial Equipment',
            type: 'pump',
            location: 'Production Line 1',
            model: 'PM-2000',
            manufacturer: 'PredixAI Corp',
            installationDate: '2024-01-01',
            description: 'High-performance industrial pump for manufacturing operations',
            notes: 'Regular maintenance required every 6 months',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        machines = [defaultMachine];
        localStorage.setItem('predixai_machines', JSON.stringify(machines));
    }

    // Display machines in the machines tab
    displayMachines(machines);
    updateMachineStats(machines);
}

function displayMachines(machines) {
    const machinesGrid = document.getElementById('machines-grid');
    if (!machinesGrid) return;

    machinesGrid.innerHTML = '';

    machines.forEach(machine => {
        const machineCard = document.createElement('div');
        machineCard.className = 'machine-card';
        machineCard.innerHTML = `
            <div class="machine-header">
                <div class="machine-icon">
                    <i class="fas fa-${getMachineIcon(machine.type)}"></i>
                </div>
                <div class="machine-info">
                    <h4>${machine.name}</h4>
                    <span class="machine-type">${machine.type.charAt(0).toUpperCase() + machine.type.slice(1)}</span>
                </div>
                <div class="machine-actions">
                    <button class="action-btn small" onclick="selectMachine(${machine.id})" title="Select for monitoring">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn small secondary" onclick="editMachine(${machine.id})" title="Edit machine">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn small danger" onclick="deleteMachine(${machine.id})" title="Remove machine">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="machine-details">
                <div class="detail-item">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${machine.location || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Model:</span>
                    <span class="detail-value">${machine.model || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Manufacturer:</span>
                    <span class="detail-value">${machine.manufacturer || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Installed:</span>
                    <span class="detail-value">${machine.installationDate ? new Date(machine.installationDate).toLocaleDateString() : 'Not specified'}</span>
                </div>
            </div>
        `;
        machinesGrid.appendChild(machineCard);
    });
}

function getMachineIcon(type) {
    const icons = {
        'pump': 'water-pump',
        'motor': 'cog',
        'compressor': 'compress',
        'conveyor': 'conveyor-belt',
        'fan': 'fan',
        'gearbox': 'cogs',
        'valve': 'valve',
        'other': 'industry'
    };
    return icons[type] || 'industry';
}

function updateMachineStats(machines) {
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    machines.forEach(machine => {
        if (machine.healthStatus === 'Critical') {
            criticalCount++;
        } else if (machine.healthStatus === 'Warning') {
            warningCount++;
        } else {
            healthyCount++;
        }
    });

    document.getElementById('total-machines').textContent = machines.length;
    document.getElementById('healthy-machines').textContent = healthyCount;
    document.getElementById('warning-machines').textContent = warningCount;
    document.getElementById('critical-machines').textContent = criticalCount;
}

function selectMachine(machineId) {
    // Set current machine
    localStorage.setItem('predixai_current_machine', machineId.toString());

    // Update UI
    const machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');
    const selectedMachine = machines.find(m => m.id == machineId);

    if (selectedMachine) {
        document.getElementById('current-machine-name').textContent = selectedMachine.name;
        document.getElementById('machine-name').value = selectedMachine.name;
    }

    // Update machine health status in the machines array
    updateMachineHealthStatus(machineId, currentPrediction);

    // Show confirmation
    alert(`Now monitoring: ${selectedMachine.name}`);

    // Switch to overview tab
    switchTab('overview');
}

function updateMachineHealthStatus(machineId, prediction) {
    if (!prediction) return;

    // Load machines
    let machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');

    // Find the machine
    const machineIndex = machines.findIndex(m => m.id == machineId);
    if (machineIndex !== -1) {
        // Update machine health status
        machines[machineIndex].healthStatus = prediction.health_status;
        machines[machineIndex].lastPrediction = prediction;
        machines[machineIndex].lastUpdated = new Date().toISOString();

        // Save updated machines
        localStorage.setItem('predixai_machines', JSON.stringify(machines));
    }
}

function editMachine(machineId) {
    const machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');
    const machine = machines.find(m => m.id == machineId);

    if (machine) {
        // Populate form with machine data
        document.getElementById('machine-name-input').value = machine.name || '';
        document.getElementById('machine-type').value = machine.type || 'pump';
        document.getElementById('machine-location').value = machine.location || '';
        document.getElementById('machine-model').value = machine.model || '';
        document.getElementById('machine-manufacturer').value = machine.manufacturer || '';
        document.getElementById('installation-date').value = machine.installationDate || '';
        document.getElementById('machine-description').value = machine.description || '';
        document.getElementById('machine-notes').value = machine.notes || '';

        document.getElementById('modal-title').textContent = 'Edit Machine';

        // Add edit parameter to URL (for save function)
        window.history.replaceState(null, null, `?edit=${machineId}`);

        // Show modal
        document.getElementById('add-machine-modal').style.display = 'flex';
    }
}

function deleteMachine(machineId) {
    // Get the machine details for confirmation
    const machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');
    const machine = machines.find(m => m.id == machineId);

    if (!machine) {
        alert('Machine not found.');
        return;
    }

    // Show confirmation dialog
    const confirmDelete = confirm(`Are you sure you want to remove the machine "${machine.name}"?\n\nThis action cannot be undone and will also remove any associated maintenance records.`);

    if (!confirmDelete) {
        return;
    }

    // Remove the machine from localStorage
    const updatedMachines = machines.filter(m => m.id != machineId);
    localStorage.setItem('predixai_machines', JSON.stringify(updatedMachines));

    // Check if this was the currently selected machine
    const currentMachineId = localStorage.getItem('predixai_current_machine');
    if (currentMachineId == machineId) {
        // Clear the current machine selection
        localStorage.removeItem('predixai_current_machine');

        // If there are other machines, select the first one
        if (updatedMachines.length > 0) {
            localStorage.setItem('predixai_current_machine', updatedMachines[0].id.toString());
            document.getElementById('current-machine-name').textContent = updatedMachines[0].name;
            document.getElementById('machine-name').value = updatedMachines[0].name;
        } else {
            // No machines left, clear the display
            document.getElementById('current-machine-name').textContent = 'No machines available';
            document.getElementById('machine-name').value = '';
        }
    }

    // Remove associated maintenance records
    const maintenanceHistory = JSON.parse(localStorage.getItem('predixai_maintenance_history') || '[]');
    const updatedMaintenanceHistory = maintenanceHistory.filter(record => record.machineName !== machine.name);
    localStorage.setItem('predixai_maintenance_history', JSON.stringify(updatedMaintenanceHistory));

    // Refresh the machines display
    loadMachines();

    // If history tab is active, refresh it too
    if (document.getElementById('history-tab').classList.contains('active')) {
        loadMaintenanceHistory();
    }

    alert(`Machine "${machine.name}" has been removed successfully.`);
}

function initializeUploadTab() {
    console.log('Initializing upload tab...');
    // File upload functionality is implemented but not fully initialized here
    // The actual upload handling is done through event listeners attached elsewhere
}

function showAddMachineModal() {
    // Reset form
    document.getElementById('machine-form').reset();
    document.getElementById('modal-title').textContent = 'Add New Machine';

    // Show modal
    document.getElementById('add-machine-modal').style.display = 'flex';
}

function hideAddMachineModal() {
    document.getElementById('add-machine-modal').style.display = 'none';
}

function saveMachine() {
    const formData = {
        name: document.getElementById('machine-name-input').value.trim(),
        type: document.getElementById('machine-type').value,
        location: document.getElementById('machine-location').value.trim(),
        model: document.getElementById('machine-model').value.trim(),
        manufacturer: document.getElementById('machine-manufacturer').value.trim(),
        installationDate: document.getElementById('installation-date').value,
        description: document.getElementById('machine-description').value.trim(),
        notes: document.getElementById('machine-notes').value.trim()
    };

    // Validate required fields
    if (!formData.name) {
        alert('Machine name is required');
        return;
    }

    // Load existing machines
    let machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');

    // Check if editing existing machine
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        // Update existing machine
        const machineIndex = machines.findIndex(m => m.id == editId);
        if (machineIndex !== -1) {
            machines[machineIndex] = {
                ...machines[machineIndex],
                ...formData,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        // Add new machine
        const newMachine = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        machines.push(newMachine);
    }

    // Save to localStorage
    localStorage.setItem('predixai_machines', JSON.stringify(machines));

    // Hide modal and refresh display
    hideAddMachineModal();
    loadMachines();

    alert(editId ? 'Machine updated successfully!' : 'Machine added successfully!');
}

function getCurrentMachine() {
    const machines = JSON.parse(localStorage.getItem('predixai_machines') || '[]');
    const currentMachineId = localStorage.getItem('predixai_current_machine');

    if (currentMachineId) {
        return machines.find(m => m.id == currentMachineId);
    }

    // Return first machine if no current machine set
    return machines.length > 0 ? machines[0] : null;
}

function logout() {
    // Clear user session
    localStorage.removeItem('predixai_current_user');

    // Redirect to login page
    window.location.href = 'login.html';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
        sidebar.classList.add('open');
        sidebarToggle.innerHTML = '<i class="fas fa-times"></i>';
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    // Only handle mobile behavior
    if (window.innerWidth <= 768) {
        // Check if click is outside sidebar and toggle button
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('open');
            sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
});

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function generateReport() {
    const currentMachine = getCurrentMachine();
    const machineName = currentMachine ? currentMachine.name : 'Unknown Machine';

    const reportContent = `
Maintenance Report - ${new Date().toLocaleDateString()}
Machine: ${machineName}

EXECUTIVE SUMMARY
=================
Total sensor readings analyzed: ${sensorHistory.length}
Anomalies detected: ${sensorHistory.filter(h => h.prediction.anomaly_detected).length}
Maintenance actions required: ${alerts.length}
Current system health: ${currentPrediction ? currentPrediction.health_status : 'Unknown'}

SYSTEM HEALTH OVERVIEW
======================
Current Status: ${currentPrediction ? currentPrediction.health_status : 'Unknown'}
Failure Risk: ${currentPrediction ? currentPrediction.failure_risk + '%' : 'N/A'}
Remaining Useful Life: ${currentPrediction ? currentPrediction.remaining_useful_life + ' hours' : 'N/A'}

AI RECOMMENDATIONS
==================
${currentPrediction ? currentPrediction.recommendation : 'No recommendations available'}

RECENT ALERTS
=============
${alerts.slice(0, 5).map(alert => `- ${alert.timestamp}: ${alert.title}`).join('\n')}

This report was generated automatically by PredixAI Predictive Maintenance System.
    `;

    document.getElementById('report-preview').innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${reportContent}</pre>`;
}

function downloadReport() {
    generateReport();
    const content = document.getElementById('report-preview').textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function emailReport() {
    alert('Email functionality would be implemented in a production system. Report generated successfully.');
}

// Control functions
function resetSensors() {
    sensorData = {
        temperature: 50.0,
        vibration: 2.5,
        pressure: 125.0,
        rpm: 2000
    };

    // Update sliders and displays
    document.getElementById('temp-slider').value = sensorData.temperature;
    document.getElementById('temp-value').textContent = sensorData.temperature.toFixed(1);

    document.getElementById('vib-slider').value = sensorData.vibration;
    document.getElementById('vib-value').textContent = sensorData.vibration.toFixed(1);

    document.getElementById('press-slider').value = sensorData.pressure;
    document.getElementById('press-value').textContent = sensorData.pressure.toFixed(1);

    document.getElementById('rpm-slider').value = sensorData.rpm;
    document.getElementById('rpm-value').textContent = sensorData.rpm;

    // Automatically send the reset data to AI for prediction
    sendSensorData();
}

function simulateAnomaly() {
    // Set sensors to anomalous values
    sensorData = {
        temperature: 85.0,  // High temperature
        vibration: 8.5,     // High vibration
        pressure: 180.0,    // High pressure
        rpm: 3200          // High RPM
    };

    // Update sliders and displays
    document.getElementById('temp-slider').value = sensorData.temperature;
    document.getElementById('temp-value').textContent = sensorData.temperature.toFixed(1);

    document.getElementById('vib-slider').value = sensorData.vibration;
    document.getElementById('vib-value').textContent = sensorData.vibration.toFixed(1);

    document.getElementById('press-slider').value = sensorData.pressure;
    document.getElementById('press-value').textContent = sensorData.pressure.toFixed(1);

    document.getElementById('rpm-slider').value = sensorData.rpm;
    document.getElementById('rpm-value').textContent = sensorData.rpm;
}

function clearAllAlerts() {
    alerts = [];
    updateAlertsBadge();
    loadAlerts();
}

function refreshAlerts() {
    loadAlerts();
}

// Make functions globally available
window.sendSensorData = sendSensorData;
window.resetSensors = resetSensors;
window.simulateAnomaly = simulateAnomaly;
window.refreshData = refreshData;
window.clearAllAlerts = clearAllAlerts;
window.refreshAlerts = refreshAlerts;
window.generateReport = generateReport;
window.downloadReport = downloadReport;
window.emailReport = emailReport;
window.logout = logout;

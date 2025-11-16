// Convert cm to feet and inches
function cmToFeetInches(cm) {
    if (!cm || cm === 0) return '-';
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
}

// Convert kg to lbs
function kgToLbs(kg) {
    if (!kg || kg === 0) return '-';
    return `${Math.round(kg * 2.20462)} lbs`;
}

// Calculate age from date of birth
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Calculate win rate percentage
function calculateWinRate(wins, losses, draws) {
    const total = wins + losses + draws;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
}

// Get weight division from weight in kg (UFC Official Weight Classes)
function getWeightDivision(weight) {
    if (!weight || weight === 0) return 'unknown';
    const lbs = weight * 2.20462;
    
    // Using .5 margins to handle floating point precision issues
    // UFC Official Weight Classes:
    if (lbs < 115.5) return 'strawweight';        // up to 115 lbs (52.16 kg)
    if (lbs < 125.5) return 'flyweight';          // 116-125 lbs (56.70 kg)
    if (lbs < 135.5) return 'bantamweight';       // 126-135 lbs (61.23 kg)
    if (lbs < 145.5) return 'featherweight';      // 136-145 lbs (65.77 kg)
    if (lbs < 155.5) return 'lightweight';        // 146-155 lbs (70.31 kg)
    if (lbs < 170.5) return 'welterweight';       // 156-170 lbs (77.11 kg)
    if (lbs < 185.5) return 'middleweight';       // 171-185 lbs (83.91 kg)
    if (lbs < 205.5) return 'light_heavyweight';  // 186-205 lbs (92.99 kg)
    if (lbs < 265.5) return 'heavyweight';        // 206-265 lbs (120.20 kg)
    return 'super_heavyweight';                   // 265+ lbs (not official UFC division)
}

// Format stance for display
function formatStance(stance) {
    if (!stance) return 'Unknown';
    return stance.charAt(0).toUpperCase() + stance.slice(1).toLowerCase();
}

// Get stance CSS class
function getStanceClass(stance) {
    if (!stance) return '';
    return `stance-${stance.toLowerCase()}`;
}

// Sort array of objects by key
function sortBy(array, key, ascending = true) {
    return array.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        
        // Handle numeric values
        if (typeof valA === 'string' && !isNaN(valA)) valA = parseFloat(valA);
        if (typeof valB === 'string' && !isNaN(valB)) valB = parseFloat(valB);
        
        // Handle null/undefined
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        if (ascending) {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
    });
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show loading indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error">${message}</div>`;
    }
}
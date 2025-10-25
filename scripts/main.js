// Main application initialization

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== UFC Data Visualizer initializing ===');
    
    // Show loading state
    updateLandingStats('-', '-', '-');
    
    // Test if D3 is loaded
    if (typeof d3 === 'undefined') {
        console.error('❌ D3.js not loaded!');
        alert('D3.js library failed to load. Check internet connection.');
        return;
    }
    console.log('✅ D3.js loaded successfully');
    
    // Test if all modules exist
    console.log('Checking modules...');
    console.log('DataLoader:', typeof DataLoader);
    console.log('Navigation:', typeof Navigation);
    console.log('FightersTable:', typeof FightersTable);
    console.log('FighterDetails:', typeof FighterDetails);
    
    // Load all data
    console.log('Loading data...');
    const success = await DataLoader.loadAll();
    
    if (!success) {
        console.error('❌ Failed to load data');
        alert('Error loading data. Please check that fighter_details.csv exists in the data/ folder.');
        return;
    }
    
    console.log('✅ Data loaded successfully');
    console.log(`Fighters loaded: ${DataLoader.fighters.length}`);
    
    // Update landing page stats
    updateLandingStats(
        DataLoader.fighters.length,
        DataLoader.events.length,
        DataLoader.fights.length
    );
    
    // Initialize modules
    console.log('Initializing Navigation...');
    Navigation.init();
    console.log('✅ Navigation initialized');
    
    console.log('Initializing FightersTable...');
    FightersTable.init();
    console.log('✅ FightersTable initialized');
    
    console.log('=== UFC Data Visualizer ready! ===');
    
    // Test navigation after 2 seconds
    setTimeout(() => {
        console.log('Testing navigation to fighters page...');
        Navigation.navigateTo('fighters');
    }, 2000);
});

function updateLandingStats(fighters, events, fights) {
    const fightersEl = document.getElementById('total-fighters');
    const eventsEl = document.getElementById('total-events');
    const fightsEl = document.getElementById('total-fights');
    
    if (!fightersEl || !eventsEl || !fightsEl) {
        console.error('❌ Landing stats elements not found!');
        return;
    }
    
    fightersEl.textContent = fighters;
    eventsEl.textContent = events;
    fightsEl.textContent = fights;
    
    console.log('✅ Landing stats updated:', { fighters, events, fights });
}
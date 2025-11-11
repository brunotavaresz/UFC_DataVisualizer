// Navigation controller
const Navigation = {
    currentPage: 'landing',

    init() {
        // Setup navigation links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Back button in fighter details
        const backBtn = document.getElementById('back-to-fighters');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigateTo('fighters');
            });
        }
    },

    navigateTo(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        // Remove compare button if navigating away from comparison pages
        if (!pageName.includes('fighter-comparison')) {
            const compareBtn = document.getElementById('compare-btn-container');
            if (compareBtn) compareBtn.remove();
        }

        this.currentPage = pageName;

        // Trigger page-specific initialization
        if (pageName === 'fighters' && FightersTable.needsRefresh) {
            FightersTable.render();
        }
        
        // Initialize Events Map when navigating to events page
        if (pageName === 'events') {
            console.log('Navigating to events page, initializing map...');
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (typeof EventsMap !== 'undefined') {
                    EventsMap.init();
                } else {
                    console.error('EventsMap module not found!');
                }
            }, 100);
        }
    }
};
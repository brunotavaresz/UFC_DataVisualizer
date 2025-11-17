// Tour Guide using Driver.js v1.0.1
class TourGuide {
    constructor() {
        this.init();
    }

    init() {
        if (typeof window.driver === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        this.setupHelperButton();
    }

    setupHelperButton() {
        const helperBtn = document.getElementById('helper-btn');
        if (helperBtn) {
            helperBtn.addEventListener('click', () => {
                this.startTour();
            });
        }
    }

    startTour() {
        const currentPage = document.querySelector('.page.active')?.id || 'landing';
        
        switch(currentPage) {
            case 'landing':
                this.startLandingTour();
                break;
            case 'fighters':
                this.startFightersTour();
                break;
            case 'events':
                this.startEventsTour();
                break;
            case 'fighter-details':
                this.startFighterDetailsTour();
                break;
            case 'fighter-comparison-select':
                this.startComparisonSelectTour();
                break;
            case 'fighter-comparison-result':
                this.startComparisonResultTour();
                break;
            case 'event-details':
                this.startEventDetailsTour();
                break;
            case 'fight-details':
                this.startFightDetailsTour();
                break;
            default:
                this.startLandingTour();
        }
    }

    startLandingTour() {
        const driver = window.driver.js.driver;
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: [
                {
                    element: '.logo',
                    popover: {
                        title: '🥊 Welcome to UFC Data Visualizer!',
                        description: 'Your gateway to exploring 30+ years of UFC history with interactive visualizations and detailed statistics.',
                        side: 'bottom'
                    }
                },
                {
                    element: '[data-page="landing"]',
                    popover: {
                        title: '🏠 Home Page',
                        description: 'The landing page shows you an overview of the entire database with quick statistics about fighters, events, and fights.',
                        side: 'bottom'
                    }
                },
                {
                    element: '[data-page="fighters"]',
                    popover: {
                        title: '🥋 Fighters Section',
                        description: 'Browse and filter through the complete UFC fighter database. Search by name, weight division, stance, and various statistics.',
                        side: 'bottom'
                    }
                },
                {
                    element: '[data-page="events"]',
                    popover: {
                        title: '🗺️ Events & Fights',
                        description: 'Explore UFC events on an interactive world map. Click on locations to see events and individual fight details.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#helper-btn',
                    popover: {
                        title: '❓ Helper Button',
                        description: 'Click this button anytime to start a guided tour of the current page you are viewing. Each page has its own contextual tour!',
                        side: 'left'
                    }
                },
                {
                    element: '.landing-stats',
                    popover: {
                        title: '�� Quick Statistics',
                        description: 'View total counts of fighters, events, and fights in the UFC database at a glance.',
                        side: 'top'
                    }
                }
            ]
        });

        driverObj.drive();
    }

    startFightersTour() {
        const driver = window.driver.js.driver;
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: [
                {
                    element: '#search-fighter',
                    popover: {
                        title: '🔍 Fighter Search',
                        description: 'Search for fighters by name or nickname. Results update in real-time as you type.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#filter-division',
                    popover: {
                        title: '⚖️ Weight Division Filter',
                        description: 'Filter fighters by weight division: Flyweight, Bantamweight, Featherweight, Lightweight, Welterweight, Middleweight, Light Heavyweight, or Heavyweight.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#filter-stance',
                    popover: {
                        title: '🥊 Stance Filter',
                        description: 'Filter by fighting stance: Orthodox (right-handed), Southpaw (left-handed), Switch (both), or other specialized stances.',
                        side: 'bottom'
                    }
                },
                {
                    element: '.range-inputs',
                    popover: {
                        title: '📈 Range Filters',
                        description: 'Use these inputs to filter fighters by win rate percentage and age range. Set minimum and maximum values.',
                        side: 'top'
                    }
                },
                {
                    element: '.dual-slider-wrapper',
                    popover: {
                        title: '📏 Height & Weight Sliders',
                        description: 'Drag these sliders to filter fighters by height and weight ranges. Perfect for finding fighters with specific physical attributes.',
                        side: 'top'
                    }
                },
                {
                    element: '#fighters-table',
                    popover: {
                        title: '📋 Fighters Table',
                        description: 'Browse all fighters with their stats. Click on column headers to sort. Click "More Details" on any fighter to see their complete profile with visualizations.',
                        side: 'top'
                    }
                },
                {
                    element: '#clear-filters',
                    popover: {
                        title: '🔄 Clear Filters',
                        description: 'Click here to reset all filters and see the complete fighter list again.',
                        side: 'left'
                    }
                }
            ]
        });

        driverObj.drive();
    }

    startEventsTour() {
        const driver = window.driver.js.driver;
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: [
                {
                    element: '.stats-summary',
                    popover: {
                        title: '🌍 Global Statistics',
                        description: 'See how many countries, cities, and total events the UFC has visited around the world.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#event-search',
                    popover: {
                        title: '🔎 Event Search',
                        description: 'Search events by location, city, or date. The map will highlight matching locations.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#map',
                    popover: {
                        title: '🗺️ Interactive Map',
                        description: 'Click on markers to see events at each location. Markers are clustered by proximity - zoom in to see individual events. Each event card shows fights and can be clicked for detailed information.',
                        side: 'top'
                    }
                },
                {
                    element: '#reset-btn',
                    popover: {
                        title: '↺ Reset View',
                        description: 'Click here to reset the map to its original view and clear any filters or searches.',
                        side: 'left'
                    }
                },
                {
                    element: '.controls',
                    popover: {
                        title: '🎮 Map Controls',
                        description: 'Use the zoom controls on the map to navigate, or use your mouse wheel. Click and drag to pan around the world.',
                        side: 'bottom'
                    }
                }
            ]
        });

        driverObj.drive();
    }

    startFighterDetailsTour() {
        // Temporarily disable FighterDetails tooltips during tour
        if (typeof FighterDetails !== 'undefined') {
            const originalShowTooltip = FighterDetails.showTooltip;
            const originalHideTooltip = FighterDetails.hideTooltip;
            
            FighterDetails.showTooltip = () => {};
            FighterDetails.hideTooltip = () => {};
            
            const driver = window.driver.js.driver;
            const driverObj = driver({
                animate: false,
                showProgress: true,
                showButtons: ['next', 'previous', 'close'],
                allowClose: true,
                onDestroyStarted: () => {
                    FighterDetails.showTooltip = originalShowTooltip;
                    FighterDetails.hideTooltip = originalHideTooltip;
                    if (!driverObj.hasNextStep() || confirm("Are you sure you want to exit the tour?")) {
                        driverObj.destroy();
                    }
                },
                steps: [
                    {
                        popover: {
                            title: '🥊 Fighter Details Page',
                            description: 'This page shows comprehensive statistics and visualizations for the selected fighter. Tooltips are temporarily disabled during this tour!',
                            side: 'top'
                        }
                    },
                    {
                        element: '.fighter-header img',
                        popover: {
                            title: '📸 Fighter Photo',
                            description: 'Click on the fighter photo to view a full body image in a modal!',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '.fighter-header',
                        popover: {
                            title: '👤 Fighter Profile',
                            description: 'Name, nickname, stance badge, and quick overview of the fighter.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#modern-record-chart',
                        popover: {
                            title: '📊 Interactive Record Chart',
                            description: 'Donut chart showing wins, losses, and draws distribution. Hover over it after the tour for details!',
                            side: 'right'
                        }
                    },
                    {
                        element: '#modern-striking-radar',
                        popover: {
                            title: '👊 Striking Radar',
                            description: 'SPLM, Accuracy, Defense, and SAPM visualized. Each point shows striking capabilities.',
                            side: 'left'
                        }
                    },
                    {
                        element: '#modern-takedown-radar',
                        popover: {
                            title: '🤼 Grappling Radar',
                            description: 'Takedown stats and submission attempts. Shows grappling effectiveness.',
                            side: 'right'
                        }
                    },
                    {
                        element: '#performance-bars',
                        popover: {
                            title: '📈 Performance Metrics',
                            description: 'Interactive bars comparing win rate, striking, takedowns, and reach. Hover after tour for tooltips!',
                            side: 'top'
                        }
                    },
                    {
                        element: '#compare-fighter-btn',
                        popover: {
                            title: '⚖️ Compare Fighters',
                            description: 'Click here to select another fighter and see a detailed side-by-side comparison!',
                            side: 'left'
                        }
                    }
                ]
            });

            driverObj.drive();
        }
    }

    startEventDetailsTour() {
        const driver = window.driver.js.driver;
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: [
                {
                    element: '#back-to-events',
                    popover: {
                        title: '⬅️ Back to Map',
                        description: 'Return to the events map to explore other UFC events worldwide.',
                        side: 'right'
                    }
                },
                {
                    element: '.event-detail-header',
                    popover: {
                        title: '📅 Event Information',
                        description: 'See the event name, date, location, and total number of fights on the card.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#winners-list',
                    popover: {
                        title: '🏆 Event Winners',
                        description: 'Quick view of all fighters who won their bouts at this event.',
                        side: 'right'
                    }
                },
                {
                    element: '.fights-table',
                    popover: {
                        title: '🥊 Fight Card Details',
                        description: 'Complete fight card with winner, loser, weight class, method of victory, round, and time. Click Details on any fight to see in-depth statistics!',
                        side: 'top'
                    }
                }
            ]
        });

        driverObj.drive();
    }

    startFightDetailsTour() {
        const driver = window.driver.js.driver;
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: [
                {
                    element: '#back-to-event',
                    popover: {
                        title: '⬅️ Back to Event',
                        description: 'Return to the event page to see other fights from this card.',
                        side: 'right'
                    }
                },
                {
                    element: '.fight-detail-header',
                    popover: {
                        title: '🥊 Fight Information',
                        description: 'See the matchup, event name, division, method of victory, and finish time.',
                        side: 'bottom'
                    }
                },
                {
                    element: '.red-corner',
                    popover: {
                        title: '🔴 Red Corner Fighter',
                        description: 'Statistics and performance metrics for the fighter in the red corner.',
                        side: 'bottom'
                    }
                },
                {
                    element: '.blue-corner',
                    popover: {
                        title: '🔵 Blue Corner Fighter',
                        description: 'Statistics and performance metrics for the fighter in the blue corner.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#strikes-comparison-chart',
                    popover: {
                        title: '👊 Strikes Comparison',
                        description: 'Compare total strikes landed vs attempted for both fighters. Shows striking efficiency and volume.',
                        side: 'top'
                    }
                },
                {
                    element: '#takedowns-chart',
                    popover: {
                        title: '🤼 Takedowns Analysis',
                        description: 'Compare takedowns landed vs attempted. Key metric for wrestling and ground game effectiveness.',
                        side: 'top'
                    }
                },
                {
                    element: '#strikes-target-charts',
                    popover: {
                        title: '🎯 Strikes by Target',
                        description: 'Pie charts showing strike distribution to head, body, and legs. Reveals striking strategy!',
                        side: 'top'
                    }
                },
                {
                    element: '#control-time-chart',
                    popover: {
                        title: '⏱️ Control Time',
                        description: 'Time each fighter controlled opponent on the ground. Critical for understanding grappling dominance.',
                        side: 'top'
                    }
                },
                {
                    element: '#submissions-chart',
                    popover: {
                        title: '🔒 Submission Attempts',
                        description: 'Number of submission attempts by each fighter. Shows grappling aggression and submission threat.',
                        side: 'top'
                    }
                },
                {
                    element: '#performance-scatter',
                    popover: {
                        title: '📊 Performance Scatter',
                        description: 'Scatter plot comparing strikes, takedowns, knockdowns (red), and submissions (yellow). Hover to see details!',
                        side: 'top'
                    }
                }
            ]
        });

        driverObj.drive();
    }

    startComparisonSelectTour() {
        const driver = window.driver.js.driver;
        
        // Check if comparison page elements exist
        const searchInput = document.querySelector('#fighter-comparison-select input[type="text"]');
        const searchResults = document.getElementById('search-results');
        
        const steps = [
            {
                popover: {
                    title: '⚖️ Fighter Comparison - Select Opponent',
                    description: 'Choose a second fighter to compare head-to-head with detailed statistics and visualizations!',
                    side: 'top'
                }
            }
        ];
        
        // Add fighter cards step (they don't have specific IDs, just highlight the container)
        const cardsContainer = document.querySelector('#fighter-comparison-select > div > div:nth-child(2)');
        if (cardsContainer) {
            steps.push({
                element: cardsContainer,
                popover: {
                    title: '👥 Fighter Selection',
                    description: 'On the left you see your selected fighter. Use the search below to find an opponent for comparison.',
                    side: 'bottom'
                }
            });
        }
        
        // Add search input step
        if (searchInput) {
            steps.push({
                element: searchInput,
                popover: {
                    title: '🔍 Search Opponent',
                    description: 'Type a fighter name to search. Results will appear below with clickable cards.',
                    side: 'top'
                }
            });
        }
        
        // Add search results step
        if (searchResults) {
            steps.push({
                element: searchResults,
                popover: {
                    title: '📋 Search Results',
                    description: 'Click on any fighter card to select them as the opponent. The "Compare Fighters" button will appear once you select a fighter.',
                    side: 'top'
                }
            });
        }
        
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: steps
        });

        driverObj.drive();
    }

    startComparisonResultTour() {
        const driver = window.driver.js.driver;
        
        // Get actual elements that exist on the page
        const backBtn = document.querySelector('#fighter-comparison-result button');
        const comparisonGrid = document.querySelector('#fighter-comparison-result > div > div:nth-child(2)');
        const statsTable = document.querySelector('#fighter-comparison-result > div > div:nth-child(3)');
        const radarSection = document.querySelector('#fighter-comparison-result > div > div:nth-child(4)');
        
        const steps = [
            {
                popover: {
                    title: '⚖️ Head-to-Head Comparison',
                    description: 'Detailed side-by-side comparison of both fighters with statistics, records, and performance metrics!',
                    side: 'top'
                }
            }
        ];
        
        // Add back button step
        if (backBtn) {
            steps.push({
                element: backBtn,
                popover: {
                    title: '⬅️ Back to Selection',
                    description: 'Return to the fighter selection page to choose a different opponent.',
                    side: 'right'
                }
            });
        }
        
        // Add fighters overview step
        if (comparisonGrid) {
            steps.push({
                element: comparisonGrid,
                popover: {
                    title: '� Fighters Overview',
                    description: 'Side-by-side view of both fighters with photos, names, records, and basic stats.',
                    side: 'bottom'
                }
            });
        }
        
        // Add stats comparison step
        if (statsTable) {
            steps.push({
                element: statsTable,
                popover: {
                    title: '📈 Stats Comparison',
                    description: 'Detailed statistics comparison including striking accuracy, takedowns, submissions, and physical attributes.',
                    side: 'top'
                }
            });
        }
        
        // Add radar charts step
        if (radarSection) {
            steps.push({
                element: radarSection,
                popover: {
                    title: '🎯 Performance Radars',
                    description: 'Striking and grappling radar charts overlaid for easy visual comparison of both fighters\' skills.',
                    side: 'top'
                }
            });
        }
        
        const driverObj = driver({
            animate: false,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            allowClose: true,
            steps: steps
        });

        driverObj.drive();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TourGuide();
});

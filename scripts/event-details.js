// Event Details Module
const EventDetails = {
    currentEvent: null,
    fightersData: {},
    fightsData: [],

    async init(eventData) {
        console.log('Initializing Event Details...', eventData);
        this.currentEvent = eventData;
        
        // Load fighter details
        await this.loadFighterDetails();
        
        // Load fight details
        await this.loadFightDetails();
        
        // Populate the page
        this.populateHeader();
        this.populateWinners();
        this.populateFightsTable();
        this.setupBackButton();
        
        console.log('✅ Event Details initialization complete');
    },

    async loadFighterDetails() {
        try {
            if (DataLoader.fighters && DataLoader.fighters.length > 0) {
                this.fightersData = {};
                DataLoader.fighters.forEach(fighter => {
                    this.fightersData[fighter.id] = fighter;
                });
                console.log('✅ Fighter details loaded');
            } else {
                const fighters = await d3.csv('data/fighter_details.csv');
                this.fightersData = {};
                fighters.forEach(fighter => {
                    this.fightersData[fighter.id] = fighter;
                });
            }
        } catch (error) {
            console.error('Error loading fighter details:', error);
        }
    },

    async loadFightDetails() {
        try {
            console.log('Loading fight details for event:', this.currentEvent.event_id);
            const allFights = await d3.csv('data/fight_details.csv');
            console.log('Total fights loaded from CSV:', allFights.length);
            
            this.fightsData = allFights.filter(fight => 
                fight.event_id === this.currentEvent.event_id
            );
            console.log(`✅ Loaded ${this.fightsData.length} fight details for this event`);
            
            if (this.fightsData.length === 0) {
                console.warn('⚠️ No fight details found for event_id:', this.currentEvent.event_id);
                console.log('First few fights from CSV:', allFights.slice(0, 3));
            }
        } catch (error) {
            console.error('❌ Error loading fight details:', error);
        }
    },

    populateHeader() {
        const eventDate = new Date(this.currentEvent.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });

        document.getElementById('event-detail-title').textContent = 
            this.currentEvent.fights[0]?.event_name || 'UFC Event';
        document.getElementById('event-detail-date').textContent = formattedDate;
        document.getElementById('event-detail-location').textContent = this.currentEvent.location;
        document.getElementById('event-fight-count').textContent = this.currentEvent.fightCount;
    },

    populateWinners() {
        const winnersList = document.getElementById('winners-list');
        winnersList.innerHTML = '';

        // Get unique winners
        const winners = this.currentEvent.fights.map(fight => ({
            name: fight.winner,
            winnerId: fight.winner_id,
            fightId: fight.fight_id
        }));

        winners.forEach(winner => {
            const fighterData = this.fightersData[winner.winnerId];
            const fightDetails = this.fightsData.find(f => f.fight_id === winner.fightId);
            
            if (!fighterData) {
                console.warn(`Fighter data not found for: ${winner.name}`);
                return;
            }

            const winnerCard = document.createElement('div');
            winnerCard.className = 'winner-card';

            // Determine which corner won (r_ or b_)
            const isRedCorner = fightDetails && fightDetails.r_name === winner.name;
            const prefix = isRedCorner ? 'r_' : 'b_';

            const sigStrLanded = fightDetails ? fightDetails[`${prefix}sig_str_landed`] || '0' : '0';
            const sigStrAcc = fightDetails ? fightDetails[`${prefix}sig_str_acc`] || '0' : '0';
            const tdLanded = fightDetails ? fightDetails[`${prefix}td_landed`] || '0' : '0';
            const knockdowns = fightDetails ? fightDetails[`${prefix}kd`] || '0' : '0';

            winnerCard.innerHTML = `
                <div class="winner-card-header">
                    <div class="winner-info">
                        <h4>${winner.name}</h4>
                        <div class="winner-method">${fightDetails ? fightDetails.method : 'N/A'}</div>
                    </div>
                </div>
                <div class="winner-stats">
                    <div class="winner-stat">
                        <span class="winner-stat-label">Record</span>
                        <span class="winner-stat-value">${fighterData.wins}-${fighterData.losses}-${fighterData.draws}</span>
                    </div>
                    <div class="winner-stat">
                        <span class="winner-stat-label">Strikes</span>
                        <span class="winner-stat-value">${sigStrLanded}</span>
                    </div>
                    <div class="winner-stat">
                        <span class="winner-stat-label">Accuracy</span>
                        <span class="winner-stat-value">${sigStrAcc}%</span>
                    </div>
                    <div class="winner-stat">
                        <span class="winner-stat-label">Takedowns</span>
                        <span class="winner-stat-value">${tdLanded}</span>
                    </div>
                </div>
                <button class="winner-profile-btn" onclick="EventDetails.viewFighterProfile('${winner.winnerId}')">
                    View Fighter Profile
                </button>
            `;

            winnersList.appendChild(winnerCard);
        });
    },

    populateFightsTable() {
        const tbody = document.getElementById('event-fights-tbody');
        tbody.innerHTML = '';

        console.log('Populating fights table...');
        console.log('Current event fights:', this.currentEvent.fights);
        console.log('Fight details loaded:', this.fightsData.length);

        if (!this.currentEvent.fights || this.currentEvent.fights.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No fights data available</td></tr>';
            return;
        }

        this.currentEvent.fights.forEach((fight, index) => {
            const fightDetails = this.fightsData.find(f => f.fight_id === fight.fight_id);
            
            // Determine winner and loser
            let winner = fight.winner;
            let loser = 'Unknown';
            
            if (fightDetails) {
                loser = fightDetails.r_name === winner ? fightDetails.b_name : fightDetails.r_name;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fight-number">#${index + 1}</td>
                <td class="fight-winner">${winner}</td>
                <td class="fight-loser">${loser}</td>
                <td>${fightDetails ? fightDetails.division : 'N/A'}</td>
                <td><span class="method-${this.getMethodClass(fightDetails?.method)}">${fightDetails?.method || 'N/A'}</span></td>
                <td>${fightDetails?.finish_round || 'N/A'}</td>
                <td>${this.formatTime(fightDetails?.match_time_sec)}</td>
                <td>
                    <button class="fight-details-btn" onclick="EventDetails.showFightDetails('${fight.fight_id}')">
                        Details
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log(`✅ Added ${this.currentEvent.fights.length} fights to table`);
    },

    getMethodClass(method) {
        if (!method) return '';
        if (method.includes('KO') || method.includes('TKO')) return 'ko';
        if (method.includes('Submission')) return 'sub';
        if (method.includes('Decision')) return 'decision';
        return '';
    },

    formatTime(seconds) {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    showFightDetails(fightId) {
        console.log('Showing fight details:', fightId);
        
        // Navigate to fight details page
        if (typeof FightDetails !== 'undefined') {
            FightDetails.show(fightId, this.currentEvent);
        } else {
            console.error('FightDetails module not found');
        }
    },

    setupBackButton() {
        const backBtn = document.getElementById('back-to-events');
        backBtn.onclick = () => {
            if (typeof Navigation !== 'undefined') {
                Navigation.navigateTo('events');
            }
        };
    },

    viewFighterProfile(fighterId) {
        console.log('Viewing fighter profile:', fighterId);
        
        // Navigate to fighter details usando o mesmo método da tabela de fighters
        if (typeof FighterDetails !== 'undefined') {
            FighterDetails.show(fighterId);
        } else {
            console.error('FighterDetails module not found');
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EventDetails = EventDetails;
}

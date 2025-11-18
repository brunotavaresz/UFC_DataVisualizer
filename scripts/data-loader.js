// Data loader for UFC datasets

const DataLoader = {
    fighters: [],
    events: [],
    fights: [],
    ufc: [],
    
    // Load all datasets
    async loadAll() {
    try {
        await Promise.all([
            this.loadFighters(),
            this.loadEvents(),
            this.loadFights(),
            this.loadUFC()  // ← ADICIONE ESTA LINHA
        ]);
        console.log('All data loaded successfully');
        console.log(`Total fighters: ${this.fighters.length}`);
        
        // Log division distribution for debugging
        const divisionCount = {};
        this.fighters.forEach(f => {
            divisionCount[f.division] = (divisionCount[f.division] || 0) + 1;
        });
        console.log('Fighters by division:', divisionCount);
        
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
},
    
    // Load fighter details
    async loadFighters() {
        try {
            const data = await d3.csv('data/fighter_details.csv');
            this.fighters = data.map(d => {
                const weight = +d.weight || 0;
                const division = getWeightDivision(weight);
                
                return {
                    id: d.id,
                    name: d.name,
                    nickname: d.nick_name || '',
                    wins: +d.wins || 0,
                    losses: +d.losses || 0,
                    draws: +d.draws || 0,
                    height: +d.height || 0,
                    weight: weight,
                    reach: +d.reach || 0,
                    stance: d.stance || 'Unknown',
                    dob: d.dob,
                    age: calculateAge(d.dob),
                    winRate: calculateWinRate(+d.wins, +d.losses, +d.draws),
                    division: division,
                    // Stats
                    splm: +d.splm || 0,
                    str_acc: +d.str_acc || 0,
                    sapm: +d.sapm || 0,
                    str_def: +d.str_def || 0,
                    td_avg: +d.td_avg || 0,
                    td_avg_acc: +d.td_avg_acc || 0,
                    td_def: +d.td_def || 0,
                    sub_avg: +d.sub_avg || 0
                };
            });
            console.log(`Loaded ${this.fighters.length} fighters`);
        } catch (error) {
            console.error('Error loading fighters:', error);
            throw error;
        }
    },

    // Logo após o método loadFights(), adicione:

// Load UFC data with winners
async loadUFC() {
    try {
        const data = await d3.csv('data/UFC.csv');
        this.ufc = data.map(d => ({
            event_id: d.event_id,
            event_name: d.event_name,
            date: d.date,
            location: d.location,
            fight_id: d.fight_id,
            division: d.division,
            title_fight: d.title_fight,
            method: d.method,
            finish_round: d.finish_round,
            match_time_sec: d.match_time_sec,
            total_rounds: d.total_rounds,
            referee: d.referee,
            // Red corner
            r_name: d.r_name,
            r_id: d.r_id,
            r_kd: +d.r_kd || 0,
            r_sig_str_landed: +d.r_sig_str_landed || 0,
            r_sig_str_atmpted: +d.r_sig_str_atmpted || 0,
            r_sig_str_acc: +d.r_sig_str_acc || 0,
            r_total_str_landed: +d.r_total_str_landed || 0,
            r_total_str_atmpted: +d.r_total_str_atmpted || 0,
            r_td_landed: +d.r_td_landed || 0,
            r_td_atmpted: +d.r_td_atmpted || 0,
            r_ctrl: +d.r_ctrl || 0,
            r_str_def: +d.r_str_def || 0,
            // Blue corner
            b_name: d.b_name,
            b_id: d.b_id,
            b_kd: +d.b_kd || 0,
            b_sig_str_landed: +d.b_sig_str_landed || 0,
            b_sig_str_atmpted: +d.b_sig_str_atmpted || 0,
            b_sig_str_acc: +d.b_sig_str_acc || 0,
            b_total_str_landed: +d.b_total_str_landed || 0,
            b_total_str_atmpted: +d.b_total_str_atmpted || 0,
            b_td_landed: +d.b_td_landed || 0,
            b_td_atmpted: +d.b_td_atmpted || 0,
            b_ctrl: +d.b_ctrl || 0,
            b_str_def: +d.b_str_def || 0,
            // Winner
            winner: d.winner,
            winner_id: d.winner_id
        }));
        
        // Também armazena globalmente para acesso fácil
        window.ufcData = this.ufc;
        
        console.log(`Loaded ${this.ufc.length} UFC fights with winners`);
    } catch (error) {
        console.error('Error loading UFC data:', error);
        this.ufc = [];
        window.ufcData = [];
    }
},
    
    // Load events
    async loadEvents() {
        try {
            const data = await d3.csv('data/event_details.csv');
            this.events = data;
            console.log(`Loaded ${this.events.length} event rows`);
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
        }
    },
    
    // Load fights
    async loadFights() {
        try {
            const data = await d3.csv('data/fight_details.csv');
            this.fights = data;
            console.log(`Loaded ${this.fights.length} fights`);
        } catch (error) {
            console.error('Error loading fights:', error);
            this.fights = [];
        }
    },
    
    // Get fighter by ID
    getFighterById(id) {
        return this.fighters.find(f => f.id === id);
    },
    
    // Filter fighters by criteria
    filterFighters(criteria) {
        return this.fighters.filter(fighter => {
            // Search by name or nickname
            if (criteria.search) {
                const search = criteria.search.toLowerCase();
                const matchName = fighter.name.toLowerCase().includes(search);
                const matchNickname = fighter.nickname.toLowerCase().includes(search);
                if (!matchName && !matchNickname) return false;
            }
            
            // Filter by division
            if (criteria.division && fighter.division !== criteria.division) {
                return false;
            }
            
            // Filter by stance
            if (criteria.stance && fighter.stance !== criteria.stance) {
                return false;
            }
            
            // Filter by win rate range
            if (criteria.winRateMin !== null && fighter.winRate < criteria.winRateMin) {
                return false;
            }
            if (criteria.winRateMax !== null && fighter.winRate > criteria.winRateMax) {
                return false;
            }
            
            // Filter by age range
            if (criteria.ageMin !== null && fighter.age < criteria.ageMin) {
                return false;
            }
            if (criteria.ageMax !== null && fighter.age > criteria.ageMax) {
                return false;
            }
            
            // Filter by height range (in cm)
            if (criteria.heightMin && fighter.height < criteria.heightMin) {
                return false;
            }
            if (criteria.heightMax && fighter.height > criteria.heightMax) {
                return false;
            }
            
            // Filter by weight range (in kg)
            if (criteria.weightMin && fighter.weight < criteria.weightMin) {
                return false;
            }
            if (criteria.weightMax && fighter.weight > criteria.weightMax) {
                return false;
            }
            
            return true;
        });
    },
    
    // Get all unique divisions (for filter dropdown)
    getDivisions() {
        const divisions = [...new Set(this.fighters.map(f => f.division))];
        return divisions.filter(d => d !== 'unknown').sort();
    },
    
    // Get all unique stances (for filter dropdown)
    getStances() {
        const stances = [...new Set(this.fighters.map(f => f.stance))];
        return stances.filter(s => s && s !== 'Unknown').sort();
    }
};
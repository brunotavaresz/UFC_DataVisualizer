// Data loader for UFC datasets

const DataLoader = {
    fighters: [],
    events: [],
    fights: [],
    ufc: [],
    
    async loadAll() {
        try {
            await Promise.all([
                this.loadFighters(),
                this.loadEvents(),
                this.loadFights(),
                this.loadUFC()
            ]);
            console.log('All data loaded successfully');
            console.log(`Total fighters: ${this.fighters.length}`);
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    },
    
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
                match_time_sec: +d.match_time_sec || 0,
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
                r_sub_att: +d.r_sub_att || 0,
                r_ctrl: +d.r_ctrl || 0,
                r_str_def: +d.r_str_def || 0,
                // STRIKES BY TARGET - RED
                r_head_landed: +d.r_head_landed || 0,
                r_head_atmpted: +d.r_head_atmpted || 0,
                r_body_landed: +d.r_body_landed || 0,
                r_body_atmpted: +d.r_body_atmpted || 0,
                r_leg_landed: +d.r_leg_landed || 0,
                r_leg_atmpted: +d.r_leg_atmpted || 0,
                r_dist_landed: +d.r_dist_landed || 0,
                r_clinch_landed: +d.r_clinch_landed || 0,
                r_ground_landed: +d.r_ground_landed || 0,
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
                b_sub_att: +d.b_sub_att || 0,
                b_ctrl: +d.b_ctrl || 0,
                b_str_def: +d.b_str_def || 0,
                // STRIKES BY TARGET - BLUE
                b_head_landed: +d.b_head_landed || 0,
                b_head_atmpted: +d.b_head_atmpted || 0,
                b_body_landed: +d.b_body_landed || 0,
                b_body_atmpted: +d.b_body_atmpted || 0,
                b_leg_landed: +d.b_leg_landed || 0,
                b_leg_atmpted: +d.b_leg_atmpted || 0,
                b_dist_landed: +d.b_dist_landed || 0,
                b_clinch_landed: +d.b_clinch_landed || 0,
                b_ground_landed: +d.b_ground_landed || 0,
                // Winner
                winner: d.winner,
                winner_id: d.winner_id
            }));
            
            window.ufcData = this.ufc;
            console.log(`Loaded ${this.ufc.length} UFC fights`);
        } catch (error) {
            console.error('Error loading UFC data:', error);
            this.ufc = [];
            window.ufcData = [];
        }
    },
    
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
    
    getFighterById(id) {
        return this.fighters.find(f => f.id === id);
    },
    
    filterFighters(criteria) {
        return this.fighters.filter(fighter => {
            if (criteria.search) {
                const search = criteria.search.toLowerCase();
                const matchName = fighter.name.toLowerCase().includes(search);
                const matchNickname = fighter.nickname.toLowerCase().includes(search);
                if (!matchName && !matchNickname) return false;
            }
            if (criteria.division && fighter.division !== criteria.division) return false;
            if (criteria.stance && fighter.stance !== criteria.stance) return false;
            if (criteria.winRateMin !== null && fighter.winRate < criteria.winRateMin) return false;
            if (criteria.winRateMax !== null && fighter.winRate > criteria.winRateMax) return false;
            if (criteria.ageMin !== null && fighter.age < criteria.ageMin) return false;
            if (criteria.ageMax !== null && fighter.age > criteria.ageMax) return false;
            if (criteria.heightMin && fighter.height < criteria.heightMin) return false;
            if (criteria.heightMax && fighter.height > criteria.heightMax) return false;
            if (criteria.weightMin && fighter.weight < criteria.weightMin) return false;
            if (criteria.weightMax && fighter.weight > criteria.weightMax) return false;
            return true;
        });
    },
    
    getDivisions() {
        const divisions = [...new Set(this.fighters.map(f => f.division))];
        return divisions.filter(d => d !== 'unknown').sort();
    },
    
    getStances() {
        const stances = [...new Set(this.fighters.map(f => f.stance))];
        return stances.filter(s => s && s !== 'Unknown').sort();
    }
};
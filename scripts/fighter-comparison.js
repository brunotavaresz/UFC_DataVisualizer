// Fighter Comparison System
const FighterComparison = {
    fighter1: null, // Fighter from details page
    fighter2: null, // Fighter selected by search
    
    // Inicia a comparação com o fighter da página de detalhes
    startComparison(fighterId) {
        this.fighter1 = DataLoader.getFighterById(fighterId);
        
        if (!this.fighter1) {
            console.error('Fighter not found:', fighterId);
            return;
        }
        
        Navigation.navigateTo('fighter-comparison-select');
        this.renderSelectionPage();
    },
    
    // Página de seleção (escolher o segundo fighter)
    renderSelectionPage() {
        const page = document.getElementById('fighter-comparison-select');
        page.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 3rem;
        `;
        
        const title = document.createElement('h1');
        title.style.cssText = `
            color: #fff;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        `;
        title.textContent = 'Compare Fighters';
        
        const subtitle = document.createElement('p');
        subtitle.style.cssText = `
            color: #888;
            font-size: 1.1rem;
        `;
        subtitle.textContent = 'Select a fighter to compare with ' + this.fighter1.name;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        container.appendChild(header);
        
        // Comparison Preview Cards
        const cardsContainer = document.createElement('div');
        cardsContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 2rem;
            align-items: center;
            margin-bottom: 3rem;
        `;
        
        // Fighter 1 Card (selected)
        cardsContainer.appendChild(this.createFighterPreviewCard(this.fighter1, true));
        
        // VS Badge
        const vsBadge = document.createElement('div');
        vsBadge.style.cssText = `
            background: linear-gradient(135deg, #d91c1c, #ff4444);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 900;
            color: white;
            box-shadow: 0 8px 32px rgba(217, 28, 28, 0.6);
            border: 4px solid #fff;
        `;
        vsBadge.textContent = 'VS';
        cardsContainer.appendChild(vsBadge);
        
        // Fighter 2 Card (empty - to be selected)
        cardsContainer.appendChild(this.createEmptyFighterCard());
        
        container.appendChild(cardsContainer);
        
        // Search Section
        const searchSection = document.createElement('div');
        searchSection.style.cssText = `
            background: #1a1a1a;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #333;
        `;
        
        const searchTitle = document.createElement('h2');
        searchTitle.style.cssText = `
            color: #fff;
            margin: 0 0 1.5rem 0;
            font-size: 1.5rem;
        `;
        searchTitle.textContent = 'Search for a Fighter';
        searchSection.appendChild(searchTitle);
        
        // Search Input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Type fighter name...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 1rem 1.5rem;
            background: #2d2d2d;
            border: 2px solid #444;
            border-radius: 12px;
            color: #fff;
            font-size: 1rem;
            margin-bottom: 1.5rem;
            transition: border-color 0.3s ease;
        `;
        
        searchInput.addEventListener('focus', () => {
            searchInput.style.borderColor = '#d91c1c';
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = '#444';
        });
        
        searchSection.appendChild(searchInput);
        
        // Results Container
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'search-results';
        resultsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            max-height: 500px;
            overflow-y: auto;
        `;
        
        searchSection.appendChild(resultsContainer);
        container.appendChild(searchSection);
        
        // Search functionality
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchFighters(e.target.value, resultsContainer);
            }, 300);
        });
        
        // Initial load - show all fighters
        this.searchFighters('', resultsContainer);
        
        page.appendChild(container);
    },
    
    createFighterPreviewCard(fighter, isSelected) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            border: 2px solid ${isSelected ? '#d91c1c' : '#333'};
            box-shadow: ${isSelected ? '0 8px 32px rgba(217, 28, 28, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.3)'};
            position: relative;
        `;
        
        if (isSelected) {
            const badge = document.createElement('div');
            badge.style.cssText = `
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: #d91c1c;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            `;
            badge.textContent = 'SELECTED';
            card.appendChild(badge);
        }
        
        // Fighter Image
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            width: 250px;
            height: 350px;
            margin: 0 auto 1.5rem;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            border: 3px solid ${isSelected ? '#d91c1c' : '#444'};
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative; /* necessário para spinner absoluto */
        `;

        const img = document.createElement('img');
        img.className = 'fighter-photo loading';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain; /* preserva toda a imagem sem cortar a testa */
            object-position: top center; /* prioriza mostrar a parte superior (cabeça) */
            background: #000;
        `;

        // small spinner while loading
        const spinner = document.createElement('div');
        spinner.className = 'mini-spinner';
        imgContainer.appendChild(spinner);

        // Load photo
        if (typeof FighterPhotos !== 'undefined') {
            FighterPhotos.getFighterPhotos(fighter).then(photos => {
                img.src = photos.fullBody || photos.headshot || '';
            }).catch(() => {
                // on error, let the img error handler handle fallback
                img.src = '';
            });
        } else {
            const initials = fighter.name.split(' ').map(n => n[0]).join('');
            // remove spinner and show initials
            spinner.remove();
            imgContainer.innerHTML = `
                <div style="
                    font-size: 4rem;
                    font-weight: bold;
                    color: ${isSelected ? '#d91c1c' : '#666'};
                ">${initials}</div>
            `;
        }

        // Image load / error handling
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
            if (spinner && spinner.parentNode) spinner.remove();
        });

        img.addEventListener('error', () => {
            if (spinner && spinner.parentNode) spinner.remove();
            img.classList.remove('loading');
            img.classList.add('loaded');
            // fallback to initials if image fails
            const initials = fighter.name.split(' ').map(n => n[0]).join('');
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.style.cssText = `font-size: 4rem; font-weight: bold; color: ${isSelected ? '#d91c1c' : '#666'};`;
            fallback.textContent = initials;
            imgContainer.appendChild(fallback);
        });

        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        
        // Fighter Name
        const name = document.createElement('h3');
        name.style.cssText = `
            color: #fff;
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
        `;
        name.textContent = fighter.name;
        card.appendChild(name);
        
        // Fighter Record
        const record = document.createElement('div');
        record.style.cssText = `
            color: #888;
            font-size: 1rem;
        `;
        record.textContent = `${fighter.wins}-${fighter.losses}-${fighter.draws}`;
        card.appendChild(record);
        
        return card;
    },
    
    createEmptyFighterCard() {
        const card = document.createElement('div');
        card.id = 'fighter2-preview';
        card.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            border: 2px dashed #444;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            min-height: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const icon = document.createElement('div');
        icon.style.cssText = `
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        `;
        icon.textContent = '❓';
        
        const text = document.createElement('p');
        text.style.cssText = `
            color: #666;
            font-size: 1.2rem;
        `;
        text.textContent = 'Select a fighter below';
        
        card.appendChild(icon);
        card.appendChild(text);
        
        return card;
    },
    
    searchFighters(query, container) {
        // Não limpar o container - apenas atualizar os cards
        const existingCards = container.querySelectorAll('.fighter-search-card');
        
        const allFighters = DataLoader.fighters;
        
        // Filter out the current fighter and search by name
        const results = allFighters.filter(f => 
            f.id !== this.fighter1.id && 
            f.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 20); // Limit to 20 results
        
        if (results.length === 0) {
            container.innerHTML = '';
            const noResults = document.createElement('div');
            noResults.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                color: #666;
            `;
            noResults.textContent = query ? 'No fighters found' : 'Type to search fighters...';
            container.appendChild(noResults);
            return;
        }
        
        // Remover cards que não estão nos novos resultados
        existingCards.forEach(card => {
            const fighterId = card.dataset.fighterId;
            if (!results.find(f => f.id === fighterId)) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => card.remove(), 200);
            }
        });
        
        // Adicionar novos cards
        results.forEach((fighter, index) => {
            // Se o card já existe, não fazer nada
            const existingCard = container.querySelector(`[data-fighter-id="${fighter.id}"]`);
            if (existingCard) return;
            
            const card = document.createElement('div');
            card.className = 'fighter-search-card';
            card.dataset.fighterId = fighter.id;
            card.style.cssText = `
                background: #242424;
                border-radius: 12px;
                padding: 1rem;
                text-align: center;
                border: 2px solid #333;
                cursor: pointer;
                transition: all 0.3s ease;
                opacity: 0;
                transform: scale(0.9);
            `;
            
            // Animar entrada do card
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 30);
            
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#d91c1c';
                card.style.transform = 'translateY(-5px) scale(1)';
                card.style.boxShadow = '0 8px 24px rgba(217, 28, 28, 0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#333';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
            });
            
            card.addEventListener('click', () => {
                this.selectFighter2(fighter);
            });
            
            // Fighter thumbnail
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                width: 100%;
                height: 150px;
                background: #000;
                border-radius: 8px;
                margin-bottom: 0.75rem;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            `;

            const img = document.createElement('img');
            img.className = 'fighter-photo loading';
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
                object-position: top center;
                background: #000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            // Pequeno spinner no card
            const spinner = document.createElement('div');
            spinner.className = 'mini-spinner';
            imgContainer.appendChild(spinner);

            if (typeof FighterPhotos !== 'undefined') {
                FighterPhotos.getFighterPhotos(fighter).then(photos => {
                    img.src = photos.headshot || photos.fullBody || '';
                }).catch(() => {
                    img.src = '';
                });
            } else {
                const initials = fighter.name.split(' ').map(n => n[0]).join('');
                spinner.remove();
                imgContainer.innerHTML = `
                    <div style="
                        font-size: 2rem;
                        font-weight: bold;
                        color: #666;
                    ">${initials}</div>
                `;
            }

            img.addEventListener('load', () => {
                img.classList.remove('loading');
                img.classList.add('loaded');
                img.style.opacity = '1';
                if (spinner && spinner.parentNode) spinner.remove();
            });

            img.addEventListener('error', () => {
                if (spinner && spinner.parentNode) spinner.remove();
                img.classList.remove('loading');
                img.classList.add('loaded');
                img.style.display = 'none';
                const initials = fighter.name.split(' ').map(n => n[0]).join('');
                const fallback = document.createElement('div');
                fallback.style.cssText = 'font-size:2rem; font-weight:bold; color:#666;';
                fallback.textContent = initials;
                imgContainer.appendChild(fallback);
            });

            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
            
            const name = document.createElement('div');
            name.style.cssText = `
                color: #fff;
                font-weight: 600;
                font-size: 0.95rem;
                margin-bottom: 0.25rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            name.textContent = fighter.name;
            
            const record = document.createElement('div');
            record.style.cssText = `
                color: #888;
                font-size: 0.85rem;
            `;
            record.textContent = `${fighter.wins}-${fighter.losses}-${fighter.draws}`;
            
            card.appendChild(name);
            card.appendChild(record);
            container.appendChild(card);
        });
    },
    
    selectFighter2(fighter) {
        this.fighter2 = fighter;
        
        // Update preview card
        const previewCard = document.getElementById('fighter2-preview');
        const newCard = this.createFighterPreviewCard(fighter, false);
        newCard.id = 'fighter2-preview';
        
        previewCard.replaceWith(newCard);
        
        // Show compare button
        this.showCompareButton();
    },
    
    showCompareButton() {
        // Remove existing button if any
        const existing = document.getElementById('compare-btn-container');
        if (existing) existing.remove();
        
        const container = document.createElement('div');
        container.id = 'compare-btn-container';
        container.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            animation: slideUp 0.5s ease;
        `;
        
        const button = document.createElement('button');
        button.style.cssText = `
            background: linear-gradient(135deg, #d91c1c, #ff4444);
            border: none;
            border-radius: 50px;
            padding: 1.25rem 3rem;
            color: white;
            font-size: 1.3rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(217, 28, 28, 0.6);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        button.innerHTML = '⚔️ COMPARE FIGHTERS';
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 12px 40px rgba(217, 28, 28, 0.8)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 8px 32px rgba(217, 28, 28, 0.6)';
        });
        
        button.addEventListener('click', () => {
            this.showComparisonPage();
        });
        
        container.appendChild(button);
        const page = document.getElementById('fighter-comparison-select');
        page.appendChild(container);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    showComparisonPage() {
        // Remove compare button
        const btn = document.getElementById('compare-btn-container');
        if (btn) btn.remove();

        // Ensure a second fighter was selected
        if (!this.fighter2) {
            console.error('No fighter selected for comparison');
            return;
        }

        // If the full comparison module is available, delegate rendering to it.
        // FighterComparisonResult.show handles navigation, loading state and rendering.
        if (typeof FighterComparisonResult !== 'undefined' && typeof FighterComparisonResult.show === 'function') {
            try {
                FighterComparisonResult.show(this.fighter1, this.fighter2);
            } catch (err) {
                console.error('Error invoking FighterComparisonResult.show:', err);
                // Fallback to simple navigation/placeholder if something fails
                Navigation.navigateTo('fighter-comparison-result');
                const page = document.getElementById('fighter-comparison-result');
                page.innerHTML = `
                    <div style="text-align: center; padding: 4rem; color: white;">
                        <h1 style="font-size: 3rem; margin-bottom: 2rem;">
                            ${this.fighter1.name} 
                            <span style="color: #d91c1c;">VS</span> 
                            ${this.fighter2.name}
                        </h1>
                        <p style="color: #888; font-size: 1.2rem;">
                            Comparison module unavailable — fallback placeholder.
                        </p>
                    </div>
                `;
            }
        } else {
            // If module not present, navigate and show a lightweight placeholder
            Navigation.navigateTo('fighter-comparison-result');
            const page = document.getElementById('fighter-comparison-result');
            page.innerHTML = `
                <div style="text-align: center; padding: 4rem; color: white;">
                    <h1 style="font-size: 3rem; margin-bottom: 2rem;">
                        ${this.fighter1.name} 
                        <span style="color: #d91c1c;">VS</span> 
                        ${this.fighter2.name}
                    </h1>
                    <p style="color: #888; font-size: 1.2rem;">
                        Comparison module not loaded. Make sure <code>fighter-comparison-result.js</code> is included.
                    </p>
                </div>
            `;
        }
    }
};
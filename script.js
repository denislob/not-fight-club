
let player = {
    name: '',
    avatar: '1',
    wins: 0,
    losses: 0,
    draws: 0,
    health: 100,
    maxHealth: 100
};

let enemy = {
    type: '',
    name: '',
    avatar: '',
    health: 100,
    maxHealth: 100,
    attackZones: 1,
    defenseZones: 1
};

let battleState = {
    playerAttack: [],
    playerDefense: [],
    enemyAttack: [],
    enemyDefense: [],
    log: []
};


const bodyZones = ['head', 'hands', 'legs', 'stomach', 'chest'];


const enemies = {
    goblin: {
        name: 'Goblin',
        avatar: 'assets/images/goblin.png',
        maxHealth: 100,
        attackZones: 1,
        defenseZones: 2
    },
    spider: {
        name: 'Spider Monster',
        avatar: 'assets/images/spider.png',
        maxHealth: 80,
        attackZones: 2,
        defenseZones: 1
    },
    troll: {
        name: 'Troll',
        avatar: 'assets/images/troll.png',
        maxHealth: 90,
        attackZones: 1,
        defenseZones: 3
    }
};


const avatars = {
    '1': 'assets/images/knight.png',
    '2': 'assets/images/robot.png',
    '3': 'assets/images/ridingHabit.png'
};


document.addEventListener('DOMContentLoaded', function() {
    loadGame();
    setupEventListeners();
    showScene('registration-screen');
});

function loadGame() {
    const savedGame = localStorage.getItem('monsterGame');
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        
       
        player = {
            name: gameState.player?.name || '',
            avatar: gameState.player?.avatar || '1',
            wins: Number(gameState.player?.wins) || 0,
            losses: Number(gameState.player?.losses) || 0,
            draws: Number(gameState.player?.draws) || 0,
            health: Number(gameState.player?.health) || 100,
            maxHealth: Number(gameState.player?.maxHealth) || 100
        };
        
        
        if (gameState.enemy) {
            enemy = {
                type: gameState.enemy.type || '',
                name: gameState.enemy.name || '',
                avatar: gameState.enemy.avatar || '',
                health: Number(gameState.enemy.health) || 100,
                maxHealth: Number(gameState.enemy.maxHealth) || 100,
                attackZones: Number(gameState.enemy.attackZones) || 1,
                defenseZones: Number(gameState.enemy.defenseZones) || 1
            };
        }
        
        battleState = gameState.battleState || {
            playerAttack: [],
            playerDefense: [],
            enemyAttack: [],
            enemyDefense: [],
            log: []
        };
        
        
        if (battleState && battleState.playerAttack.length > 0) {
            
            document.getElementById('player-max-health').textContent = player.maxHealth;
            if (enemy.name) {
                document.getElementById('enemy-max-health').textContent = enemy.maxHealth;
            }
            
            updateCombatInterface();
            showScene('battle-screen');
        } else if (player.name) {
            showScene('home-screen');
            updatePlayer();
        }
    }
}


function saveGame() {
    const gameState = {
        player,
        enemy,
        battleState
    };
    localStorage.setItem('monsterGame', JSON.stringify(gameState));
}

function setupEventListeners() {
   
    document.getElementById('register-btn').addEventListener('click', registerPlayer);
    
    
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            showScene(screenId);
            
            if (screenId === 'character-screen') {
                updateCharacterScene();
            }
        });
    });
    
   
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', function() {
            const avatarId = this.getAttribute('data-avatar');
            selectAvatar(avatarId);
        });
    });
    
    
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    
    document.getElementById('start-battle-btn').addEventListener('click', function() {
        showScene('enemy-select-screen');
    });

    document.querySelectorAll('.enemy-option').forEach(option => {
        option.addEventListener('click', function() {
            const enemyType = this.getAttribute('data-enemy');
            startFight(enemyType);
        });
    });

    document.getElementById('enemy-select-screen').addEventListener('show', function() {
        document.querySelectorAll('.enemy-option').forEach(option => {
            const enemyType = option.getAttribute('data-enemy');
            option.innerHTML = `<img src="${enemies[enemyType].avatar}" alt="${enemies[enemyType].name}" class="enemy-option-image">
                               <div>${enemies[enemyType].name}</div>`;
        });
    });

    document.querySelectorAll('.body-zone').forEach(zone => {
        zone.addEventListener('click', function() {
            selectBodyZone(this);
        });
    }); 

    document.getElementById('attack-btn').addEventListener('click', executeAttack);    
    
}

function showScene(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function registerPlayer() {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName) {
        player.name = playerName;
        saveGame();
        updatePlayer();
        showScene('home-screen');
    } 
}

function updatePlayer() {
    document.getElementById('player-name-display').textContent = player.name;
    document.getElementById('character-name').textContent = player.name;
    document.getElementById('player-name-battle').textContent = player.name;
    document.getElementById('wins-count').textContent = player.wins;
    document.getElementById('losses-count').textContent = player.losses;
    document.getElementById('draws-count').textContent = player.draws; 
    
    
    document.getElementById('current-avatar').innerHTML = `<img src="${avatars[player.avatar]}" alt="Avatar" class="avatar-image">`;
    document.getElementById('player-avatar-battle').innerHTML = `<img src="${avatars[player.avatar]}" alt="Avatar" class="avatar-image">`;

    
    document.getElementById('player-health').textContent = player.health;
    document.getElementById('player-max-health').textContent = player.maxHealth;
}

function saveSettings() {
    const newName = document.getElementById('new-player-name').value.trim();
    if (newName) {
        player.name = newName;
        saveGame();
        updatePlayer();
                
    } 
}

function executeAttack() {
    
    commitEnemyActions();
    
    
    processCombatLogic();
    
    
    updateCombatInterface();
    
    
    if (player.health <= 0 || enemy.health <= 0) {
        endFight();
    }
    
    
    resetBodyZones();
    
    saveGame();
}

function commitEnemyActions() {
   
    battleState.enemyAttack = [];
    for (let i = 0; i < enemy.attackZones; i++) {
        let availableParts = bodyZones.filter(part => !battleState.enemyAttack.includes(part));
        if (availableParts.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableParts.length);
            battleState.enemyAttack.push(availableParts[randomIndex]);
        }
    }
    
   
    battleState.enemyDefense = [];
    for (let i = 0; i < enemy.defenseZones; i++) {
        let availableParts = bodyZones.filter(part => !battleState.enemyDefense.includes(part));
        if (availableParts.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableParts.length);
            battleState.enemyDefense.push(availableParts[randomIndex]);
        }
    }
}

function processCombatLogic() {
    const damagePerHit = 10;
    const critChance = 0.2; 
    
   
    battleState.playerAttack.forEach(attackPart => {
        const isCrit = Math.random() < critChance;
        let damage = damagePerHit;
        
        if (isCrit) {
            damage = Math.floor(damage * 1.5);
        }
        
        if (battleState.enemyDefense.includes(attackPart)) {
            
            if (isCrit) {
                
                enemy.health -= damage;
                displayLogEntry(`${player.name} delivered a CRITICAL blow to the ${attackPart.toUpperCase()} and broke through the defense, dealing ${damage} damage!`);
            } else {
                
                displayLogEntry(`${player.name} attacked in the ${attackPart.toUpperCase()}, but ${enemy.name} blocked the blow.`);
            }
        } else {
            
            enemy.health -= damage;
            if (isCrit) {
                displayLogEntry(`${player.name} delivered a CRITICAL blow to the ${attackPart.toUpperCase()} and dealt ${damage} damage!`);
            } else {
                displayLogEntry(`${player.name} attacked in the ${attackPart.toUpperCase()} and caused ${damage} damage.`);
            }
        }
    });
    
    
    battleState.enemyAttack.forEach(attackPart => {
        const isCrit = Math.random() < critChance;
        let damage = damagePerHit;
        
        if (isCrit) {
            damage = Math.floor(damage * 1.5);
        }
        
        if (battleState.playerDefense.includes(attackPart)) {
           
            if (isCrit) {
               
                player.health -= damage;
                displayLogEntry(`${enemy.name} delivered a CRITICAL blow to the ${attackPart.toUpperCase()} and broke through your defense, dealing ${damage} damage!`);
            } else {
                
                displayLogEntry(`${enemy.name} attacked you in the ${attackPart.toUpperCase()}, but you blocked the blow.`);
            }
        } else {
            
            player.health -= damage;
            if (isCrit) {
                displayLogEntry(`${enemy.name} delivered a CRITICAL blow to the ${attackPart.toUpperCase()} and caused ${damage} damage!`);
            } else {
                displayLogEntry(`${enemy.name} attacked you in the ${attackPart.toUpperCase()} and caused ${damage} damage.`);
            }
        }
    });
    
   
    player.health = Math.max(0, player.health);
    enemy.health = Math.max(0, enemy.health);
}

function displayLogEntry(message) {
    battleState.log.push(message);
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = stylizeKeywords(message);
    document.getElementById('log-entries').appendChild(logEntry);
    
    
    const logContainer = document.getElementById('log-entries');
    logContainer.scrollTop = logContainer.scrollHeight;
}


function stylizeKeywords(text) {
    const keywords = [player.name, enemy.name, 'head', 'hands', 'legs', 'stomach', 'chest', 'damage', 'critical', 'blocked'];
    
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        text = text.replace(regex, `<span class="highlight">${keyword.toUpperCase()}</span>`);
    });
    
    return text;
}

function updateCombatInterface() {
    
    const playerHealth = Number(player.health);
    const playerMaxHealth = Number(player.maxHealth);
    const enemyHealth = Number(enemy.health);
    const enemyMaxHealth = Number(enemy.maxHealth);
    
    
    document.getElementById('player-health').textContent = playerHealth;
    document.getElementById('player-max-health').textContent = playerMaxHealth;
    document.getElementById('enemy-health').textContent = enemyHealth;
    document.getElementById('enemy-max-health').textContent = enemyMaxHealth;
    
    
    const playerHealthPercent = (playerHealth / playerMaxHealth) * 100;
    const enemyHealthPercent = (enemyHealth / enemyMaxHealth) * 100;
    
    document.getElementById('player-health-bar').style.width = `${playerHealthPercent}%`;
    document.getElementById('enemy-health-bar').style.width = `${enemyHealthPercent}%`;
}

function updateCharacterScene() {
    document.getElementById('character-name').textContent = player.name;
    document.getElementById('wins-count').textContent = player.wins;
    document.getElementById('losses-count').textContent = player.losses;
    document.getElementById('draws-count').textContent = player.draws; 
    
   
    document.querySelectorAll('.avatar-option').forEach(option => {
        const avatarId = option.getAttribute('data-avatar');
        option.innerHTML = `<img src="${avatars[avatarId]}" alt="Avatar ${avatarId}" class="avatar-option-image">`;
        
        if (option.getAttribute('data-avatar') === player.avatar) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function selectAvatar(avatarId) {
    player.avatar = avatarId;
    saveGame();
    updatePlayer();
    
    
    document.querySelectorAll('.avatar-option').forEach(option => {
        if (option.getAttribute('data-avatar') === avatarId) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function startFight(enemyType) {
    enemy = {...enemies[enemyType]};
    enemy.health = enemy.maxHealth;
    player.health = player.maxHealth;
    
    battleState = {
        playerAttack: [],
        playerDefense: [],
        enemyAttack: [],
        enemyDefense: [],
        log: []
    };
    
    
    document.getElementById('enemy-name').textContent = enemy.name;
    document.getElementById('enemy-name-battle').textContent = enemy.name;
    document.getElementById('enemy-avatar-battle').innerHTML = `<img src="${enemy.avatar}" alt="${enemy.name}" class="avatar-image">`;
    
    
    document.getElementById('player-health').textContent = player.health;
    document.getElementById('player-max-health').textContent = player.maxHealth;
    document.getElementById('enemy-health').textContent = enemy.health;
    document.getElementById('enemy-max-health').textContent = enemy.maxHealth;
    
    document.getElementById('player-health-bar').style.width = '100%';
    document.getElementById('enemy-health-bar').style.width = '100%';
    
   
    document.getElementById('log-entries').innerHTML = '';
    
    
    resetBodyZones();
    
    showScene('battle-screen');
    saveGame();
}

function selectBodyZone(element) {
    const part = element.getAttribute('data-part');
    const zone = element.closest('.attack-zone') ? 'attack' : 'defense';
    
    if (zone === 'attack') {
        
        if (battleState.playerAttack.includes(part)) {
            
            battleState.playerAttack = battleState.playerAttack.filter(p => p !== part);
            element.classList.remove('selected');
        } else {
            
            document.querySelectorAll('.attack-zone .body-zone').forEach(p => {
                p.classList.remove('selected');
            });
            battleState.playerAttack = [part];
            element.classList.add('selected');
        }
    } else {
       
        if (battleState.playerDefense.includes(part)) {
            
            battleState.playerDefense = battleState.playerDefense.filter(p => p !== part);
            element.classList.remove('selected');
        } else if (battleState.playerDefense.length < 2) {
            
            battleState.playerDefense.push(part);
            element.classList.add('selected');
        } 
    }
    
   
    updateAttackButton();
}


function resetBodyZones() {
    document.querySelectorAll('.body-zone').forEach(part => {
        part.classList.remove('selected');
    });
    battleState.playerAttack = [];
    battleState.playerDefense = [];
    updateAttackButton();
}


function updateAttackButton() {
    const attackBtn = document.getElementById('attack-btn');
    if (battleState.playerAttack.length === 1 && battleState.playerDefense.length === 2) {
        attackBtn.disabled = false;
    } else {
        attackBtn.disabled = true;
    }
}

function endFight() {
    let resultMessage = '';

    if (player.health <= 0 && enemy.health <= 0) {
        resultMessage = 'DRAW! Both fighters are defeated.';
        displayLogEntry(resultMessage);
        player.draws++;
    } else if (player.health <= 0) {
        resultMessage = `YOU LOSE! ${enemy.name.toUpperCase()} win.`;
        displayLogEntry(resultMessage);
        player.losses++;
    } else {
        resultMessage = `YOU WIN! ${enemy.name.toUpperCase()} is defeated.`;
        displayLogEntry(resultMessage);
        player.wins++;
    }
    
    // Блокируем кнопку атаки до начала нового боя
    document.getElementById('attack-btn').disabled = true;
    
    // Очищаем состояние боя
    battleState = {
        playerAttack: [],
        playerDefense: [],
        enemyAttack: [],
        enemyDefense: [],
        log: battleState.log
    };    
    
    saveGame();
}

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
    } else {
        showAlert('Please enter your name!');
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

function updateCharacterScene() {
    document.getElementById('character-name').textContent = player.name;
    document.getElementById('wins-count').textContent = player.wins;
    document.getElementById('losses-count').textContent = player.losses;
    document.getElementById('draws-count').textContent = player.draws; // Обновляем ничьи
    
    // Выделяем выбранный аватар
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
    
    // Обновляем выделение
    document.querySelectorAll('.avatar-option').forEach(option => {
        if (option.getAttribute('data-avatar') === avatarId) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}
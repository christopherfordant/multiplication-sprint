const { Sequelize } = require('sequelize');

// Configuration de la base de données PostgreSQL
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://localhost:5432/multiplication_sprint',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
  }
};

// Définition des modèles
const Profile = sequelize.define('Profile', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  badges: {
    type: Sequelize.JSON,
    defaultValue: []
  },
  bestScore: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  highestUnlockedLevel: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  levelStars: {
    type: Sequelize.JSON,
    defaultValue: () => Array(10).fill(0)
  },
  stats: {
    type: Sequelize.JSON,
    defaultValue: () => ({
      gamesPlayed: 0,
      levelsCleared: 0,
      totalStars: 0,
      bestLevel: 1,
      correctAnswers: 0,
      totalAnswers: 0
    })
  }
});

const Score = sequelize.define('Score', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  profileId: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: Profile,
      key: 'id'
    }
  },
  level: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  levelScore: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  totalScore: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  stars: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  mode: {
    type: Sequelize.STRING,
    defaultValue: 'classic'
  },
  accuracy: {
    type: Sequelize.FLOAT,
    defaultValue: 0
  }
});

// Relations
Profile.hasMany(Score, { foreignKey: 'profileId', as: 'scores' });
Score.belongsTo(Profile, { foreignKey: 'profileId', as: 'profile' });

// Synchronisation de la base de données
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error.message);
  }
};

module.exports = {
  sequelize,
  Profile,
  Score,
  testConnection,
  syncDatabase
};
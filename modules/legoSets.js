const setData = require("../data/setData");
const themeData = require("../data/themeData");
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });
  const Theme = sequelize.define('Theme',{
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name:{
      type: DataTypes.STRING,
    }
  })
  const Set = sequelize.define('Set', {
    set_num: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    num_parts: {
      type: DataTypes.INTEGER,
    },
    theme_id: {
      type: DataTypes.INTEGER,
    },
    img_url: {
      type: DataTypes.STRING,
    },
  });

  Set.belongsTo(Theme, {foreignKey: 'theme_id'});

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      

      // Synchronize the model with the database
      await Set.sequelize.sync();

      console.log('Initialization completed successfully');
      resolve();
    } catch (error) {
      console.error('Error initializing data:', error);
      reject(error);
    }
  });
}


async function getAllSets() {
  try {
    // Fetch all sets from the database
    const allSets = await Set.findAll({include: [Theme]});
    return allSets;
  } catch (error) {
    throw new Error("Error fetching all sets from the database: " + error.message);
  }
}

async function getAllThemes()
{
  try {
    // Fetch all sets from the database
    const allThemes = await Theme.findAll();
    return allThemes;
  } catch (error) {
    throw new Error("Error fetching all Themes from the database: " + error.message);
  }
}

async function getSetByNum(setNum) {
  try {
    // Find the set in the database by set_num
    const foundSet = await Set.findOne({
      include: [Theme],
      where: {
        set_num: setNum
      }
    });

    if (foundSet) {
      return foundSet;
    } else {
      throw new Error("Unable to find requested set");
    }
  } catch (error) {
    throw new Error("Error fetching set from the database: " + error.message);
  }
}

async function getSetsByTheme(theme) {
  try {
    // Find sets in the database where the theme name includes the provided theme (case-insensitive)

    const foundSets = await Set.findAll({include: [Theme], where: { 
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }});
    if (foundSets.length > 0) {
      return foundSets;
    } else {
      throw new Error("Unable to find requested sets");
    }
  } catch (error) {
    throw new Error("Error fetching sets from the database: " + error.message);
  }
}
async function addSet(setData) {
  try {
      await Set.create(setData); // Assuming Set is your Sequelize model for sets
  } catch (err) {
      throw err;
  }
}

async function editSet(setNum, setData) {
  try {
    // Logic to update the set with setNum using setData
    // Example using Sequelize:
    const updatedSet = await Set.update(setData, { where: { set_num: setNum } });
    if (updatedSet[0] === 1) {
      return; // Successfully updated
    } else {
      throw new Error('Set not found or not updated');
    }
  } catch (err) {
    throw new Error(`Error editing set: ${err.message}`);
  }
}
async function deleteSet(set_num) {
  try {
    // Find the set by set_num and delete it
    await Set.destroy({
      where: {
        set_num: set_num
      }
    });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}


module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme,getAllThemes,addSet,editSet,deleteSet }

// sequelize
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);

//       // NOTE: If you receive the error:

//       // insert or update on table "Sets" violates foreign key constraint //"Sets_theme_id_fkey"

//       // it is because you have a "set" in your collection that has a "theme_id" that //does not exist in the "themeData".   

//       // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, //fix the error in your .json files and re-run this code
//     }

//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });

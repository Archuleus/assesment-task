const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NFT = sequelize.define('NFT', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tokenId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'nfts',
    timestamps: true
  });

  return NFT;
};

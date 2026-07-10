const { sequelize, User, NFT } = require('../models');

const NFT_SEED_DATA = [
  {
    tokenId: '1',
    contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    walletAddress: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    name: 'CryptoArt #1'
  },
  {
    tokenId: '2',
    contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    walletAddress: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    name: 'CryptoArt #2'
  },
  {
    tokenId: '3',
    contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    walletAddress: '0x8ba1f109551bd432803012645ac1136cc46b35c6',
    name: 'PixelNFT #1'
  },
  {
    tokenId: '4',
    contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    walletAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'PixelNFT #2'
  },
  {
    tokenId: '5',
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    walletAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    name: 'MetaArt #1'
  }
];

const initDatabase = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const existingUser = await User.findOne({ where: { email: 'test@gmail.com' } });
  if (!existingUser) {
    await User.create({ email: 'test@gmail.com', password: 'testpassword' });
    console.log('Test user created: test@gmail.com');
  }

  const nftCount = await NFT.count();
  if (nftCount === 0) {
    await NFT.bulkCreate(NFT_SEED_DATA);
    console.log(`Seeded ${NFT_SEED_DATA.length} NFT records`);
  }

  console.log('Database initialized successfully');
};

module.exports = { initDatabase };

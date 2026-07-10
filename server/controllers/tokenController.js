const { NFT } = require('../models');
const { isAddress } = require('ethers');

const nftAnalytics = async (req, res) => {
  try {
    const [nfts, totalNFTs] = await Promise.all([
      NFT.findAll({ attributes: ['walletAddress'] }),
      NFT.count()
    ]);

    if (totalNFTs === 0) {
      return res.status(200).json({
        error: false,
        data: {
          totalNFTs: 0,
          walletAddresses: []
        }
      });
    }

    const rawAddresses = nfts.map((nft) => nft.walletAddress);
    const uniqueAddresses = [...new Set(rawAddresses)];
    const walletAddresses = uniqueAddresses.filter((addr) => isAddress(addr));

    res.status(200).json({
      error: false,
      data: {
        totalNFTs,
        walletAddresses
      }
    });
  } catch (error) {
    console.error('NFT analytics error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve NFT analytics'
    });
  }
};

module.exports = { nftAnalytics };

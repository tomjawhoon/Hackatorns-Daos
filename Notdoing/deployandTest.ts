// import { ethers } from 'hardhat'
// import hre from 'hardhat'
// import { BigNumber } from 'bignumber.js';

// import { getAddressList, saveAddresses } from '../utils/address'

// async function main() {
//   //   const addressList = await getAddressList(hre.network.name)

//   //   const rewardToken = addressList.RewardToken

//   // "RewardToken": "0x89B7A97F3610Aab7Da907340742873D0d4026453",

//   const rewardToken = '0x89B7A97F3610Aab7Da907340742873D0d4026453'

//   const [signer] = await ethers.getSigners()
//   const user = await signer.getAddress()
//   console.log('user', user)
//   // const myGovernor = await ethers.getContractAt(
//   //   'MyGovernor',
//   //   '0x9af98c101b226Cd68B948B05290A51Ef741697cc',
//   // )
//   const ERC20 = await ethers.getContractAt('ERC20', rewardToken)

//   const MyGovernor = await ethers.getContractFactory('MyGovernor')
//   const myGovernor = await MyGovernor.deploy(rewardToken)

//   // console.log('myGovernor deployed to:', myGovernor.address)
//   // await myGovernor.deployed()

//   const startTimestamp = Math.floor(Date.now() / 1000)
//   const endTimestamp = startTimestamp + 7 * 24 * 60 * 60 // 1 week (in seconds)

//   const description = 'New Campaign'
//   const startBlock = startTimestamp
//   const endBlock = endTimestamp

//   const rewardAmount = ethers.utils.parseEther('25000')

//   const checkApprove = await ERC20.connect(signer).approve(
//     myGovernor.address,
//     rewardAmount,
//   )
//   console.log('checkApprove', checkApprove)




//   // //!! 1st Proposal

//   const cid = '0x'
//   const workDescription = 'New Work'

//   // //!! 2nd Proposal
//   const cid1 = '0x'
//   const workDescription1 = 'New Work'

//   const resSubmit = await myGovernor.submitWork(cid, 1, workDescription, user)
//   console.log('res from submitWork:', resSubmit)


//   const balanceInCOntractAfter = await ERC20.balanceOf(
//     signer.address,
//   )

//   console.log(
//     'balance in Contract..........',
//     balanceInCOntractAfter.toString() / 10 ** 18,
//   )


//   // const balance = await ERC20.balanceOf(user)
//   // console.log('balance After claim...... APE COIN', balance.toString())

//   const resVote = await myGovernor.vote(1, user, 1)
//   console.log('resVote', resVote)
//   const balance1 = await ERC20.balanceOf(myGovernor.address)
//   console.log('balance After claim...... APE COIN', balance1.toString() / 10 ** 18)


//   const campaignId = 1
//   const claimer = user
//   const proposalId = 1

//   console.log("claimer",claimer)

//   const resClaim = await myGovernor.claimRewards(
//     campaignId,
//     claimer,
//     proposalId,
//   )
//   console.log('resClaim', resClaim)


// }

// main().catch((error) => {
//   console.error(error)
//   process.exitCode = 1
// })

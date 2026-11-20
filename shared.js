/* GANGSTER FORGE v2 — pre-deploy. Shared logic for index / forge / claim / market.
   v2 contracts NOT yet deployed (NFT/MARKET/CLAIM are ZERO placeholders).
   Mint opens via baw setMintPaused(false) after deploy + metadata + site live.
   Template fixes vs Moripals v3: forge() now takes token IDs (the v3 site
   encoded a nonexistent forge(uint256,uint256)); claim-count math subtracts
   the $GANG INITIAL_MINT; claim scan is chunked in 4000-block windows. */
const NFT = "0xb08abeeC2B4963D157F5307bB01e92DAf03B0EE9"; // GangsterV2, DEPLOYED 2026-11-20
const MARKET = "0x4dd493397A03E0A920De05952DBC9722c8257151"; // GangsterV2Market, DEPLOYED 2026-11-20
const CLAIM = "0xEb37Ff47E12e419f08379F3Df39b43BE0abE26b4"; // GangsterV2Claim, DEPLOYED 2026-11-20
const TOKEN = "0xA1b03171070C75012B64df281300e1EcEf983C4d"; // $GANG (v1 token, reused for v2)
const DEPLOY_BLOCK = 0; // NFT deploy block — FILL AFTER DEPLOY (claim scan starts here)
const ZERO = "0x0000000000000000000000000000000000000000";
const IS_PLACEHOLDER = NFT === ZERO || MARKET === ZERO || CLAIM === ZERO;
const RPCS = ["https://bsc-dataseed.bnbchain.org","https://rpc-bsc.48.club"];
const SEL_TOTAL = "0xa2309ff8", SEL_PRICEFOR = "0xd527979a", SEL_TOKENURI = "0xc87b56dd", SEL_PAUSED = "0x7e4831d3";
const SEL_LISTED = "0x05337198", SEL_LISTING = "0x107a274a", SEL_OWNEROF = "0x6352211e", SEL_ISAPPROVED = "0xe985e9c5";
const SEL_FORGECOUNT = "0xa40283d5", SEL_TIEROF = "0x53f96df2", SEL_FORGEFEE = "0x1c1c0bda", SEL_ALLOWANCE = "0xdd62ed3e", SEL_APPROVE = "0x095ea7b3", SEL_FORGE = "0x1019bdb6";
const TIERS = [
  {key:"common", name:"Street Punk", rarity:"Common", count:3889, color:"#B8B0A0", img:"images/street-punk.webp"},
  {key:"uncommon", name:"Hustler", rarity:"Uncommon", count:1944, color:"#D4AF37", img:"images/hustler.webp"},
  {key:"rare", name:"Enforcer", rarity:"Rare", count:1167, color:"#E74C3C", img:"images/enforcer.webp"},
  {key:"epic", name:"Boss", rarity:"Epic", count:544, color:"#9B59B6", img:"images/boss.webp"},
  {key:"legendary", name:"Kingpin", rarity:"Legendary", count:194, color:"#E67E22", img:"images/kingpin.webp"},
  {key:"mythic", name:"Godfather", rarity:"Mythic", count:39, color:"#FFD700", img:"images/godfather.webp"}
];
const BUNDLES = [[1,"0.0001"],[2,"0.00015"],[5,"0.0004"],[10,"0.0008"]]; // bundle totals, as v1
let provider=null, signer=null, userAddr=null;
const STR={
en:{"heroH1":"Seven thousand<br>made men. One<br><em class=\"grad\">family</em>.","palsH2":"Every rank has<br>a <em class=\"grad\">story</em>.","mintH2":"Your first man<br>is <em class=\"grad\">free</em>.","mintIntro":"Your first made man is <b style=\"color:#D4AF37\">FREE</b> — every wallet gets 1 free mint, no pool cap. Then bundle up: <b style=\"color:#D4AF37\">1 for 0.0001 · 2 for 0.00015 · 5 for 0.0004 · 10 for 0.0008 BNB</b>. Max 10 per wallet. Mint from your wallet.","freeRule":"🎩 Your first mint is <b>FREE</b> — 1 free made man per wallet, no pool cap. Bundles: <b>1 = 0.0001 BNB · 2 = 0.00015 BNB · 5 = 0.0004 BNB · 10 = 0.0008 BNB</b>. Max 10 per wallet.","rarityH2":"Six ranks,<br><em class=\"grad\">one family</em>.","marketH2":"Trade your <em class=\"grad\">made men</em>.","marketEmpty":"🎩 <b>No made men on the market yet</b> — be the first to mint, be the first to list.","gangH2":"Hold a man,<br>claim <em class=\"grad\">$GANG</em>.","docsH2":"How it <em class=\"grad\">works</em>.","docsLi1":"Connect your wallet (BNB Chain). <b>Your first mint is free</b> — every wallet gets 1 free made man, no pool cap.","roadmapH2":"Where the family <em class=\"grad\">goes</em>.","dfoot":"7,777 MADE MEN<br>FIRST MINT FREE · BNB CHAIN","title":"GANGSTER — Made Men on BNB Chain","menu":"Menu","mintNow":"MINT NOW","mintSoon":"MINT — OPENS SOON","mintLoading":"MINT — LOADING…","mintStatusLive":"Mint status: LIVE","mintStatusSoon":"Mint status: OPENS SOON","noWallet":"No browser wallet detected. Open this site inside your wallet app browser (MetaMask / Trust Wallet / Binance Wallet).","txFee":"Your wallet could not prepare this transaction (empty answer from the browser). Open this site inside your wallet app browser (MetaMask / Trust Wallet / Binance Wallet) and try again.","loadingTier":"Loading rank…","tierLoading":"Rank loading…","mintedOf":"{n} of 7,777 minted ({pct}%)","loadingCount":"Loading live count…","countError":"Could not load live count — check your connection and refresh.","noContract":"Mint not open yet — the v2 contracts are not deployed.","marketOpensLater":"The on-chain market opens after the marketplace contract is deployed.","loadingListings":"Loading listings…","listingsError":"Could not load listings — check your connection and refresh.","noListings":"No made men listed yet — be the first to list one below.","marketNotLive":"The market is not live yet.","badTokenId":"Enter a valid token ID (1–7,777).","badPrice":"Enter a valid price in BNB (more than 0).","ownerCheckFail":"Could not check the token owner — try again.","notOwner":"You don't own that token — only the owner can list it.","approving":"Approving the market contract to move your NFT — confirm in your wallet…","txSent":"Transaction sent: {h} — waiting for confirmation…","listed":"Listed! Tx: {h}","bought":"Bought! Tx: {h}","cancelled":"Listing cancelled — your man is back in your wallet. Tx: {h}","priceUpdated":"Price updated! Tx: {h}","listFailed":"List failed: {m}","buyFailed":"Buy failed: {m}","cancelFailed":"Cancel failed: {m}","updateFailed":"Update price failed: {m}","mintFailed":"Mint failed: {m}","connectFailed":"Connect failed: {m}","newPrice":"New price in BNB:","mintNotOpen":"Mint is not open yet.","qtyRange":"Quantity must be 1, 2, 5 or 10.","mintNotYet":"Mint hasn't opened yet — check back soon.","minted":"Minted! Tx: {h}","connected":"CONNECTED: {a}","connectedNote":"Connected. Your first mint is free — bundles after that: 1 for 0.0001, 2 for 0.00015, 5 for 0.0004, 10 for 0.0008 BNB.","totalFor":"Total for {q}: {amt} BNB","freeSuffix":" — FREE","seller":"Seller","explorer":"Explorer ↗","cancel":"CANCEL","updatePrice":"UPDATE PRICE","buy":"BUY","phTokenId":"Token ID","phPrice":"Price in BNB",
"previewBar":"FORGE v2 · MINT OPENS SOON · v1: 60 minted, pausing at launch","takePal":"JOIN THE FAMILY","premiseH2":"The premise","premise1T":"01 · THE STREET","premise1D":"A kid walks into the family. One wallet, one free made man — no pool cap, no gate.","premise2T":"02 · THE RISE","premise2D":"Your man rises through the ranks. Six ranks, from Street Punk to the Godfather — 7,777 in all.","premise3T":"03 · THE FORGE","premise3D":"Three Street Punks become one Hustler. Climb the ladder to the Godfather — only 39 will ever exist.","palsMarqueeH2":"The family","forgeH2":"Forge your men<br>into <em class=\"grad\">legends</em>.","forgeIntro":"Three Street Punks forge into one Hustler. Two Hustlers into one Enforcer — climb all the way to the Godfather. The first 100 forges are gas-only; after that, 1,000 $GANG burns per forge.","forgeLadderH":"THE FORGE LADDER","forgeBurn":"First 100 forges gas-only, then 1,000 $GANG burned per forge.","forgeCountLabel":"FORGES SO FAR","forgeCountSoon":"Forge count loads when v2 deploys.","forgeNotLive":"Forge is not live yet — the v2 contracts are not deployed.","forgeBtn":"FORGE","forgeSoon":"FORGE — OPENS SOON","forgeFailed":"Forge failed: {m}","forged":"Forged! Tx: {h}","tokenH2":"One man.<br><em class=\"grad\">10,000 $GANG</em>.","tokenIntro":"Every made man claims 10,000 $GANG, once, forever. Claim fee 0.0004 BNB per man — straight to the family.","tokenCap":"CAP 100M $GANG","tokenFee":"FEE 0.0004 BNB / MAN","tokenSupply":"SUPPLY 7,777 MEN","journeyH2":"The journey","journey1T":"Phase 01 — v1 done","journey1D":"60 made men minted on v1. The family proved it stands. v1 pauses when v2 opens.","journey2T":"Phase 02 — v2 mint","journey2D":"Forge v2 mint opens. First man free, bundles after that, max 10 per wallet.","journey3T":"Phase 03 — Forge season","journey3D":"The forge opens. Climb the ladder, burn $GANG, chase the 39 Godfathers.","journey4T":"Phase 04 — The family grows","journey4D":"Market, claims and the family keep growing — one man at a time.","faqH2":"Questions,<br><em class=\"grad\">answered</em>.","faq1Q":"Is my first mint really free?","faq1A":"Yes. Every wallet's first made man is free, with no pool cap. After that, bundles: 1 for 0.0001 BNB, 2 for 0.00015 BNB, 5 for 0.0004 BNB, 10 for 0.0008 BNB.","faq2Q":"How does the forge work?","faq2A":"Burn 3 Street Punks to forge 1 Hustler, 2 Hustlers to 1 Enforcer, 2 Enforcers to 1 Boss, 2 Bosses to 1 Kingpin, 2 Kingpins to 1 Godfather. The first 100 forges are gas-only; after that each forge burns 1,000 $GANG.","faq3Q":"What is $GANG?","faq3A":"$GANG is the family token. Each made man claims 10,000 $GANG once, for a fee of 0.0004 BNB per man. Cap 100M.","faq4Q":"Is v2 mint live?","faq4A":"Not yet — the v2 contracts deploy first, then mint opens. v1 (60 minted) pauses at launch.","finalH2":"There's a man<br>waiting <em class=\"grad\">for you</em>.","finalP":"7,777 men. One family. Your first one is free.","claimH2":"Claim your <em class=\"grad\">$GANG</em>.","claimIntro":"Each made man claims 10,000 $GANG, once. Fee 0.0004 BNB per man. Connect your wallet and scan your men.","claimBadgeSoon":"CLAIM — OPENS SOON","claimBadgeLive":"CLAIM — LIVE","claimNotLive":"Claim is not live yet — the token and claim contracts are not deployed.","minterSoon":"Claim opens soon — the claim contract is not wired to the token yet.","scanPals":"SCAN MY MEN","enterIds":"OR ENTER TOKEN IDS","claimBtn":"CLAIM {n} GANG","claimedSoFar":"Made men claimed so far: ","balPrefix":"GANG balance: ","balSuffix":" GANG","foundUnclaimedN":"Found {n} unclaimed made men. Tap a card to deselect.","foundUnclaimed1":"Found 1 unclaimed made man. Tap a card to deselect.","allClaimed":"All your made men already claimed their GANG.","noPals":"No made men found for this wallet.","scanMsg":"Scanning your made men on-chain... this may take a few seconds.","scanFail":"Scan failed: ","enterId":"Enter at least one token ID.","checkingIds":"Checking those token IDs...","noneManual":"None of those token IDs can be claimed by this wallet (not owned or already claimed).","claimSendN":"Sending claim transaction for {n} made men...","claimSend1":"Sending claim transaction for 1 made man...","claimSent":"Transaction sent: ","waiting":" — waiting for confirmation...","claimed":"Claimed! {n} GANG should now be in your wallet. Tx: ","claimFail":"Claim failed: ","selA":"Selected: ","selPalN":" men = ","selPal1":" man = ","selC":" GANG — fee: ","selD":" BNB","connectFail2":"Connect failed: ","connected2":"Connected. Scan your made men or enter token IDs.","marketFeeNote":"Market fee: 5% — the seller receives 95% of the sale price. Fees go to the collection owner.","royaltyNote":"Royalty 5% on every sale. Escrow market — your man stays safe until he sells.","v2Note":"v1: 60 minted — pausing at v2 launch.","forgeIdsLabel":"TOKEN IDS TO FORGE","forgeIdsPh":"e.g. 12, 45, 78","forgePick":"Enter the token IDs of the men to burn — 3 Street Punks, or 2 of any higher rank. All must be the same rank.","forgeCheck":"CHECK IDS","forgeWrongTier":"Those men are not the same rank — forge needs 3 Street Punks or 2 of one higher rank.","forgeNeedMore":"Not enough men of that rank — need {n}.","forgeFeeNote":"Forge fee: {fee} $GANG","forgeApprove":"Approving $GANG spend — confirm in your wallet…","forgeNoTokens":"Enter token IDs first."},
ja:{"heroH1":"7,000人の<br>構成員。ひとつの<br><em class=\"grad\">ファミリー</em>。","palsH2":"すべてのランクに<br><em class=\"grad\">物語</em>がある。","mintH2":"最初の男は<br><em class=\"grad\">無料</em>。","mintIntro":"最初の構成員は<b style=\"color:#D4AF37\">無料</b> — すべてのウォレットが1体無料、プール上限なし。その後はバンドル：<b style=\"color:#D4AF37\">1体 0.0001 · 2体 0.00015 · 5体 0.0004 · 10体 0.0008 BNB</b>。1ウォレット最大10体。自分のウォレットからミント。","freeRule":"🎩 初回ミントは<b>無料</b> — 1ウォレットにつき最初の1体無料、プール上限なし。バンドル：<b>1 = 0.0001 BNB · 2 = 0.00015 BNB · 5 = 0.0004 BNB · 10 = 0.0008 BNB</b>。1ウォレット最大10体。","rarityH2":"6つのランク、<br><em class=\"grad\">ひとつのファミリー</em>。","marketH2":"<em class=\"grad\">構成員</em>をトレード。","marketEmpty":"🎩 <b>まだマーケットに構成員はいません</b> — 最初にミントして、最初に出品しよう。","gangH2":"男を持って、<br><em class=\"grad\">$GANG</em>をクレーム。","docsH2":"仕組みは<em class=\"grad\">こう</em>。","docsLi1":"ウォレットを接続（BNBチェーン）。<b>初回ミントは無料</b> — すべてのウォレットが1体無料、プール上限なし。","roadmapH2":"ファミリーが<em class=\"grad\">行く</em>場所。","dfoot":"7,777人の構成員<br>初回ミント無料 · BNBチェーン","title":"GANGSTER — BNBチェーンの構成員","menu":"メニュー","mintNow":"今すぐミント","mintSoon":"ミント — 近日公開","mintLoading":"ミント — 読み込み中…","mintStatusLive":"ミント状況：ライブ","mintStatusSoon":"ミント状況：近日公開","noWallet":"ブラウザウォレットが検出されませんでした。このサイトをウォレットアプリのブラウザ（MetaMask / Trust Wallet / Binance Wallet）で開いてください。","txFee":"ウォレットがこのトランザクションを準備できませんでした（ブラウザからの応答が空でした）。このサイトをウォレットアプリのブラウザ（MetaMask / Trust Wallet / Binance Wallet）で開いて、もう一度お試しください。","loadingTier":"ランクを読み込み中…","tierLoading":"ランク読み込み中…","mintedOf":"{n} / 7,777 ミント済み（{pct}%）","loadingCount":"ライブ数を読み込み中…","countError":"ライブ数を読み込めませんでした — 接続を確認して更新してください。","noContract":"ミントはまだ開始していません — v2コントラクトはまだデプロイされていません。","marketOpensLater":"オンチェーンマーケットは、マーケットプレイスコントラクトのデプロイ後に開きます。","loadingListings":"出品を読み込み中…","listingsError":"出品を読み込めませんでした — 接続を確認して更新してください。","noListings":"まだ出品された構成員はいません — 下から最初に出品しよう。","marketNotLive":"マーケットはまだライブではありません。","badTokenId":"有効なトークンIDを入力してください（1–7,777）。","badPrice":"BNBで有効な価格を入力してください（0より大きい値）。","ownerCheckFail":"トークンの所有者を確認できませんでした — もう一度お試しください。","notOwner":"そのトークンはあなたのものではありません — 所有者のみ出品できます。","approving":"NFTの移動のためマーケットコントラクトを承認中 — ウォレットで確認してください…","txSent":"トランザクション送信済み：{h} — 確認待ち…","listed":"出品完了！Tx：{h}","bought":"購入完了！Tx：{h}","cancelled":"出品をキャンセルしました — 構成員はウォレットに戻りました。Tx：{h}","priceUpdated":"価格を更新しました！Tx：{h}","listFailed":"出品に失敗しました：{m}","buyFailed":"購入に失敗しました：{m}","cancelFailed":"キャンセルに失敗しました：{m}","updateFailed":"価格の更新に失敗しました：{m}","mintFailed":"ミントに失敗しました：{m}","connectFailed":"接続に失敗しました：{m}","newPrice":"新しい価格（BNB）：","mintNotOpen":"ミントはまだ開始していません。","qtyRange":"数量は1、2、5、10のいずれかです。","mintNotYet":"ミントはまだ開始していません — また後でお越しください。","minted":"ミント完了！Tx：{h}","connected":"接続済み：{a}","connectedNote":"接続しました。初回ミントは無料 — その後はバンドル：1体 0.0001、2体 0.00015、5体 0.0004、10体 0.0008 BNB。","totalFor":"合計 {q}体：{amt} BNB","freeSuffix":" — 無料","seller":"売り手","explorer":"エクスプローラー ↗","cancel":"キャンセル","updatePrice":"価格を更新","buy":"購入","phTokenId":"トークンID","phPrice":"価格（BNB）",
"previewBar":"FORGE v2 · ミント近日公開 · v1：60ミント済み、開始時に停止","takePal":"ファミリーに入る","premiseH2":"はじまり","premise1T":"01 · ストリート","premise1D":"一人の少年がファミリーに入る。1ウォレットにつき1体無料 — プール上限なし、ゲートなし。","premise2T":"02 · 出世","premise2D":"男はランクを駆け上がる。ストリート・パンクからゴッドファーザーまで6つのランク — 合計7,777体。","premise3T":"03 · フォージ","premise3D":"ストリート・パンク3体がハスラー1体に。ラダーを登ってゴッドファーザーへ — 存在するのは39体だけ。","palsMarqueeH2":"ファミリー","forgeH2":"男を鍛えて<br><em class=\"grad\">伝説</em>に。","forgeIntro":"ストリート・パンク3体がハスラー1体に。ハスラー2体がエンフォーサー1体に — ゴッドファーザーまで登りつめよう。最初の100フォージはガスのみ、その後は1フォージにつき1,000 $GANGをバーン。","forgeLadderH":"フォージ・ラダー","forgeBurn":"最初の100フォージはガスのみ、その後は1フォージにつき1,000 $GANGをバーン。","forgeCountLabel":"これまでのフォージ数","forgeCountSoon":"フォージ数はv2デプロイ後に表示されます。","forgeNotLive":"フォージはまだ開始していません — v2コントラクトはまだデプロイされていません。","forgeBtn":"フォージ","forgeSoon":"フォージ — 近日公開","forgeFailed":"フォージに失敗しました：{m}","forged":"フォージ完了！Tx：{h}","tokenH2":"1人の男。<br><em class=\"grad\">10,000 $GANG</em>。","tokenIntro":"すべての構成員が10,000 $GANGを1回だけクレームできます。手数料は1体あたり0.0004 BNB — ファミリーへまっすぐ。","tokenCap":"上限 1億 $GANG","tokenFee":"手数料 0.0004 BNB / 体","tokenSupply":"供給 7,777体","journeyH2":"旅路","journey1T":"フェーズ01 — v1完了","journey1D":"v1で60体がミントされた。ファミリーは立つことを証明した。v2開始時にv1は停止する。","journey2T":"フェーズ02 — v2ミント","journey2D":"Forge v2のミントが開く。初回無料、その後はバンドル、1ウォレット最大10体。","journey3T":"フェーズ03 — フォージ・シーズン","journey3D":"フォージが開く。ラダーを登り、$GANGをバーンし、39体のゴッドファーザーを追いかけよう。","journey4T":"フェーズ04 — ファミリーは育つ","journey4D":"マーケット、クレーム、ファミリーは育ち続ける — 1体ずつ。","faqH2":"質問に<br><em class=\"grad\">答える</em>。","faq1Q":"初回ミントは本当に無料ですか？","faq1A":"はい。すべてのウォレットの最初の1体は無料で、プール上限はありません。その後はバンドル：1体 0.0001 BNB、2体 0.00015 BNB、5体 0.0004 BNB、10体 0.0008 BNBです。","faq2Q":"フォージの仕組みは？","faq2A":"ストリート・パンク3体でハスラー1体、ハスラー2体でエンフォーサー1体、エンフォーサー2体でボス1体、ボス2体でキングピン1体、キングピン2体でゴッドファーザー1体。最初の100フォージはガスのみ、その後は1フォージにつき1,000 $GANGをバーンします。","faq3Q":"$GANGとは？","faq3A":"$GANGはファミリーのトークンです。各構成員が10,000 $GANGを1回だけクレームでき、手数料は1体あたり0.0004 BNBです。上限は1億。","faq4Q":"v2のミントはライブですか？","faq4A":"まだです — v2コントラクトのデプロイ後、ミントが開きます。v1（60ミント済み）は開始時に停止します。","finalH2":"男が<br><em class=\"grad\">あなたを待っている</em>。","finalP":"7,777人の男。ひとつのファミリー。最初の一体は無料。","claimH2":"<em class=\"grad\">$GANG</em>をクレーム。","claimIntro":"各構成員が10,000 $GANGを1回だけクレームできます。手数料は1体あたり0.0004 BNB。ウォレットを接続して構成員をスキャン。","claimBadgeSoon":"請求 — まもなく開始","claimBadgeLive":"請求 — ライブ","claimNotLive":"請求はまだ開始していません——トークンと請求コントラクトはまだデプロイされていません。","minterSoon":"請求はまもなく開始——請求コントラクトはまだトークンに接続されていません。","scanPals":"構成員をスキャン","enterIds":"またはトークンIDを入力","claimBtn":"{n} GANGをクレーム","claimedSoFar":"これまでに請求された構成員：","balPrefix":"GANG残高：","balSuffix":" GANG","foundUnclaimedN":"未請求の構成員が{n}体見つかりました。タップで選択解除できます。","foundUnclaimed1":"未請求の構成員が1体見つかりました。タップで選択解除できます。","allClaimed":"すべての構成員がすでにGANGを請求済みです。","noPals":"このウォレットの構成員は見つかりませんでした。","scanMsg":"オンチェーンで構成員をスキャン中…数秒かかる場合があります。","scanFail":"スキャンに失敗しました：","enterId":"トークンIDを少なくとも1つ入力してください。","checkingIds":"それらのトークンIDを確認中…","noneManual":"これらのトークンIDはいずれもこのウォレットでは請求できません（未所有または請求済み）。","claimSendN":"{n}体の構成員の請求トランザクションを送信中…","claimSend1":"1体の構成員の請求トランザクションを送信中…","claimSent":"トランザクション送信：","waiting":" — 確認待ち…","claimed":"請求完了！{n} GANGがウォレットに入っているはずです。Tx：","claimFail":"請求に失敗しました：","selA":"選択：","selPalN":" 体 = ","selPal1":" 体 = ","selC":" GANG — 手数料：","selD":" BNB","connectFail2":"接続に失敗しました：","connected2":"接続しました。構成員をスキャンするか、トークンIDを入力してください。","marketFeeNote":"マーケット手数料：5% — 売り手は販売価格の95%を受け取ります。手数料はコレクションのオーナーへ。","royaltyNote":"すべての販売に5%のロイヤリティ。エスクロー型マーケット — 構成員は売れるまで安全に保管されます。","v2Note":"v1：60ミント済み — v2開始で停止。","forgeIdsLabel":"フォージするトークンID","forgeIdsPh":"例：12, 45, 78","forgePick":"バーンする構成員のトークンIDを入力 — ストリート・パンク3体、または上位ランク2体。すべて同じランクであること。","forgeCheck":"IDを確認","forgeWrongTier":"それらの構成員は同じランクではありません — フォージにはストリート・パンク3体、または上位ランク2体が必要です。","forgeNeedMore":"そのランクの構成員が足りません — {n}体必要です。","forgeFeeNote":"フォージ手数料：{fee} $GANG","forgeApprove":"$GANGの使用を承認中 — ウォレットで確認してください…","forgeNoTokens":"まずトークンIDを入力してください。"},
zh:{"heroH1":"七千个<br>帮派成员。一个<br><em class=\"grad\">家族</em>。","palsH2":"每个级别都有<br><em class=\"grad\">故事</em>。","mintH2":"你的第一个成员<br><em class=\"grad\">免费</em>。","mintIntro":"你的第一个成员<b style=\"color:#D4AF37\">免费</b> — 每个钱包可免费获得1个，无数量上限。之后打包购买：<b style=\"color:#D4AF37\">1个 0.0001 · 2个 0.00015 · 5个 0.0004 · 10个 0.0008 BNB</b>。每个钱包最多10个。从你的钱包铸造。","freeRule":"🎩 首次铸造<b>免费</b> — 每个钱包第一个免费，无数量上限。打包价：<b>1 = 0.0001 BNB · 2 = 0.00015 BNB · 5 = 0.0004 BNB · 10 = 0.0008 BNB</b>。每个钱包最多10个。","rarityH2":"六个级别，<br><em class=\"grad\">一个家族</em>。","marketH2":"交易你的<em class=\"grad\">成员</em>。","marketEmpty":"🎩 <b>市场上还没有成员</b> — 成为第一个铸造、第一个挂单的人。","gangH2":"持有成员，<br>领取<em class=\"grad\">$GANG</em>。","docsH2":"它如何<em class=\"grad\">运作</em>。","docsLi1":"连接你的钱包（BNB链）。<b>首次铸造免费</b> — 每个钱包可免费获得1个，无数量上限。","roadmapH2":"家族<em class=\"grad\">前进</em>的方向。","dfoot":"7,777名帮派成员<br>首次铸造免费 · BNB链","title":"GANGSTER — BNB链上的帮派成员","menu":"菜单","mintNow":"立即铸造","mintSoon":"铸造 — 即将开放","mintLoading":"铸造 — 加载中…","mintStatusLive":"铸造状态：已上线","mintStatusSoon":"铸造状态：即将开放","noWallet":"未检测到浏览器钱包。请在钱包应用的浏览器（MetaMask / Trust Wallet / Binance Wallet）中打开本站。","txFee":"你的钱包无法准备此交易（浏览器返回为空）。请在钱包应用的浏览器（MetaMask / Trust Wallet / Binance Wallet）中打开本站并重试。","loadingTier":"正在加载级别…","tierLoading":"级别加载中…","mintedOf":"{n} / 7,777 已铸造（{pct}%）","loadingCount":"正在加载实时数量…","countError":"无法加载实时数量 — 请检查网络并刷新。","noContract":"铸造尚未开放 — v2合约尚未部署。","marketOpensLater":"链上市场将在市场合约部署后开放。","loadingListings":"正在加载挂单…","listingsError":"无法加载挂单 — 请检查网络并刷新。","noListings":"还没有成员挂单 — 在下方第一个挂单吧。","marketNotLive":"市场尚未上线。","badTokenId":"请输入有效的代币ID（1–7,777）。","badPrice":"请输入有效的BNB价格（大于0）。","ownerCheckFail":"无法确认代币所有者 — 请重试。","notOwner":"你不拥有该代币 — 只有所有者才能挂单。","approving":"正在授权市场合约转移你的NFT — 请在钱包中确认…","txSent":"交易已发送：{h} — 等待确认…","listed":"已挂单！Tx：{h}","bought":"已购买！Tx：{h}","cancelled":"已取消挂单 — 你的成员已回到钱包。Tx：{h}","priceUpdated":"价格已更新！Tx：{h}","listFailed":"挂单失败：{m}","buyFailed":"购买失败：{m}","cancelFailed":"取消失败：{m}","updateFailed":"更新价格失败：{m}","mintFailed":"铸造失败：{m}","connectFailed":"连接失败：{m}","newPrice":"新价格（BNB）：","mintNotOpen":"铸造尚未开放。","qtyRange":"数量必须是1、2、5或10。","mintNotYet":"铸造尚未开放 — 请稍后再来。","minted":"铸造成功！Tx：{h}","connected":"已连接：{a}","connectedNote":"已连接。首次铸造免费 — 之后打包购买：1个 0.0001、2个 0.00015、5个 0.0004、10个 0.0008 BNB。","totalFor":"总计 {q} 个：{amt} BNB","freeSuffix":" — 免费","seller":"卖家","explorer":"浏览器 ↗","cancel":"取消","updatePrice":"更新价格","buy":"购买","phTokenId":"代币ID","phPrice":"价格（BNB）",
"previewBar":"FORGE v2 · 铸造即将开启 · v1：已铸造60个，上线时暂停","takePal":"加入家族","premiseH2":"缘起","premise1T":"01 · 街头","premise1D":"一个少年走进了家族。每个钱包一个免费成员 — 无数量上限，无需门槛。","premise2T":"02 · 崛起","premise2D":"你的成员一路晋升。从 Street Punk 到 Godfather，六个级别 — 共7,777个。","premise3T":"03 · 熔炉","premise3D":"3个 Street Punk 锻造成 1个 Hustler。沿着阶梯登顶 Godfather — 永远只有39个。","palsMarqueeH2":"家族","forgeH2":"把成员锻造成<br><em class=\"grad\">传奇</em>。","forgeIntro":"3个 Street Punk 锻造出 1个 Hustler，2个 Hustler 锻造出 1个 Enforcer — 一路登顶 Godfather。前100次锻造只收gas，之后每次锻造燃烧1,000 $GANG。","forgeLadderH":"熔炉阶梯","forgeBurn":"前100次锻造只收gas，之后每次锻造燃烧1,000 $GANG。","forgeCountLabel":"迄今锻造次数","forgeCountSoon":"锻造次数将在v2部署后显示。","forgeNotLive":"熔炉尚未开启 — v2合约尚未部署。","forgeBtn":"锻造","forgeSoon":"锻造 — 即将开放","forgeFailed":"锻造失败：{m}","forged":"锻造成功！Tx：{h}","tokenH2":"一个成员。<br><em class=\"grad\">10,000 $GANG</em>。","tokenIntro":"每个成员可领取10,000 $GANG，一次，永久。领取手续费每位成员0.0004 BNB — 直达家族。","tokenCap":"总量 1亿 $GANG","tokenFee":"手续费 0.0004 BNB / 个","tokenSupply":"总量 7,777名成员","journeyH2":"旅程","journey1T":"第一阶段 — v1完成","journey1D":"v1已铸造60名成员。家族证明了它屹立不倒。v2开启时v1暂停。","journey2T":"第二阶段 — v2铸造","journey2D":"Forge v2铸造开启。第一个免费，之后打包购买，每个钱包最多10个。","journey3T":"第三阶段 — 熔炉季","journey3D":"熔炉开启。登上阶梯，燃烧$GANG，追逐 39 个 Godfather。","journey4T":"第四阶段 — 家族壮大","journey4D":"市场、领取与家族持续壮大 — 一次一个成员。","faqH2":"问题，<br><em class=\"grad\">已有答案</em>。","faq1Q":"首次铸造真的免费吗？","faq1A":"是的。每个钱包的第一个成员免费，无数量上限。之后打包购买：1个 0.0001 BNB、2个 0.00015 BNB、5个 0.0004 BNB、10个 0.0008 BNB。","faq2Q":"熔炉如何运作？","faq2A":"3个 Street Punk 锻造 1个 Hustler，2个 Hustler 锻造 1个 Enforcer，2个 Enforcer 锻造 1个 Boss，2个 Boss 锻造 1个 Kingpin，2个 Kingpin 锻造 1个 Godfather。前100次锻造只收gas，之后每次燃烧1,000 $GANG。","faq3Q":"$GANG是什么？","faq3A":"$GANG是家族代币。每个成员可领取10,000 $GANG一次，手续费每位成员0.0004 BNB。总量1亿。","faq4Q":"v2铸造已上线了吗？","faq4A":"还没有 — v2合约部署后，铸造才会开启。v1（已铸造60个）将在上线时暂停。","finalH2":"有个成员<br>正在<em class=\"grad\">等你</em>。","finalP":"7,777名成员。一个家族。第一个免费。","claimH2":"领取你的<em class=\"grad\">$GANG</em>。","claimIntro":"每个成员可领取10,000 $GANG，一次。手续费每位成员0.0004 BNB。连接钱包并扫描你的成员。","claimBadgeSoon":"领取 — 即将开启","claimBadgeLive":"领取 — 已开启","claimNotLive":"领取尚未开启——代币与领取合约尚未部署。","minterSoon":"领取即将开启——领取合约尚未与代币连接。","scanPals":"扫描我的成员","enterIds":"或输入代币ID","claimBtn":"领取 {n} GANG","claimedSoFar":"迄今已领取的成员：","balPrefix":"GANG 余额：","balSuffix":" GANG","foundUnclaimedN":"找到 {n} 位未领取的成员。点按卡片可取消选择。","foundUnclaimed1":"找到 1 位未领取的成员。点按卡片可取消选择。","allClaimed":"你所有的成员都已领取过 GANG。","noPals":"未找到该钱包的成员。","scanMsg":"正在链上扫描你的成员……可能需要几秒钟。","scanFail":"扫描失败：","enterId":"请至少输入一个 Token ID。","checkingIds":"正在检查这些 Token ID……","noneManual":"这些 Token ID 均无法由该钱包领取（未拥有或已领取）。","claimSendN":"正在为 {n} 位成员发送领取交易……","claimSend1":"正在为 1 位成员发送领取交易……","claimSent":"交易已发送：","waiting":" — 等待确认…","claimed":"领取成功！{n} GANG 应已进入你的钱包。Tx：","claimFail":"领取失败：","selA":"已选：","selPalN":" 位 = ","selPal1":" 位 = ","selC":" GANG — 手续费：","selD":" BNB","connectFail2":"连接失败：","connected2":"已连接。扫描你的成员或输入 Token ID。","marketFeeNote":"市场手续费：5% — 卖家获得售价的95%。手续费归收藏品所有者。","royaltyNote":"每笔销售收取5%版税。托管市场 — 成员在售出前安全保管。","v2Note":"v1：已铸造60个 — v2上线时暂停。","forgeIdsLabel":"要锻造的代币ID","forgeIdsPh":"例如：12, 45, 78","forgePick":"输入要燃烧的成员代币ID — 3个 Street Punk，或任意高级别 2个。必须为同一级别。","forgeCheck":"检查ID","forgeWrongTier":"这些成员不是同一级别 — 锻造需要 3个 Street Punk 或同一高级别 2个。","forgeNeedMore":"该级别成员不足 — 需要 {n} 个。","forgeFeeNote":"锻造手续费：{fee} $GANG","forgeApprove":"正在授权 $GANG 支出 — 请在钱包中确认…","forgeNoTokens":"请先输入代币ID。"},
ko:{"heroH1":"7,777명의<br>조직원이자 하나의<br><em class=\"grad\">패밀리</em>。","palsH2":"모든 계급에는<br><em class=\"grad\">이야기</em>가 있다。","mintH2":"첫 번째 조직원은<br><em class=\"grad\">무료</em>。","mintIntro":"첫 번째 조직원은<b style=\"color:#D4AF37\">무료</b> — 모든 지갑이 1개 무료, 풀 상한 없음. 이후 번들 구매: <b style=\"color:#D4AF37\">1개 0.0001 · 2개 0.00015 · 5개 0.0004 · 10개 0.0008 BNB</b>。지갑당 최대 10개. 내 지갑에서 민트.","freeRule":"🎩 첫 민트는<b>무료</b> — 지갑당 첫 1개 무료, 풀 상한 없음. 번들: <b>1 = 0.0001 BNB · 2 = 0.00015 BNB · 5 = 0.0004 BNB · 10 = 0.0008 BNB</b>. 지갑당 최대 10개.","rarityH2":"여섯 계급,<br><em class=\"grad\">하나의 패밀리</em>。","marketH2":"<em class=\"grad\">조직원을</em> 거래하세요.","marketEmpty":"🎩 <b>마켓에 아직 조직원이 없습니다</b> — 가장 먼저 민트하고, 가장 먼저 매물을 등록하세요。","gangH2":"조직원을 보유하고,<br><em class=\"grad\">$GANG</em>을 클레임하세요.","docsH2":"작동 <em class=\"grad\">방식</em>。","docsLi1":"지갑을 연결하세요(BNB 체인). <b>첫 민트는 무료</b> — 모든 지갑이 1개 무료, 풀 상한 없음.","roadmapH2":"패밀리가 <em class=\"grad\">가는</em> 곳。","dfoot":"7,777명의 조직원<br>첫 민트 무료 · BNB 체인","title":"GANGSTER — BNB 체인의 조직원","menu":"메뉴","mintNow":"지금 민트","mintSoon":"민트 — 곧 오픈","mintLoading":"민트 — 로딩 중…","mintStatusLive":"민트 상태: 라이브","mintStatusSoon":"민트 상태: 곧 오픈","noWallet":"브라우저 지갑이 감지되지 않았습니다. 이 사이트를 지갑 앱 브라우저(MetaMask / Trust Wallet / Binance Wallet)에서 열어주세요.","txFee":"지갑이 이 트랜잭션을 준비할 수 없었습니다(브라우저 응답이 비어 있음). 이 사이트를 지갑 앱 브라우저(MetaMask / Trust Wallet / Binance Wallet)에서 열고 다시 시도하세요.","loadingTier":"계급 불러오는 중…","tierLoading":"계급 로딩 중…","mintedOf":"{n} / 7,777 민트됨({pct}%)","loadingCount":"실시간 개수 불러오는 중…","countError":"실시간 개수를 불러올 수 없습니다 — 연결을 확인하고 새로고침하세요.","noContract":"민트가 아직 열리지 않았습니다 — v2 컨트랙트가 아직 배포되지 않았습니다.","marketOpensLater":"온체인 마켓은 마켓플레이스 컨트랙트 배포 후 열립니다.","loadingListings":"매물 불러오는 중…","listingsError":"매물을 불러올 수 없습니다 — 연결을 확인하고 새로고침하세요.","noListings":"아직 등록된 조직원이 없습니다 — 아래에서 가장 먼저 등록하세요.","marketNotLive":"마켓이 아직 라이브가 아닙니다.","badTokenId":"유효한 토큰 ID를 입력하세요(1–7,777).","badPrice":"BNB로 유효한 가격을 입력하세요(0보다 큰 값).","ownerCheckFail":"토큰 소유자를 확인할 수 없습니다 — 다시 시도하세요.","notOwner":"해당 토큰은 당신의 것이 아닙니다 — 소유자만 매물을 등록할 수 있습니다.","approving":"NFT 이동을 위해 마켓 컨트랙트를 승인하는 중 — 지갑에서 확인하세요…","txSent":"트랜잭션 전송됨: {h} — 확인 대기 중…","listed":"등록 완료! Tx: {h}","bought":"구매 완료! Tx: {h}","cancelled":"매물이 취소되었습니다 — 조직원이 지갑으로 돌아왔습니다. Tx: {h}","priceUpdated":"가격이 업데이트되었습니다! Tx: {h}","listFailed":"등록 실패: {m}","buyFailed":"구매 실패: {m}","cancelFailed":"취소 실패: {m}","updateFailed":"가격 업데이트 실패: {m}","mintFailed":"민트 실패: {m}","connectFailed":"연결 실패: {m}","newPrice":"새 가격(BNB):","mintNotOpen":"민트가 아직 열리지 않았습니다.","qtyRange":"수량은 1, 2, 5, 10 중 하나여야 합니다.","mintNotYet":"민트가 아직 열리지 않았습니다 — 나중에 다시 확인하세요.","minted":"민트 완료! Tx: {h}","connected":"연결됨: {a}","connectedNote":"연결되었습니다. 첫 민트는 무료 — 이후 번들: 1개 0.0001, 2개 0.00015, 5개 0.0004, 10개 0.0008 BNB.","totalFor":"합계 {q}개: {amt} BNB","freeSuffix":" — 무료","seller":"판매자","explorer":"익스플로러 ↗","cancel":"취소","updatePrice":"가격 업데이트","buy":"구매","phTokenId":"토큰 ID","phPrice":"가격(BNB)",
"previewBar":"FORGE v2 · 민트 곧 오픈 · v1: 60개 민트됨, 출시 시 일시정지","takePal":"패밀리에 합류하기","premiseH2":"시작","premise1T":"01 · 거리","premise1D":"한 소년이 패밀리에 들어온다. 지갑당 첫 조직원 1개 무료 — 풀 상한 없음, 게이트 없음.","premise2T":"02 · 출세","premise2D":"조직원은 계급을 올라간다. Street Punk에서 Godfather까지 여섯 계급 — 총 7,777개.","premise3T":"03 · 대장간","premise3D":"Street Punk 3개가 Hustler 1개가 된다. 사다리를 올라 Godfather까지 — 단 39개만 존재한다.","palsMarqueeH2":"패밀리","forgeH2":"조직원을 단련해<br><em class=\"grad\">전설</em>로.","forgeIntro":"Street Punk 3개가 Hustler 1개로, Hustler 2개가 Enforcer 1개로 — Godfather까지 올라가세요. 첫 100회 대장간은 가스만, 이후 회당 1,000 $GANG 소각.","forgeLadderH":"대장간 사다리","forgeBurn":"첫 100회 대장간은 가스만, 이후 회당 1,000 $GANG 소각.","forgeCountLabel":"지금까지의 대장간 횟수","forgeCountSoon":"대장간 횟수는 v2 배포 후 표시됩니다.","forgeNotLive":"대장간이 아직 열리지 않았습니다 — v2 컨트랙트가 아직 배포되지 않았습니다.","forgeBtn":"대장간","forgeSoon":"대장간 — 곧 오픈","forgeFailed":"대장간 실패: {m}","forged":"대장간 완료! Tx: {h}","tokenH2":"조직원 하나.<br><em class=\"grad\">10,000 $GANG</em>。","tokenIntro":"모든 조직원은 10,000 $GANG를 단 한 번 클레임합니다. 수수료는 조직원당 0.0004 BNB — 패밀리로 직행.","tokenCap":"상한 1억 $GANG","tokenFee":"수수료 0.0004 BNB / 개","tokenSupply":"공급 7,777명","journeyH2":"여정","journey1T":"1단계 — v1 완료","journey1D":"v1에서 60명이 민트되었다. 패밀리는 건재함을 증명했다. v2가 열리면 v1은 멈춘다.","journey2T":"2단계 — v2 민트","journey2D":"Forge v2 민트가 열린다. 첫 민트 무료, 이후 번들, 지갑당 최대 10개.","journey3T":"3단계 — 대장간 시즌","journey3D":"대장간이 열린다. 사다리를 오르고, $GANG를 소각하고, 39개의 Godfather를 노려라.","journey4T":"4단계 — 패밀리가 자란다","journey4D":"마켓, 클레임, 패밀리는 계속 자란다 — 한 번에 조직원 하나씩.","faqH2":"질문에<br><em class=\"grad\">답하다</em>。","faq1Q":"첫 민트가 정말 무료인가요?","faq1A":"네. 모든 지갑의 첫 조직원은 무료이며 풀 상한이 없습니다. 이후 번들: 1개 0.0001 BNB, 2개 0.00015 BNB, 5개 0.0004 BNB, 10개 0.0008 BNB입니다.","faq2Q":"대장간은 어떻게 작동하나요?","faq2A":"Street Punk 3개로 Hustler 1개, Hustler 2개로 Enforcer 1개, Enforcer 2개로 Boss 1개, Boss 2개로 Kingpin 1개, Kingpin 2개로 Godfather 1개. 첫 100회는 가스만, 이후 회당 1,000 $GANG를 소각합니다.","faq3Q":"$GANG란 무엇인가요?","faq3A":"$GANG는 패밀리의 토큰입니다. 각 조직원은 10,000 $GANG를 단 한 번 클레임하며, 수수료는 조직원당 0.0004 BNB입니다. 상한 1억.","faq4Q":"v2 민트가 라이브인가요?","faq4A":"아직 아닙니다 — v2 컨트랙트 배포 후 민트가 열립니다. v1(60개 민트됨)은 출시 시 일시정지됩니다.","finalH2":"조직원 하나가<br><em class=\"grad\">당신을 기다립니다</em>。","finalP":"7,777명의 조직원. 하나의 패밀리. 첫 조직원은 무료.","claimH2":"<em class=\"grad\">$GANG</em>을 클레임하세요.","claimIntro":"각 조직원은 10,000 $GANG를 단 한 번 클레임합니다. 수수료는 조직원당 0.0004 BNB. 지갑을 연결하고 조직원을 스캔하세요.","claimBadgeSoon":"청구 — 곧 오픈","claimBadgeLive":"청구 — 라이브","claimNotLive":"청구가 아직 시작되지 않았습니다 — 토큰과 청구 컨트랙트가 아직 배포되지 않았습니다.","minterSoon":"청구가 곧 오픈합니다 — 청구 컨트랙트가 아직 토큰에 연결되지 않았습니다.","scanPals":"내 조직원 스캔","enterIds":"또는 토큰 ID 입력","claimBtn":"{n} GANG 클레임","claimedSoFar":"지금까지 청구된 조직원:","balPrefix":"GANG 잔액: ","balSuffix":" GANG","foundUnclaimedN":"미청구 조직원 {n}명을 찾았습니다. 카드를 눌러 선택을 해제하세요.","foundUnclaimed1":"미청구 조직원 1명을 찾았습니다. 카드를 눌러 선택을 해제하세요.","allClaimed":"모든 조직원이 이미 GANG를 청구했습니다.","noPals":"이 지갑의 조직원을 찾을 수 없습니다.","scanMsg":"온체인에서 조직원을 스캔하는 중… 몇 초 걸릴 수 있습니다.","scanFail":"스캔 실패: ","enterId":"토큰 ID를 최소 하나 입력하세요.","checkingIds":"해당 토큰 ID를 확인하는 중…","noneManual":"이 토큰 ID들은 이 지갑으로 청구할 수 없습니다(미소유 또는 이미 청구됨).","claimSendN":"{n}명 조직원의 청구 트랜잭션을 보내는 중…","claimSend1":"1명 조직원의 청구 트랜잭션을 보내는 중…","claimSent":"트랜잭션 전송됨: ","waiting":" — 확인 대기 중…","claimed":"청구 완료! {n} GANG가 지갑에 들어왔을 것입니다. Tx: ","claimFail":"청구 실패: ","selA":"선택:","selPalN":"명 = ","selPal1":"명 = ","selC":" GANG — 수수료: ","selD":" BNB","connectFail2":"연결 실패: ","connected2":"연결됨. 조직원을 스캔하거나 토큰 ID를 입력하세요.","marketFeeNote":"마켓 수수료: 5% — 판매자는 판매가의 95%를 받습니다. 수수료는 컬렉션 소유자에게 갑니다.","royaltyNote":"모든 판매에 5% 로열티. 에스크로 마켓 — 조직원은 팔릴 때까지 안전하게 보관됩니다.","v2Note":"v1: 60개 민트됨 — v2 출시 시 일시정지됨.","forgeIdsLabel":"단련할 토큰 ID","forgeIdsPh":"예: 12, 45, 78","forgePick":"소각할 조직원의 토큰 ID를 입력하세요 — Street Punk 3개, 또는 상위 계급 2개. 모두 같은 계급이어야 합니다.","forgeCheck":"ID 확인","forgeWrongTier":"그 조직원들은 같은 계급이 아닙니다 — 단련에는 Street Punk 3개 또는 상위 계급 2개가 필요합니다.","forgeNeedMore":"해당 계급의 조직원이 부족합니다 — {n}개가 필요합니다.","forgeFeeNote":"단련 수수료: {fee} $GANG","forgeApprove":"$GANG 사용을 승인하는 중 — 지갑에서 확인하세요…","forgeNoTokens":"먼저 토큰 ID를 입력하세요."}
};
let LANG="en";
try{ LANG=localStorage.getItem("gangster-v2-lang")||(function(){var b=(navigator.language||"en").slice(0,2).toLowerCase();return ["en","ja","zh","ko"].indexOf(b)>=0?b:"en";})(); }catch(e){ LANG="en"; }
let lastPaused=null, barState="loading", displayedMinted=0, lastMarketN=-1;
function T(k,v){var s=(STR[LANG]&&STR[LANG][k])||STR.en[k]||k;if(v){for(var x in v){s=s.split("{"+x+"}").join(String(v[x]));}}return s;}
function setLang(l){
  LANG=["en","ja","zh","ko"].indexOf(l)>=0?l:"en";
  try{localStorage.setItem("gangster-v2-lang",LANG);}catch(e){}
  document.documentElement.lang=LANG;
  document.querySelectorAll("[data-en]").forEach(function(el){var v=el.dataset[LANG]||el.dataset.en;if(v!==undefined){if(el.children.length)el.innerHTML=v;else el.textContent=v;}});
  document.querySelectorAll("[data-i18n]").forEach(function(el){var k=el.dataset.i18n;var v=(STR[LANG]&&STR[LANG][k])||STR.en[k];if(v!==undefined)el.innerHTML=v;});
  document.querySelectorAll("[data-lang]").forEach(function(b){b.classList.toggle("on",b.dataset.lang===LANG);});
  document.title=T("title");
  var bb=document.getElementById("burgerBtn");if(bb)bb.setAttribute("aria-label",T("menu"));
  var ti=document.getElementById("listTokenId");if(ti)ti.placeholder=T("phTokenId");
  var lp=document.getElementById("listPrice");if(lp)lp.placeholder=T("phPrice");
  if(lastPaused!==null)setPausedUI(lastPaused);
  var lbl=document.getElementById("barLabel");
  if(lbl){ if(barState==="loading")lbl.textContent=T("loadingCount"); else if(barState==="error")lbl.textContent=T("countError"); else if(barState==="nocontract")lbl.textContent=T("noContract"); else if(barState==="count")setMinted(displayedMinted); }
  var fb=document.getElementById("forgeBadge"); if(fb) fb.textContent=T("forgeSoon");
  var cb=document.getElementById("claimBadge"); if(cb) cb.textContent=T("claimBadgeSoon");
  updateSelLine();
}
function toggleMenu(){var d=document.getElementById("drawer");if(!d)return;d.classList.toggle("open");document.getElementById("scrim").classList.toggle("on");document.getElementById("burgerBtn").classList.toggle("open");document.body.style.overflow=d.classList.contains("open")?"hidden":"";}
async function rpcCall(to,data){
  for(const url of RPCS){
    try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to,data},"latest"]})});const j=await r.json();if(j.result)return j.result;}catch(e){}
  } return null;
}
async function rpcGasPrice(){
  for(const url of RPCS){
    try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_gasPrice",params:[]})});const j=await r.json();if(j.result)return BigInt(j.result);}catch(e){}
  } return 1000000000n;
}
function txErrMsg(e){
  const m=(e&&e.message)||String(e||"");
  if(m.indexOf("invalid BigNumberish")>=0||m.indexOf("value=null")>=0){return T("txFee");}
  return (e&&e.reason)||m;
}
async function sendTx(tx,gasLimit){
  const gp=await rpcGasPrice();
  return signer.sendTransaction({...tx,gasPrice:gp,gasLimit:BigInt(gasLimit)});
}
function updateNoWallet(){
  const show=!window.ethereum;
  document.querySelectorAll(".nowallet").forEach(function(w){w.textContent=show?T("noWallet"):"";w.classList.toggle("show",show);});
}
function setMinted(n){
  const start=displayedMinted,t0=performance.now(),dur=700;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(v){return Math.round(v).toLocaleString();}
  function apply(v){
    ["mintedHero","mintedStat"].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=fmt(v);});
    var bar=document.getElementById("barFill");if(bar)bar.style.width=(v/7777*100)+"%";
    var barH=document.getElementById("barFillHero");if(barH)barH.style.width=(v/7777*100)+"%";
    var lbl=document.getElementById("barLabel");if(lbl)lbl.textContent=T("mintedOf",{n:fmt(v),pct:(v/7777*100).toFixed(2)});
    var cc=document.getElementById("ctaCount");if(cc)cc.textContent=fmt(v);
  }
  if(reduced||start===n){displayedMinted=n;apply(n);return;}
  function step(t){var p=Math.min(1,(t-t0)/dur);var e=1-Math.pow(1-p,3);var v=start+(n-start)*e;apply(v);if(p<1)requestAnimationFrame(step);else displayedMinted=n;}
  requestAnimationFrame(step);
}
function setPausedUI(paused){
  lastPaused=paused;
  ["mintBtn","mintBtnHero"].forEach(function(id){var b=document.getElementById(id);if(b){b.disabled=paused;b.textContent=paused?T("mintSoon"):T("mintNow");}});
  var ms=document.getElementById("mintStatus");if(ms)ms.textContent=paused?T("mintStatusSoon"):T("mintStatusLive");
  var mb=document.getElementById("mintBadge");if(mb)mb.textContent=paused?"SOON":"LIVE";
  var hb=document.getElementById("heroBadge");if(hb)hb.textContent=paused?T("mintSoon"):"MINT — LIVE";
}
function setLoadingUI(){
  ["mintBtn","mintBtnHero"].forEach(function(id){var b=document.getElementById(id);if(b){b.disabled=true;b.textContent=T("mintLoading");}});
}
async function refresh(){
  if(IS_PLACEHOLDER){
    barState="nocontract";
    ["mintedHero","mintedStat"].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent="—";});
    var cc=document.getElementById("ctaCount");if(cc)cc.textContent="—";
    var lbl=document.getElementById("barLabel");if(lbl)lbl.textContent=T("noContract");
    setPausedUI(true);
    var fc=document.getElementById("forgeCount");if(fc)fc.textContent="—";
    var fl=document.getElementById("forgeCountNote");if(fl)fl.textContent=T("forgeCountSoon");
    loadListings(); return;
  }
  const res=await rpcCall(NFT,SEL_TOTAL);
  if(!res){barState="error";var l2=document.getElementById("barLabel");if(l2)l2.textContent=T("countError");setPausedUI(true);return;}
  setMinted(parseInt(res,16));barState="count";
  const pres=await rpcCall(NFT,SEL_PAUSED);
  setPausedUI(!pres||BigInt(pres)===1n);
  const fcres=await rpcCall(NFT,SEL_FORGECOUNT);
  var fc=document.getElementById("forgeCount");if(fc)fc.textContent=fcres?String(parseInt(fcres,16)):"—";
  var fl=document.getElementById("forgeCountNote");if(fl)fl.textContent=T("forgeCountLabel");
  loadMarket();loadListings();
}
function priceForQty(q,freeClaimed){
  // Local bundle pricing (same bundles as contract): 1=0.0001, 2=0.00015, 5=0.0004, 10=0.0008 BNB.
  // A wallet that has not claimed its free mint pays 0 for qty 1.
  if(q===1&&!freeClaimed)return 0;
  var b=BUNDLES.find(function(x){return x[0]===q;});
  return b?parseFloat(b[1]):0;
}
function setQty(v){var q=document.getElementById("qty");if(q){q.value=v;}updateCost();}
async function updateCost(){
  var qEl=document.getElementById("qty");if(!qEl)return;
  var q=parseInt(qEl.value)||1;
  var tc=document.getElementById("totalCost");if(!tc)return;
  if(IS_PLACEHOLDER){tc.textContent="";return;}
  if(!userAddr)return;
  const data=SEL_PRICEFOR+userAddr.slice(2).padStart(64,"0")+q.toString(16).padStart(64,"0");
  const res=await rpcCall(NFT,data);
  if(!res)return;
  const wei=BigInt(res);
  tc.textContent=T("totalFor",{q:q,amt:(Number(wei)/1e18).toFixed(5)})+(wei===0n?T("freeSuffix"):"");
}
async function connectWallet(){
  var msgEl=document.getElementById("mintMsg")||document.getElementById("marketMsg")||document.getElementById("claimMsg");
  if(!window.ethereum){if(msgEl)msgEl.textContent=T("noWallet");updateNoWallet();return;}
  try{
    provider=new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts",[]);
    const net=await provider.getNetwork();
    if(net.chainId!==56n){try{await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0x38"}]});}catch(e){if(e&&e.code===4902){await window.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:"0x38",chainName:"BNB Smart Chain",nativeCurrency:{name:"BNB",symbol:"BNB",decimals:18},rpcUrls:["https://bsc-dataseed.bnbchain.org"],blockExplorerUrls:["https://bscscan.com"]}]});}else{throw e;}}}
    signer=await provider.getSigner();userAddr=await signer.getAddress();
    var cb=document.getElementById("connectBtn");if(cb)cb.textContent=T("connected",{a:userAddr.slice(0,6)+"…"+userAddr.slice(-4)});
    if(msgEl)msgEl.textContent=T("connectedNote");
    updateCost();
  }catch(e){if(msgEl)msgEl.textContent=T("connectFailed",{m:(e.message||e)});}
}
async function mintNow(){
  var msgEl=document.getElementById("mintMsg");if(!msgEl)return;
  if(IS_PLACEHOLDER){msgEl.textContent=T("mintNotOpen");return;}
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  var q=parseInt(document.getElementById("qty").value)||1;
  if([1,2,5,10].indexOf(q)<0){msgEl.textContent=T("qtyRange");return;}
  const pres=await rpcCall(NFT,SEL_PAUSED);
  if(!pres||BigInt(pres)===1n){msgEl.textContent=T("mintNotYet");return;}
  try{
    const data=SEL_PRICEFOR+userAddr.slice(2).padStart(64,"0")+q.toString(16).padStart(64,"0");
    const res=await rpcCall(NFT,data);
    const value=res?BigInt(res):0n;
    const iface=new ethers.Interface(["function mint(uint256 quantity)"]);
    const tx=await sendTx({to:NFT,data:iface.encodeFunctionData("mint",[q]),value},300000);
    msgEl.textContent="Transaction sent: "+tx.hash+" — waiting for confirmation…";
    await tx.wait();
    msgEl.textContent=T("minted",{h:tx.hash});
    refresh();
  }catch(e){msgEl.textContent=T("mintFailed",{m:txErrMsg(e)});}
}
function abiDecodeString(hex){
  hex=hex.startsWith("0x")?hex.slice(2):hex;
  if(hex.length<128)return "";
  const len=parseInt(hex.slice(64,128),16);
  const bytes=hex.slice(128,128+len*2);
  const arr=new Uint8Array((bytes.match(/../g)||[]).map(function(h){return parseInt(h,16);}));
  return new TextDecoder().decode(arr);
}
function tierImgFor(charName){
  var t=TIERS.find(function(x){return x.name===charName;});
  return t?t.img:(TIERS[0].img);
}
function shortAddr(a){return a.slice(0,6)+"…"+a.slice(-4);}
async function loadMarket(){
  var board=document.getElementById("marketBoard");
  var empty=document.getElementById("marketEmpty");
  if(!board||!empty)return;
  if(IS_PLACEHOLDER){board.style.display="none";empty.style.display="block";return;}
  const res=await rpcCall(NFT,SEL_TOTAL);
  const n=res?parseInt(res,16):0;
  if(!n){board.style.display="none";empty.style.display="block";lastMarketN=0;return;}
  if(n===lastMarketN)return;
  lastMarketN=n;
  empty.style.display="none";board.style.display="grid";
  board.innerHTML="";
  var ids=[];for(var id=n;id>=Math.max(1,n-7);id--)ids.push(id);
  for(const id of ids){
    var card=document.createElement("div");card.className="mkt-card";
    card.innerHTML='<img src="'+TIERS[0].img+'" alt="GANGSTER #'+id+'"><div class="mkt-body"><b>GANGSTER #'+id+'</b><span>'+T("loadingTier")+'</span><div class="mkt-links"><a href="https://bscscan.com/address/'+NFT+'" target="_blank" rel="noopener">'+T("explorer")+'</a></div></div>';
    board.appendChild(card);
    var imgEl=card.querySelector("img");var spanEl=card.querySelector(".mkt-body span");
    try{
      const uriRes=await rpcCall(NFT,SEL_TOKENURI+id.toString(16).padStart(64,"0"));
      const uri=abiDecodeString(uriRes||"");
      const meta=await (await fetch(uri)).json();
      const attrs={};(meta.attributes||[]).forEach(function(a){attrs[a.trait_type]=a.value;});
      const charName=attrs["Rank"]||attrs["Character"]||"";const rarity=attrs["Rarity"]||"";
      imgEl.src=tierImgFor(charName);
      spanEl.textContent=(rarity?rarity+" · ":"")+charName;
    }catch(e){spanEl.textContent=T("loadingTier");}
  }
}
async function loadListings(){
  var grid=document.getElementById("marketGrid");
  if(!grid)return;
  if(IS_PLACEHOLDER){grid.innerHTML="<div class='mkt-note'>"+T("marketOpensLater")+"</div>";return;}
  grid.innerHTML="<div class='mkt-note'>"+T("loadingListings")+"</div>";
  const res=await rpcCall(MARKET,SEL_LISTED);
  if(!res){grid.innerHTML="<div class='mkt-note'>"+T("listingsError")+"</div>";return;}
  var ids=[];
  try{ids=ethers.AbiCoder.defaultAbiCoder().decode(["uint256[]"],res)[0].map(function(x){return Number(x);});}catch(e){grid.innerHTML="<div class='mkt-note'>"+T("listingsError")+"</div>";return;}
  if(!ids.length){grid.innerHTML="<div class='mkt-note'>"+T("noListings")+"</div>";return;}
  grid.innerHTML="";
  for(const id of ids){
    const lres=await rpcCall(MARKET,SEL_LISTING+id.toString(16).padStart(64,"0"));
    if(!lres)continue;
    var seller,price,active;
    try{var d=ethers.AbiCoder.defaultAbiCoder().decode(["address","uint256","bool"],lres);seller=d[0];price=d[1];active=d[2];}catch(e){continue;}
    if(!active)continue;
    var img=TIERS[0].img,rarity="",charName="";
    try{
      const uriRes=await rpcCall(NFT,SEL_TOKENURI+id.toString(16).padStart(64,"0"));
      const uri=abiDecodeString(uriRes||"");
      const meta=await (await fetch(uri)).json();
      const attrs={};(meta.attributes||[]).forEach(function(a){attrs[a.trait_type]=a.value;});
      charName=attrs["Rank"]||attrs["Character"]||"";rarity=attrs["Rarity"]||"";
      img=tierImgFor(charName);
    }catch(e){}
    var priceBnb=(Number(price)/1e18).toFixed(5);
    var mine=userAddr&&seller.toLowerCase()===userAddr.toLowerCase();
    var card=document.createElement("div");card.className="mkt-card";
    card.innerHTML='<img src="'+img+'" alt="GANGSTER #'+id+'"><div class="mkt-body"><b>GANGSTER #'+id+'</b><span>'+(rarity?rarity+" · ":"")+charName+'</span><div class="mkt-price">'+priceBnb+' BNB</div><div class="mkt-seller">'+T("seller")+': '+shortAddr(seller)+'</div><div class="mkt-row">'+(mine?'<button class="btn-ghost" onclick="cancelNow('+id+')">'+T("cancel")+'</button><button class="btn-ghost" onclick="updatePriceNow('+id+')">'+T("updatePrice")+'</button>':'<button class="btn-gold" onclick="buyNow('+id+',&quot;'+price.toString()+'&quot;)">'+T("buy")+'</button>')+'</div></div>';
    grid.appendChild(card);
  }
  if(!grid.children.length){grid.innerHTML="<div class='mkt-note'>"+T("noListings")+"</div>";}
}
async function listNow(){
  var msg=document.getElementById("marketMsg");if(!msg)return;
  if(IS_PLACEHOLDER){msg.textContent=T("marketNotLive");return;}
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  var id=parseInt(document.getElementById("listTokenId").value);
  var priceStr=document.getElementById("listPrice").value;
  if(!id||id<1||id>7777){msg.textContent=T("badTokenId");return;}
  var priceWei;
  try{priceWei=ethers.parseEther(priceStr);}catch(e){priceWei=0n;}
  if(priceWei<=0n){msg.textContent=T("badPrice");return;}
  try{
    const ores=await rpcCall(NFT,SEL_OWNEROF+id.toString(16).padStart(64,"0"));
    if(!ores){msg.textContent=T("ownerCheckFail");return;}
    const tokenOwner=ethers.AbiCoder.defaultAbiCoder().decode(["address"],ores)[0];
    if(tokenOwner.toLowerCase()!==userAddr.toLowerCase()){msg.textContent=T("notOwner");return;}
    const ares=await rpcCall(NFT,SEL_ISAPPROVED+userAddr.slice(2).padStart(64,"0")+MARKET.slice(2).padStart(64,"0"));
    const approved=ares?ethers.AbiCoder.defaultAbiCoder().decode(["bool"],ares)[0]:false;
    if(!approved){
      msg.textContent=T("approving");
      const ifaceA=new ethers.Interface(["function setApprovalForAll(address operator, bool approved)"]);
      const txA=await sendTx({to:NFT,data:ifaceA.encodeFunctionData("setApprovalForAll",[MARKET,true])},100000);
      await txA.wait();
    }
    const iface=new ethers.Interface(["function list(uint256 tokenId, uint256 price)"]);
    const tx=await sendTx({to:MARKET,data:iface.encodeFunctionData("list",[id,priceWei])},300000);
    msg.textContent=T("txSent",{h:tx.hash});
    await tx.wait();
    msg.textContent=T("listed",{h:tx.hash});
    loadListings();
  }catch(e){msg.textContent=T("listFailed",{m:txErrMsg(e)});}
}
async function buyNow(id,priceWei){
  var msg=document.getElementById("marketMsg");if(!msg)return;
  if(IS_PLACEHOLDER)return;
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  try{
    const iface=new ethers.Interface(["function buy(uint256 tokenId)"]);
    const tx=await sendTx({to:MARKET,data:iface.encodeFunctionData("buy",[id]),value:BigInt(priceWei)},300000);
    msg.textContent=T("txSent",{h:tx.hash});
    await tx.wait();
    msg.textContent=T("bought",{h:tx.hash});
    loadListings();refresh();
  }catch(e){msg.textContent=T("buyFailed",{m:txErrMsg(e)});}
}
async function cancelNow(id){
  var msg=document.getElementById("marketMsg");if(!msg)return;
  if(IS_PLACEHOLDER)return;
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  try{
    const iface=new ethers.Interface(["function cancel(uint256 tokenId)"]);
    const tx=await sendTx({to:MARKET,data:iface.encodeFunctionData("cancel",[id])},200000);
    msg.textContent=T("txSent",{h:tx.hash});
    await tx.wait();
    msg.textContent=T("cancelled",{h:tx.hash});
    loadListings();
  }catch(e){msg.textContent=T("cancelFailed",{m:txErrMsg(e)});}
}
async function updatePriceNow(id){
  var msg=document.getElementById("marketMsg");if(!msg)return;
  if(IS_PLACEHOLDER)return;
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  var v=window.prompt(T("newPrice"));
  if(v===null)return;
  var priceWei;
  try{priceWei=ethers.parseEther(v);}catch(e){priceWei=0n;}
  if(priceWei<=0n){msg.textContent=T("badPrice");return;}
  try{
    const iface=new ethers.Interface(["function updatePrice(uint256 tokenId, uint256 newPrice)"]);
    const tx=await sendTx({to:MARKET,data:iface.encodeFunctionData("updatePrice",[id,priceWei])},200000);
    msg.textContent=T("txSent",{h:tx.hash});
    await tx.wait();
    msg.textContent=T("priceUpdated",{h:tx.hash});
    loadListings();
  }catch(e){msg.textContent=T("updateFailed",{m:txErrMsg(e)});}
}
/* ---- Forge (v2) — token-ID based. The v3 template encoded
   forge(uint256,uint256), which does not exist on the contract;
   the real signature is forge(uint256[] tokenIds). The UI takes the
   token IDs to burn, checks their on-chain tiers, then forges.
   After the first 100 forges the $GANG fee is taken via transferFrom,
   so the user must approve this contract to spend $GANG first. ---- */
var forgeChecked=null; // {tier, ids}
function forgeStep(i){
  document.querySelectorAll(".ladder-row").forEach(function(r,j){r.style.borderColor=(j===i)?"rgba(212,175,55,.7)":"";});
  var hint=document.getElementById("forgeHint");
  var need=i===0?3:2;
  if(hint)hint.textContent=need+" \u00d7 "+TIERS[i].name+" \u2192 1 \u00d7 "+TIERS[i+1].name;
  var fb=document.getElementById("forgeBtn");
  if(fb){fb.disabled=IS_PLACEHOLDER;fb.textContent=T("forgeBtn");}
  forgeChecked=null;
  var fm=document.getElementById("forgeMsg");if(fm)fm.textContent="";
}
async function forgeFeeNow(){
  if(IS_PLACEHOLDER) return 0n;
  const res=await rpcCall(NFT,SEL_FORGEFEE);
  return res?BigInt(res):0n;
}
async function checkForgeIds(){
  var msg=document.getElementById("forgeMsg");if(!msg)return;
  var raw=(document.getElementById("forgeIds")||{}).value||"";
  var ids=raw.split(/[^0-9]+/).filter(Boolean).map(Number).filter(function(n){return n>=1&&n<=7777;});
  if(!ids.length){msg.textContent=T("forgeNoTokens");forgeChecked=null;return;}
  if(IS_PLACEHOLDER){msg.textContent=T("forgeNotLive");return;}
  try{
    var tiers=[];
    for(const id of ids){
      const res=await rpcCall(NFT,SEL_TIEROF+id.toString(16).padStart(64,"0"));
      if(!res)throw new Error("tierOf failed");
      tiers.push(Number(BigInt(res)));
    }
    var t0=tiers[0];
    if(!tiers.every(function(t){return t===t0;})||t0>=5){msg.textContent=T("forgeWrongTier");forgeChecked=null;return;}
    var need=t0===0?3:2;
    if(ids.length!==need){msg.textContent=T("forgeNeedMore",{n:need});forgeChecked=null;return;}
    var fee=await forgeFeeNow();
    forgeChecked={tier:t0,ids:ids};
    msg.textContent=TIERS[t0].name+" \u00d7 "+need+" \u2192 "+TIERS[t0+1].name+" \u00b7 "+T("forgeFeeNote",{fee:ethers.formatEther(fee)});
    var fb=document.getElementById("forgeBtn");if(fb){fb.disabled=false;fb.textContent=T("forgeBtn")+" — "+TIERS[t0].name+" \u2192 "+TIERS[t0+1].name;}
  }catch(e){msg.textContent=T("forgeFailed",{m:txErrMsg(e)});forgeChecked=null;}
}
async function forgeNow(){
  var msg=document.getElementById("forgeMsg");if(!msg)return;
  if(IS_PLACEHOLDER){msg.textContent=T("forgeNotLive");return;}
  if(!forgeChecked){await checkForgeIds();if(!forgeChecked)return;}
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  try{
    var fee=await forgeFeeNow();
    if(fee>0n){
      const al=await rpcCall(TOKEN,SEL_ALLOWANCE+userAddr.slice(2).padStart(64,"0")+NFT.slice(2).padStart(64,"0"));
      const allowed=al?BigInt(al):0n;
      if(allowed<fee){
        msg.textContent=T("forgeApprove");
        const ifaceA=new ethers.Interface(["function approve(address spender, uint256 amount)"]);
        const txA=await sendTx({to:TOKEN,data:ifaceA.encodeFunctionData("approve",[NFT,fee])},100000);
        await txA.wait();
      }
    }
    const iface=new ethers.Interface(["function forge(uint256[] tokenIds)"]);
    const tx=await sendTx({to:NFT,data:iface.encodeFunctionData("forge",[forgeChecked.ids])},300000);
    msg.textContent=T("txSent",{h:tx.hash});
    await tx.wait();
    msg.textContent=T("forged",{h:tx.hash});
    forgeChecked=null;
    refresh();
  }catch(e){msg.textContent=T("forgeFailed",{m:txErrMsg(e)});}
}
/* ---- Claim (v2) ---- */
var claimSelected=new Set(), claimUnclaimed=[], claimMinterOk=false, claimLastBal=null, claimLastClaimed=null, claimFeePerNft=null;
var CLAIM_ABI=["function claim(uint256[]) payable","function claimed(uint256) view returns (bool)","function feePerNft() view returns (uint256)","function ALLOCATION() view returns (uint256)"];
var TOKEN_ABI=["function balanceOf(address) view returns (uint256)","function totalSupply() view returns (uint256)","function minter() view returns (address)"];
var NFT_ABI=["function ownerOf(uint256) view returns (address)"];
function claimMsg(t){var el=document.getElementById("claimMsg");if(el)el.textContent=t;}
function updateSelLine(){
  var el=document.getElementById("selLine");if(!el)return;
  if(!claimSelected.size){el.textContent="";var cb=document.getElementById("claimBtn");if(cb)cb.disabled=true;return;}
  var n=claimSelected.size;
  var fee=claimFeePerNft!==null?(Number(claimFeePerNft)*n/1e18):0.0004*n;
  el.textContent=T("selA")+n+(n===1?T("selPal1"):T("selPalN"))+(n*10000).toLocaleString()+T("selC")+fee.toFixed(5)+T("selD");
  var cb2=document.getElementById("claimBtn");if(cb2){cb2.disabled=IS_PLACEHOLDER||!claimMinterOk;cb2.textContent=T("claimBtn",{n:(n*10000).toLocaleString()});}
}
function renderClaimCards(){
  var grid=document.getElementById("claimGrid");if(!grid)return;
  grid.innerHTML="";
  claimUnclaimed.forEach(function(id){
    var card=document.createElement("div");card.className="claim-card"+(claimSelected.has(id)?" sel":"");
    card.innerHTML='<img src="'+TIERS[0].img+'" alt="GANGSTER #'+id+'"><div class="mkt-body"><b>GANGSTER #'+id+'</b><span>10,000 $GANG</span></div>';
    card.onclick=function(){if(claimSelected.has(id))claimSelected.delete(id);else claimSelected.add(id);renderClaimCards();updateSelLine();};
    grid.appendChild(card);
  });
}
async function scanPals(){
  if(IS_PLACEHOLDER){claimMsg(T("claimNotLive"));return;}
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  claimMsg(T("scanMsg"));
  try{
    var rp=new ethers.JsonRpcProvider(RPCS[0]);
    var nft=new ethers.Contract(NFT,NFT_ABI,rp);
    var cl=new ethers.Contract(CLAIM,CLAIM_ABI,rp);
    claimUnclaimed=[];claimSelected=new Set();
    // Scan via Transfer events from DEPLOY_BLOCK, chunked in 4000-block windows
    // (public RPCs cap eth_getLogs ranges).
    var latest=await rp.getBlockNumber();
    var owned=new Set();
    for(var from=DEPLOY_BLOCK;from<=latest;from+=4000){
      var to=Math.min(from+3999,latest);
      var logs=await rp.getLogs({address:NFT,fromBlock:from,toBlock:to,topics:["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",null,ethers.zeroPadValue(userAddr,32)]});
      logs.forEach(function(l){try{var id=Number(ethers.AbiCoder.defaultAbiCoder().decode(["uint256"],l.topics[3])[0]);owned.add(id);}catch(e){}});
    }
    for(const id of owned){
      try{var o=await nft.ownerOf(id);if(o.toLowerCase()!==userAddr.toLowerCase())continue;var c=await cl.claimed(id);if(!c)claimUnclaimed.push(id);}catch(e){}
    }
    claimUnclaimed.sort(function(a,b){return a-b;});
    if(!claimUnclaimed.length){claimMsg(owned.size?T("allClaimed"):T("noPals"));}
    else{claimMsg(claimUnclaimed.length===1?T("foundUnclaimed1"):T("foundUnclaimedN",{n:claimUnclaimed.length}));claimUnclaimed.forEach(function(id){claimSelected.add(id);});}
    renderClaimCards();updateSelLine();
  }catch(e){claimMsg(T("scanFail")+(e.message||e));}
}
async function checkIds(){
  if(IS_PLACEHOLDER){claimMsg(T("claimNotLive"));return;}
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  var raw=(document.getElementById("manualIds")||{}).value||"";
  var ids=raw.split(/[^0-9]+/).filter(Boolean).map(Number).filter(function(n){return n>=1&&n<=7777;});
  if(!ids.length){claimMsg(T("enterId"));return;}
  claimMsg(T("checkingIds"));
  try{
    var rp=new ethers.JsonRpcProvider(RPCS[0]);
    var nft=new ethers.Contract(NFT,NFT_ABI,rp);
    var cl=new ethers.Contract(CLAIM,CLAIM_ABI,rp);
    claimUnclaimed=[];claimSelected=new Set();
    for(const id of ids){
      try{var o=await nft.ownerOf(id);if(o.toLowerCase()!==userAddr.toLowerCase())continue;var c=await cl.claimed(id);if(!c)claimUnclaimed.push(id);}catch(e){}
    }
    if(!claimUnclaimed.length){claimMsg(T("noneManual"));}
    else{claimMsg(claimUnclaimed.length===1?T("foundUnclaimed1"):T("foundUnclaimedN",{n:claimUnclaimed.length}));claimUnclaimed.forEach(function(id){claimSelected.add(id);});}
    renderClaimCards();updateSelLine();
  }catch(e){claimMsg(T("scanFail")+(e.message||e));}
}
async function claimNow(){
  if(IS_PLACEHOLDER){claimMsg(T("claimNotLive"));return;}
  if(!claimSelected.size){claimMsg(T("enterId"));return;}
  if(!signer){updateNoWallet();await connectWallet();if(!signer)return;}
  var ids=Array.from(claimSelected);
  try{
    claimMsg(ids.length===1?T("claimSend1"):T("claimSendN",{n:ids.length}));
    var fee=claimFeePerNft!==null?claimFeePerNft*BigInt(ids.length):ethers.parseEther("0.0004")*BigInt(ids.length);
    const iface=new ethers.Interface(CLAIM_ABI);
    const tx=await sendTx({to:CLAIM,data:iface.encodeFunctionData("claim",[ids]),value:fee},300000);
    claimMsg(T("claimSent")+tx.hash+T("waiting"));
    await tx.wait();
    claimMsg(T("claimed",{n:(ids.length*10000).toLocaleString()})+tx.hash);
    claimSelected=new Set();renderClaimCards();updateSelLine();loadClaimStats();
  }catch(e){claimMsg(T("claimFail")+txErrMsg(e));}
}
async function loadClaimStats(){
  var mc=document.getElementById("gangClaimedLine");
  if(IS_PLACEHOLDER){if(mc)mc.textContent=T("claimedSoFar")+"—";return;}
  try{
    var rp=new ethers.JsonRpcProvider(RPCS[0]);
    var cl=new ethers.Contract(CLAIM,CLAIM_ABI,rp);
    claimFeePerNft=await cl.feePerNft();
    var tok=new ethers.Contract(TOKEN,TOKEN_ABI,rp);
    var m=await tok.minter();
    claimMinterOk=m.toLowerCase()===CLAIM.toLowerCase();
    var cb=document.getElementById("claimBadge");if(cb)cb.textContent=claimMinterOk?T("claimBadgeLive"):T("claimBadgeSoon");
    if(!claimMinterOk)claimMsg(T("minterSoon"));
    if(mc){
      var supply=await tok.totalSupply();
      var claimed=Number((supply-22230000n*10n**18n)/(10000n*10n**18n));
      claimLastClaimed=claimed;
      mc.textContent=T("claimedSoFar")+claimed.toLocaleString();
    }
    if(userAddr){
      var bal=await tok.balanceOf(userAddr);
      claimLastBal=bal;
      var bl=document.getElementById("balLine");if(bl)bl.textContent=T("balPrefix")+ethers.formatEther(bal)+T("balSuffix");
    }
    updateSelLine();
  }catch(e){var cb2=document.getElementById("claimBadge");if(cb2)cb2.textContent=T("claimBadgeSoon");}
}
/* ---- fireflies canvas (v2 sky, amber/green) ---- */
(function sky(){
  var cv=document.getElementById("sky");
  if(!cv)return;
  var ctx=cv.getContext("2d");
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W=0,H=0,stars=[],flies=[],mx=0,my=0,tx=0,ty=0;
  function size(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;
    stars=[];for(var i=0;i<110;i++){stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.4,ph:Math.random()*6.28,sp:.4+Math.random()*1.2});}
    flies=[];for(var j=0;j<18;j++){flies.push({x:Math.random()*W,y:Math.random()*H,r:1.4+Math.random()*1.4,ph:Math.random()*6.28,sp:.15+Math.random()*.3,dx:(Math.random()-.5)*.25});}
  }
  size();window.addEventListener("resize",size);
  window.addEventListener("mousemove",function(e){tx=(e.clientX/W-.5)*14;ty=(e.clientY/H-.5)*10;});
  function draw(t){
    ctx.clearRect(0,0,W,H);
    mx+=(tx-mx)*.04;my+=(ty-my)*.04;
    ctx.save();ctx.translate(mx,my);
    for(var s of stars){var a=.25+.65*Math.abs(Math.sin(t*.001*s.sp+s.ph));ctx.globalAlpha=a;ctx.fillStyle="#F5EDD8";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fill();}
    for(var f of flies){var x=f.x+Math.sin(t*.0004*f.sp+f.ph)*36+t*.004*f.dx;var y=f.y+Math.cos(t*.0005*f.sp+f.ph)*22;var aa=.35+.5*Math.abs(Math.sin(t*.0012*f.sp+f.ph));
      ctx.globalAlpha=aa*.18;ctx.fillStyle="#D4AF37";ctx.beginPath();ctx.arc(((x%W)+W)%W,((y%H)+H)%H,f.r*2.5,0,6.28);ctx.fill();
      ctx.globalAlpha=aa;ctx.fillStyle="#FFD166";ctx.beginPath();ctx.arc(((x%W)+W)%W,((y%H)+H)%H,f.r,0,6.28);ctx.fill();}
    ctx.restore();ctx.globalAlpha=1;
    if(!reduced)requestAnimationFrame(draw);
  }
  draw(0);
})();
/* ---- boot ---- */
setLang(LANG);
setLoadingUI();
updateNoWallet();
refresh();
if(document.getElementById("claimGrid")||document.getElementById("claimBadge"))loadClaimStats();
setInterval(refresh,30000);
/* slow cinematic scroll reveals — trigger just before entering view */
if(!("IntersectionObserver" in window)){
  document.querySelectorAll(".reveal").forEach(function(el){el.classList.add("on");});
}else{
  var _io=new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("on");o.unobserve(e.target);}});},{rootMargin:"0px 0px -8% 0px",threshold:0});
  document.querySelectorAll(".reveal").forEach(function(el){_io.observe(el);});
}
window.addEventListener("scroll",function(){var cta=document.getElementById("mobileCta");if(!cta)return;cta.classList.toggle("show",window.scrollY>560&&window.innerWidth<=768);},{passive:true});
var qEl=document.getElementById("qty");if(qEl)qEl.addEventListener("input",function(){updateCost();});
/* hover tilt on pal cards */
document.querySelectorAll(".pal-card").forEach(function(card){
  card.addEventListener("mousemove",function(e){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    var r=card.getBoundingClientRect();
    var rx=((e.clientY-r.top)/r.height-.5)*-6, ry=((e.clientX-r.left)/r.width-.5)*6;
    card.style.transform="translateY(-6px) rotateX("+rx+"deg) rotateY("+ry+"deg)";
  });
  card.addEventListener("mouseleave",function(){card.style.transform="";});
});

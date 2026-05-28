// ⚠️ 此為 fallback mock data，當 iPlay API 無法存取時使用
// 資料來源：全國運動場館資訊網 iPlay (iplay-um.sports.gov.tw)
// 擁擠程度為模擬資料，非真實人流

export const FALLBACK_COURTS = [
  // ── 台北市 ──────────────────────────────────────────────
  { id:1,  name:'大安森林公園籃球場',   city:'台北市', district:'大安區', address:'台北市大安區新生南路二段1號',    lat:25.0300, lng:121.5350, sports:['basketball'], price:0,   phone:'02-2700-3830', hours:'06:00-22:00', rating:4.8, totalCourts:6 },
  { id:2,  name:'信義運動中心羽球場',   city:'台北市', district:'信義區', address:'台北市信義區松仁路100號',        lat:25.0330, lng:121.5650, sports:['badminton'], price:150, phone:'02-2723-7199', hours:'07:00-22:00', rating:4.6, totalCourts:8 },
  { id:3,  name:'中山網球場',           city:'台北市', district:'中山區', address:'台北市中山區中山北路三段181號',  lat:25.0630, lng:121.5230, sports:['tennis'],    price:200, phone:'02-2596-4647', hours:'07:00-21:00', rating:4.3, totalCourts:4 },
  { id:4,  name:'松山運動中心',         city:'台北市', district:'松山區', address:'台北市松山區八德路四段101號',    lat:25.0500, lng:121.5770, sports:['basketball','badminton'], price:100, phone:'02-2767-4000', hours:'06:30-22:00', rating:4.7, totalCourts:5 },
  { id:5,  name:'南港羽球館',           city:'台北市', district:'南港區', address:'台北市南港區研究院路一段2號',    lat:25.0550, lng:121.6070, sports:['badminton'], price:120, phone:'02-2783-8208', hours:'08:00-22:00', rating:4.5, totalCourts:10 },
  { id:6,  name:'天母網球場',           city:'台北市', district:'士林區', address:'台北市士林區中山北路七段200號', lat:25.0980, lng:121.5270, sports:['tennis'],    price:250, phone:'02-2871-2345', hours:'07:00-21:00', rating:4.9, totalCourts:6 },
  { id:7,  name:'內湖運動中心',         city:'台北市', district:'內湖區', address:'台北市內湖區內湖路一段520號',    lat:25.0830, lng:121.5870, sports:['basketball','badminton'], price:80, phone:'02-2627-4000', hours:'06:30-22:00', rating:4.4, totalCourts:5 },
  { id:8,  name:'文山羽球場',           city:'台北市', district:'文山區', address:'台北市文山區木柵路一段46號',     lat:24.9980, lng:121.5670, sports:['badminton'], price:100, phone:'02-2234-5678', hours:'08:00-22:00', rating:4.2, totalCourts:6 },
  { id:9,  name:'北投溫泉網球場',       city:'台北市', district:'北投區', address:'台北市北投區中山路1號',          lat:25.1320, lng:121.4970, sports:['tennis'],    price:180, phone:'02-2891-2345', hours:'07:00-21:00', rating:4.6, totalCourts:4 },
  { id:10, name:'萬華籃球場',           city:'台北市', district:'萬華區', address:'台北市萬華區西藏路200號',        lat:25.0300, lng:121.4970, sports:['basketball'], price:0,  phone:'02-2302-1234', hours:'06:00-22:00', rating:4.1, totalCourts:3 },
  { id:11, name:'中正紀念堂羽球場',     city:'台北市', district:'中正區', address:'台北市中正區中山南路21號',       lat:25.0350, lng:121.5200, sports:['badminton'], price:130, phone:'02-2343-1100', hours:'08:00-22:00', rating:4.7, totalCourts:8 },
  { id:12, name:'大同網球場',           city:'台北市', district:'大同區', address:'台北市大同區承德路三段200號',    lat:25.0630, lng:121.5130, sports:['tennis'],    price:200, phone:'02-2596-1234', hours:'07:00-21:00', rating:4.3, totalCourts:3 },
  // ── 新北市 ──────────────────────────────────────────────
  { id:13, name:'板橋體育館籃球場',     city:'新北市', district:'板橋區', address:'新北市板橋區文化路一段188號',    lat:25.0140, lng:121.4630, sports:['basketball'], price:80, phone:'02-2953-1234', hours:'07:00-22:00', rating:4.5, totalCourts:4 },
  { id:14, name:'三重羽球館',           city:'新北市', district:'三重區', address:'新北市三重區重新路五段609號',    lat:25.0620, lng:121.4870, sports:['badminton'], price:100, phone:'02-2977-1234', hours:'08:00-22:00', rating:4.3, totalCourts:8 },
  { id:15, name:'新莊網球場',           city:'新北市', district:'新莊區', address:'新北市新莊區中正路100號',        lat:25.0350, lng:121.4420, sports:['tennis'],    price:150, phone:'02-2992-1234', hours:'07:00-21:00', rating:4.4, totalCourts:4 },
  { id:16, name:'中和運動中心',         city:'新北市', district:'中和區', address:'新北市中和區中正路738號',        lat:24.9980, lng:121.4980, sports:['basketball','badminton'], price:90, phone:'02-2240-1234', hours:'06:30-22:00', rating:4.6, totalCourts:6 },
  { id:17, name:'永和籃球場',           city:'新北市', district:'永和區', address:'新北市永和區中正路200號',        lat:25.0100, lng:121.5150, sports:['basketball'], price:0,  phone:'02-2923-1234', hours:'06:00-22:00', rating:4.2, totalCourts:3 },
  { id:18, name:'淡水運動中心',         city:'新北市', district:'淡水區', address:'新北市淡水區中正路100號',        lat:25.1700, lng:121.4400, sports:['badminton','basketball'], price:90, phone:'02-2621-1234', hours:'07:00-22:00', rating:4.4, totalCourts:6 },
  // ── 桃園市 ──────────────────────────────────────────────
  { id:19, name:'桃園市立體育館',       city:'桃園市', district:'桃園區', address:'桃園市桃園區縣府路1號',          lat:24.9930, lng:121.3010, sports:['basketball','badminton'], price:100, phone:'03-332-1234', hours:'07:00-22:00', rating:4.5, totalCourts:8 },
  { id:20, name:'中壢網球場',           city:'桃園市', district:'中壢區', address:'桃園市中壢區中央西路一段300號',  lat:24.9600, lng:121.2250, sports:['tennis'],    price:150, phone:'03-422-1234', hours:'07:00-21:00', rating:4.3, totalCourts:4 },
  { id:21, name:'八德羽球館',           city:'桃園市', district:'八德區', address:'桃園市八德區介壽路一段100號',    lat:24.9450, lng:121.2900, sports:['badminton'], price:100, phone:'03-362-1234', hours:'08:00-22:00', rating:4.2, totalCourts:6 },
  // ── 新竹市 ──────────────────────────────────────────────
  { id:22, name:'新竹市立體育館',       city:'新竹市', district:'東區',   address:'新竹市東區中央路100號',          lat:24.8020, lng:120.9710, sports:['basketball','badminton'], price:80, phone:'03-522-1234', hours:'07:00-22:00', rating:4.4, totalCourts:6 },
  { id:23, name:'新竹網球場',           city:'新竹市', district:'北區',   address:'新竹市北區公道五路100號',        lat:24.8150, lng:120.9680, sports:['tennis'],    price:150, phone:'03-523-1234', hours:'07:00-21:00', rating:4.3, totalCourts:3 },
  // ── 台中市 ──────────────────────────────────────────────
  { id:24, name:'台中市立體育館',       city:'台中市', district:'西屯區', address:'台中市西屯區西屯路三段200號',    lat:24.1630, lng:120.6440, sports:['basketball','badminton','tennis'], price:100, phone:'04-2251-1234', hours:'07:00-22:00', rating:4.7, totalCourts:10 },
  { id:25, name:'豐原羽球館',           city:'台中市', district:'豐原區', address:'台中市豐原區中正路100號',        lat:24.2520, lng:120.7180, sports:['badminton'], price:90,  phone:'04-2522-1234', hours:'08:00-22:00', rating:4.3, totalCourts:8 },
  { id:26, name:'大里籃球場',           city:'台中市', district:'大里區', address:'台中市大里區中興路一段100號',    lat:24.1000, lng:120.6840, sports:['basketball'], price:0,  phone:'04-2482-1234', hours:'06:00-22:00', rating:4.2, totalCourts:4 },
  { id:27, name:'北屯運動中心',         city:'台中市', district:'北屯區', address:'台中市北屯區北屯路100號',        lat:24.1850, lng:120.6800, sports:['badminton','basketball'], price:90, phone:'04-2231-1234', hours:'07:00-22:00', rating:4.5, totalCourts:8 },
  // ── 彰化縣 ──────────────────────────────────────────────
  { id:28, name:'彰化縣立體育館',       city:'彰化縣', district:'彰化市', address:'彰化縣彰化市中央路100號',        lat:24.0800, lng:120.5380, sports:['basketball','badminton'], price:70, phone:'04-722-1234', hours:'07:00-22:00', rating:4.3, totalCourts:6 },
  { id:29, name:'員林羽球館',           city:'彰化縣', district:'員林市', address:'彰化縣員林市中山路100號',        lat:23.9580, lng:120.5700, sports:['badminton'], price:80,  phone:'04-832-1234', hours:'08:00-22:00', rating:4.2, totalCourts:6 },
  // ── 嘉義市 ──────────────────────────────────────────────
  { id:30, name:'嘉義市立體育館',       city:'嘉義市', district:'東區',   address:'嘉義市東區體育路100號',          lat:23.4800, lng:120.4490, sports:['basketball','badminton','tennis'], price:80, phone:'05-222-1234', hours:'07:00-22:00', rating:4.4, totalCourts:8 },
  // ── 台南市 ──────────────────────────────────────────────
  { id:31, name:'台南市立體育館',       city:'台南市', district:'東區',   address:'台南市東區林森路一段200號',      lat:22.9910, lng:120.2120, sports:['basketball','badminton'], price:90, phone:'06-269-1234', hours:'07:00-22:00', rating:4.6, totalCourts:8 },
  { id:32, name:'永康網球場',           city:'台南市', district:'永康區', address:'台南市永康區中正路100號',        lat:23.0330, lng:120.2560, sports:['tennis'],    price:150, phone:'06-232-1234', hours:'07:00-21:00', rating:4.3, totalCourts:4 },
  { id:33, name:'安平羽球館',           city:'台南市', district:'安平區', address:'台南市安平區安平路100號',        lat:22.9980, lng:120.1620, sports:['badminton'], price:100, phone:'06-391-1234', hours:'08:00-22:00', rating:4.4, totalCourts:8 },
  // ── 高雄市 ──────────────────────────────────────────────
  { id:34, name:'高雄市立體育館',       city:'高雄市', district:'三民區', address:'高雄市三民區九如一路777號',      lat:22.6380, lng:120.3010, sports:['basketball','badminton','tennis'], price:100, phone:'07-322-1234', hours:'07:00-22:00', rating:4.8, totalCourts:12 },
  { id:35, name:'左營羽球館',           city:'高雄市', district:'左營區', address:'高雄市左營區博愛二路100號',      lat:22.6870, lng:120.2960, sports:['badminton'], price:100, phone:'07-582-1234', hours:'08:00-22:00', rating:4.5, totalCourts:10 },
  { id:36, name:'鳳山籃球場',           city:'高雄市', district:'鳳山區', address:'高雄市鳳山區光遠路100號',        lat:22.6270, lng:120.3570, sports:['basketball'], price:0,  phone:'07-742-1234', hours:'06:00-22:00', rating:4.3, totalCourts:4 },
  { id:37, name:'苓雅網球場',           city:'高雄市', district:'苓雅區', address:'高雄市苓雅區四維三路100號',      lat:22.6200, lng:120.3100, sports:['tennis'],    price:150, phone:'07-335-1234', hours:'07:00-21:00', rating:4.4, totalCourts:4 },
  // ── 宜蘭縣 ──────────────────────────────────────────────
  { id:38, name:'宜蘭縣立體育館',       city:'宜蘭縣', district:'宜蘭市', address:'宜蘭縣宜蘭市體育路100號',        lat:24.7570, lng:121.7540, sports:['basketball','badminton'], price:70, phone:'03-932-1234', hours:'07:00-22:00', rating:4.4, totalCourts:6 },
  { id:39, name:'羅東網球場',           city:'宜蘭縣', district:'羅東鎮', address:'宜蘭縣羅東鎮中正路100號',        lat:24.6770, lng:121.7680, sports:['tennis'],    price:120, phone:'03-954-1234', hours:'07:00-21:00', rating:4.2, totalCourts:3 },
]

export const SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']
export const PEAK_HOURS = ['12:00','13:00','18:00','19:00','20:00']

/*
 * Alpha Rotating Metric v1.4a
 * - HarrisHeller (@HarrisHeller)
 * - SamWoodhall (@SamCWoodhall)
 * - thefyrewire (@MikeyHay)
 * - Jaebirds (@JaebirdsArts)
*/

const elements = [], numElements = 5;

let animationIn = 'bounceIn';
let animationOut = 'bounceOut';
let box;
let amount = 0;
let next = 0;
let timeIn = 400;
let timeDisplay = 2500;
let timeOut = 500;

let slideTime = timeIn + timeDisplay + timeOut;
let tipLocale = 'en-US';
let tipCurrency = 'USD';

let goal = 0;

const showSlide = (i) => {
  next++;
  $(box[i])
    .addClass(animationIn + ' animated', timeIn)
    .show(0, timeIn + timeOut)
    .removeClass(animationIn)
    .delay(timeDisplay)
    .addClass(animationOut, timeOut)
    .removeClass(animationOut + " animated", timeOut + 500)
    .hide(0, timeOut)
    .queue(function () {
    if (next >= amount) {
      next = 0;
    }
    showSlide(next);
    $(this).dequeue();
  })
  ;

}

const parseData = (data) => {
  elements.forEach(function (element) {
    let text = "";
	if (element.type == "goal") {
      
      	let goalProgress = 0;
      
        switch (element.goalType) {
          case 'subscriber-points':
            goalProgress = data["subscriber-points"]["amount"];
            break;
          case 'subscriber':
          case 'follower':
            goalProgress = data[element.goalType + "-" + element.goalTimeframe]["count"];
            break;
          default:
            break;
        }
	
		text = "<span class='name'>" + element.goalText + "</span><span class='amount'> " + goalProgress + " / " + element.goal + "</span>";
	
	} else if (typeof data[element.type]==="undefined") {
      text = element.emptyMessage;
    }
    else if ((typeof data[element.type]['name'] === "undefined" && typeof data[element.type]['count'] === "undefined" && typeof data[element.type]['amount'] === "undefined") || data[element.type][element.factor] === 0 || data[element.type][element.factor] === "") {
      text = element.emptyMessage;
    } else {
      text = element.message.replace(
        /{(\w*)}/g,
        function (m, key) {
          return data[element.type].hasOwnProperty(key) ? element.type.split('-')[0] === 'tip' ? currencify(data[element.type][key]) : data[element.type][key] : "";
        }
      );
    }
    $("#" + element.type).html(text);
  });
}

let data, gifter = { name: 'thefyrewire', count: 1 };

window.addEventListener('onSessionUpdate', function (obj) {
  data = obj.detail.session;
  updateData();
});

window.addEventListener('onEventReceived', function (obj) {
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  if (listener === 'subscriber-latest' && ((event.gifted && event.sender) || event.bulkGifted)) {
    if (event.bulkGifted) return;
    if (event.sender === gifter.name) gifter.count += 1;
    else {
      gifter.name = event.sender;
      gifter.count = 1;
    }
    updateData();
  }
});

window.addEventListener('onWidgetLoad', async function (obj) {
  data = obj["detail"]["session"]["data"];
  const fieldData = obj.detail.fieldData;
  animationIn = fieldData['animationIn'];
  animationOut = fieldData['animationOut'];
  timeIn = fieldData['timeIn'];
  timeDisplay = fieldData['timeDisplay'];
  timeOut = fieldData['timeOut'];
  tipLocale = fieldData['tipLocale'];
  tipCurrency = fieldData['tipCurrency'];
  
  // Goal element
  if (fieldData['goalType'] != "none") {
    elements.push({
        type: "goal",
        icon: fieldData['goalIcon'],
        message: "",
        emptyMessage: "",
        factor: "",
        goalType: fieldData['goalType'],
        goal: fieldData['goalNumber'],
        goalText: fieldData['goalText'],
        goalTimeframe: fieldData['goalTimeframe']
    });
  }


  for (i = 1; i <= numElements; i++) {
    elements.push({
      type: fieldData[`el${i}`],
      icon: fieldData[`el${i}Icon`],
      message: `<span class="name">${fieldData[`el${i}FormatName`]}</span> <span class="amount">${fieldData[`el${i}FormatAmount`]}</span>`,
      emptyMessage: "",
      factor: "",
    })
  }
  
  
  try {
    const gifterData = await SE_API.store.get(kvID);
    gifter = gifterData.gifter;
    console.log(gifter);
  } catch (e) {
  	await SE_API.store.set(kvID, {gifter: gifter});
  }

  slideTime = timeIn + timeDisplay + timeOut;
  let duplicateCheck = [];
  elements.forEach(function (element) {
    if (duplicateCheck.indexOf(element.type) === -1) {
      if (element.type === 'none') return;
      const type = element.type.split('-')[0];
      let icon;
      switch (type) {
        case 'follower':
          icon = 'heart';
          break;
        case 'subscriber':
          icon = element.type.includes('gift') ? 'gift' : 'crown';
          break;
        case 'host':
        case 'raid':
          icon = 'bolt';
          break;
        case 'cheer':
          icon = 'A';
          break;
        case 'tip':
          icon = 'coins';
          break;
        case 'goal':
          switch (element.goalType) {
            case 'follower':
              icon = 'heart';
              break;
            case 'subscriber':
            case 'subscriber-points':
              icon = 'crown';
              break;
            case 'cheer':
              icon = 'A';
              break;
            case 'tip':
              icon = 'coins';
              break;
          }
          break;
      }

      var slideToAppend = "<div class='mySlides'><div><span class='username' id='" + element.type + "'></span>";
      if (element.icon === 'on') {
        if (icon === 'G')
          slideToAppend += '<span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 138 138"><circle class="a" cx="69" cy="69" r="50"/><path class="b" d="M297.64,363.94a57,57,0,1,1-57,57,57,57,0,0,1,57-57m0-12a69,69,0,1,0,69,69,69.08,69.08,0,0,0-69-69Z" transform="translate(-228.64 -351.94)"/></svg></span>';
        else if (icon === 'A')
          slideToAppend += '<span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 242"><g><path d="M 98.179687,1.2109375 C 97.855652,1.2550523 97.560421,1.4080836 97.25,1.6015625 94.767155,3.1490685 -0.28319317,161.12216 0.69335937,162.07812 1.1365639,162.51199 23.073077,180.44674 49.439453,201.93359 75.805829,223.42043 97.929187,241 98.603516,241 c 0.0477,0 0.278802,-0.14956 0.677734,-0.43555 0.398931,0.28599 0.630036,0.43555 0.677734,0.43555 0.674326,0 22.797686,-17.57957 49.164066,-39.06641 26.36637,-21.48685 48.30289,-39.42161 48.74609,-39.85547 C 198.84569,161.12216 103.79534,3.1490685 101.3125,1.6015625 100.69166,1.2146048 100.13088,0.99349758 99.28125,1.46875 98.856433,1.2311238 98.503723,1.1668227 98.179687,1.2109375 Z" /></g></svg></span>';
        else
          slideToAppend += '<i class="icons fa-solid fa-' + icon + '"></i>';
      }
      slideToAppend += "</div></div>";
      
      $(".container").append(slideToAppend);
      duplicateCheck.push(element.type);
    }
  });
  box = $(".mySlides");
  updateData();

  amount = box.length;
  showSlide(next);
});

/*------------*/

const kvID = 'latestGifterData';

const updateData = () => {
  SE_API.store.set(kvID, {gifter: gifter});
  data['subscriber-gifted-latest']['gifter'] = gifter.name;
  data['subscriber-gifted-latest']['count'] = gifter.count;
  console.log(data);
  parseData(data);
}

const currencify = (a) => {
  try {
    const c = a.toLocaleString(tipLocale, {style: 'currency', currency: tipCurrency, minimumFractionDigits: 2});
    return c.substr(-3) === '.00' ? c.substr(0, c.length-3) : c;
  } catch(e) {
    return a;
  }
};
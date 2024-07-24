async function onLoad(){
    if (localStorage.getItem("thisismudith") == null){
        localStorage.setItem("thisismudith", JSON.stringify({
            "visited": false,
            "cache": {
                "unique": 1,
                "total": 1
            },
            "syncTime": 0,
            "syncRepos": [],
            "sourceChecked": false,
        }));
        console.log('UNDONE!')
        syncRepos();
    }
    if (window.innerWidth <= 720){
        document.querySelector('#gradient stop').setAttribute('stop-color', '#25573e')
    }
    console.log('DONE!')
    document.getElementById("unique").textContent = get("cache")["unique"];
    document.getElementById("total").textContent = get("cache")["total"];
    if (get("cache")["total"] != 1) document.getElementById("visitTense").textContent = "visitors";
    setTimeout(laptopType, 2000);
    myAge();
    getViews();
    arrowChanger();
    if (window.innerWidth < 720) document.querySelector('.spider').remove()
    else setTimeout(()=>{document.querySelector('.spider').setAttribute('onmouseover', 'spider(this, true)')}, 2100);
    if (new Date().getTime() - get('syncTime') >= 10800000) syncRepos();
    else{
        repos = get('syncRepos')
        stats = get('stats')
        if (repos.length >= 1) loadRepos();
        else syncRepos(forceContinue=true);
    }
}

function get(key){
    return JSON.parse(localStorage.getItem("thisismudith"))[key] 
}

function set(key, value){
// function set(key, value, subkey=null){
    let data = JSON.parse(localStorage.getItem("thisismudith"))
    // if (subkey) data[key][subkey] = value
    // else data[key] = value
    data[key] = value
    localStorage.setItem("thisismudith", JSON.stringify(data))
}

function myAge(){
    const birthday = new Date('2007-10-17'),
    today = new Date()
    var age = today.getFullYear() - birthday.getFullYear(),
    m = today.getMonth() - birthday.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--
    document.getElementById('age').innerText = age + ' years'
}

async function getViews(){
    const views = await fetch("https://api.jsonstorage.net/v1/json/189279f0-d641-463a-8e15-00adc07d651e/ee388473-b86f-4947-a0fc-d5339a62192a", {
        method: "GET",
    }
    ).then(response => response.json())
    console.log(views)
    let unique = views["unique"],
    total = views["total"]
    if (get("visited")) total++
    else{
        unique++; total++
        set("visited", true);
    }
    set("cache", {"unique": unique, "total": total})
    document.getElementById("unique").textContent = unique;
    document.getElementById("total").textContent = total;
    if (total != 1) document.getElementById("visitTense").textContent = "visits";
    document.getElementById("unique").style.color = "#ABADC6";
    document.getElementById("total").style.color = "#ABADC6";
    let req = new XMLHttpRequest();
    req.open("PUT", "https://api.jsonstorage.net/v1/json/189279f0-d641-463a-8e15-00adc07d651e/ee388473-b86f-4947-a0fc-d5339a62192a?apiKey=e5a8c15c-736a-4297-b5d0-bad2b9495678", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"unique": unique, "total": total}));
}

function laptopType(){
    const texts = ["Hi,", "", "I'm Mudith Daga", "", "", "Website / Algorithms / Data"],
    order = ["h1", "h3", "h4"],
    topIncr = [36, 46],
    leftIncr = [18, 10.5];
    let i = 0,
    j = 0,
    pos = 0,
    top = 114,
    left = 54;
    cursor = document.querySelector(".screen .cursor");
    cursor.style.display = "block"
    function mainType(){
        if (j < texts.length){
            let text = texts[j]
            if (text == ""){
                i = 0;
                left = 54;
                if (text == texts[j+1]){
                    cursor.style.height = "20px";
                    pos++;
                    top+=topIncr[pos];
                    document.querySelector(".screen .mouse").style.opacity = 0;
                }else{
                    top += 36;
                }
                if (j == 1) document.querySelector(`.screen ${order[pos]}`).innerHTML += "<br>";
                cursor.style.top = `${top}px`;
                cursor.style.left = 54+"px";
                j++;
                mainType();
            }else{
                function typeText(){
                    if (i < text.length){
                        document.querySelector(`.screen ${order[pos]}`).innerHTML += text.charAt(i);
                        left += leftIncr[pos];
                        cursor.style.left = `${left}px`;
                        i++;
                        setTimeout(typeText, 100);
                    }else{
                        j++;
                        mainType();
                    }
                }
                setTimeout(typeText, 100);
            }
        };
        if (j == 6){
            cursor.style.animation = "blink 1s 3";
            cursor.addEventListener("animationend", () => {
                cursor.style.display = "none";
            })
        }
    }
    mainType();
}

function spider(elm, hover=true){
    if (hover){
        elm.style.top = '-120%';
        setTimeout(()=>{elm.style.top = '26px'}, 1000); 
        elm.removeAttribute('onmouseover');
        elm.setAttribute('onclick', 'spider(this, false)');
    }else{
        new Audio('assets/audio/amongus.mp3').play();
        elm.style.animation = 'none';
        elm.querySelectorAll('*:not(.spiderweb):not(.blood)').forEach(limb =>limb.style.animation='spiderDead .5s forwards');
        elm.querySelectorAll('.blood div').forEach(stain=>{stain.style.animation=stain.getAttribute('stainAnim');
        setTimeout(()=>{
            stain.style.display = 'none';
            elm.remove();
        },6000)});
        elm.querySelector('.spiderweb').style.animation = 'ropeFell 1s forwards';
        elm.style.cursor = 'context-menu';
        elm.removeAttribute('onclick')
    }
}


function cropText(height, elm, text){
    var cropped, i = 0
    var sentences = text.innerHTML.split('. ').reverse()
    if (!sentences[0].replace('\n','').replace(/\s/g, '').length) sentences.shift()
    var croppedText = []
    while (elm.offsetHeight > height){
        cropped = true;
        croppedText.push(sentences[i])
        sentences.splice(i, 1)
        text.setAttribute('readMore', croppedText.join('. '))
        text.innerHTML = sentences.reverse().join('. ')
        i++;
    }
    if (elm.offsetHeight <= height && cropped && !text.innerHTML.includes('. <span class="readMore" onclick="readMore(this.parentElement)">Read more</span>')) text.innerHTML += '. <span class="readMore" onclick="readMore(this.parentElement)">Read more</span>'
}

function readMore(elm){
    elm.innerHTML = elm.innerHTML.replace('<span class="readMore" onclick="readMore(this.parentElement)">Read more</span>', "")
    elm.innerHTML += elm.getAttribute('readMore')
}

// https://blog.stevenlevithan.com/archives/javascript-date-format
var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsT])\1?|[oSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
    };
    
	return function (date, mask, utc) {
		var dF = dateFormat;

		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				tt:   H < 12 ? "am" : "pm",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

var notif = false;
var notificationContainer = document.createElement('div')
var notifMsg;
notificationContainer.className = 'notification-holder';
document.body.appendChild(notificationContainer);

function notification(icon, content, bg="var(--black)", fg="white", time=5000, originalCall=true){
    notifMsg = document.createElement('div');
    notifMsg.className = 'notification unselectable';
    notifMsg.innerHTML = `${icon}<p>${content}</p>`;
    notifMsg.style.backgroundColor = bg;
    notifMsg.style.color = fg;
    notifMsg.style.width = 'fit-content';
    notifMsg.style.maxWidth = "75%";
    notifMsg.style.animation = 'notificationAnimate 0.2s forwards';
    notifMsg.addEventListener('animationend', function () {
        notifMsg.style.visibility = 'visible';
        notifMsg.style.animation = '';

        setTimeout(function () {
            notifMsg.style.animation='notificationAnimate 0.2s reverse';
            notifMsg.addEventListener('animationend', function () {
                notifMsg.remove();
            });
            notif = false;
        }, time);
    });
    document.body.style.border = "1px solid red;"
    notificationContainer.style.cssText = "width: 100%; position: fixed; left: -50%; z-index: 2;";
    if (document.querySelector(".burger").classList.contains("active") && originalCall){
        var event = document.querySelector(".burger").addEventListener("click", function(e){
            notif = true;
            notificationContainer.appendChild(notifMsg);
            e.target.removeEventListener(e.type, arguments.callee);
        })
    }else{
        notif = true;
        notificationContainer.appendChild(notifMsg);
    }
    console.log(originalCall, notif)
};

var stationary = true
function sidebarScroll(pos, force=false){
    if (stationary){
        const scroll = document.querySelector('.sidelink .slider');
        scroll.style.right = `${115*pos}px`;
        if (force){
            stationary = false
            setTimeout(()=>{stationary = true}, 500)
        }
        document.querySelectorAll('.sidelink a').forEach(link => link.classList.remove('active'));
        document.getElementById(`sidelink-${pos}`).classList.add('active');
    }
    // if (goto) 
}

function arrowChanger(){
    if (window.innerWidth < 720) document.querySelector('.bottom i').className = 'fa-duotone fa-angles-down'
    else document.querySelector('.bottom i').className = 'fa-duotone fa-angles-right'
}

function sourceChecked(originalCall=true){
    if (!get("sourceChecked")){ // If source code not opened earlier
        notification(
            '<i class="fa-solid fa-code"></i>',
            `
            Loved the website? Check out the source code on GitHub &nbsp;&nbsp;
            <a href="https://github.com/thisismudith/thisismudith" target="_blank" onclick="set('sourceChecked', true)">
                <i class="fa-solid fa-up-right-from-square"></i>
            </a>
            `, 
            'var(--dark-blue)', 'white', 7500, originalCall) // After 7.5s
    }
}
setTimeout(sourceChecked, 45000) // After 45s -- CHANGE

function toggleMenu(btn){
    if (btn.classList.contains("active")){
        btn.classList.remove("active")
        if (window.innerWidth <= 720){
            setTimeout(()=>{document.querySelector('.mobileNav').style.display = 'none'}, 500);
            document.querySelector('.mobileNav').style.animation = 'mobileNavAnimExit .5s ease forwards';
            if (notif){
                notifMsg.removeEventListener('animationend', function () {
                    notifMsg.style.animation = '';
                });

                setTimeout(sourceChecked, 1000, false);
            }
        }
    }else{
        btn.classList.add("active")
        if (window.innerWidth <= 720){
            document.querySelector('.mobileNav').style.display = 'grid';
            document.querySelector('.mobileNav').style.animation = 'mobileNavAnimEnter .5s ease forwards';
            if (notif) notificationContainer.querySelector('.notification').remove();
        }
    }
}

function mobileSidebar(elem) {
    document.querySelectorAll(".mobileNav a").forEach(e => {
        if (e.classList.contains("active")) e.classList.remove("active");
    })
    elem.classList.add("active");
}


document.body.addEventListener("wheel", (e) => {
    const home = document.getElementById('home');
    var scrolled = (home.style.backgroundPositionX) ? parseInt(home.style.backgroundPositionX.replace('px', ''))/100 : 0;
    home.style.backgroundPositionX = -(scrolled + document.documentElement.scrollTop) + "px";
});
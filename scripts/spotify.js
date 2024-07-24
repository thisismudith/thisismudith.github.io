
// window.onSpotifyWebPlaybackSDKReady = () => {
//     const token = 'a47c12c45ce04037b8ee8146f474d003';
//     const player = new Spotify.Player({
//       name: 'TheMyth1710 Spotify Player',
//       getOAuthToken: cb => { cb(token); },
//       volume: 0.5
//     });
// }

// var client_id = '913a2ab4e1fd4cf8b4b95b3b45e10cb9',
// client_secret = 'a47c12c45ce04037b8ee8146f474d003',
// refresh = get('spotifyRefresh'),
// payload = get('spotifyPayload'),
// deviceID;

// window.addEventListener("load",()=>{
// var player = new Spotify.Player({
//     name: 'TheMyth1710 Spotify Player',
//     getOAuthToken: callback => {
//       callback(payload);
//     },
//     volume: 0.5
//   });
// // Ready
// console.log(player)
// player.addListener('ready', ({ device_id }) => {
// console.log('Ready with Device ID', device_id);
// deviceID = device_id
// });

// // Not Ready
// player.addListener('not_ready', ({ device_id }) => {
// console.log('Device ID has gone offline', device_id);
// });
// player.addListener('initialization_error', ({ message }) => { 
//     console.error(message);
// });

// player.addListener('authentication_error', ({ message }) => {
//     console.error(message);
// });

// player.addListener('account_error', ({ message }) => {
//     console.error(message);
// });
// player.connect();
// document.getElementById('togglePlay').onclick = function() {
//   player.togglePlay();
// };
// })

// if (window.location.hash.includes('#access_token')){
//     var hash = window.location.hash.substring(1);
//     console.log(hash);
//     var accessString = hash.indexOf("&");
//     access_token = hash.substring(13, accessString);
//     set('spotifyPayload', access_token);
//     window.onunload = () => {window.opener.location.reload();}
//     window.close();
// }else if (window.location.search.includes('code')){
//     var query = new URLSearchParams(window.location.search);
//     var code = query.get('code');
//     set('spotifyRefresh', code);
//     window.close();
// }

// async function spotifyLogin(){
//     window.open(`https://accounts.spotify.com/authorize?client_id=913a2ab4e1fd4cf8b4b95b3b45e10cb9&response_type=code&scope=streaming&redirect_uri=http://localhost:5500`, 'Login with Spotify', 'width=800,height=600')
//     window.spotifyCallback = (payload) => {
//         fetch('https://api.spotify.com/v1/me', {
//         headers: {'Authorization': `Bearer ${payload}`}}).then(response => {
//         return response.json()
//         })
//     }
// }
// function newToken(){
//     let xml = new XMLHttpRequest();
//     xml.open('POST', 'https://accounts.spotify.com/api/token', true);
//     xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     xml.setRequestHeader('Authorization', `Basic ${btoa(client_id + ':' + client_secret)}`);
//     xml.send(`grant_type=authorization_code&code=${refresh}&redirect_uri=http://localhost:5500`);
//     xml.onload = () =>{
//         var data = JSON.parse(xml.responseText);
//         console.log(data)
//         if (data.access_token != undefined) set('spotifyPayload', data['access_token']);
//         if (data.refresh_token != undefined) set('spotifyRefresh', data['refresh_token']);
//     };
// }

// function handleAuthorizationResponse(){
//     if ( this.status == 200 ){
//         var data = JSON.parse(this.responseText);
//         console.log(data);
//         var data = JSON.parse(this.responseText);
//         if ( data.access_token != undefined ){
//             access_token = data.access_token;
//             set("spotifyPayload", access_token);
//         }
//         if ( data.refresh_token  != undefined ){
//             refresh_token = data.refresh_token;
//             set("spotifyRefresh", refresh_token);
//         }
//     }
//     else {
//         console.log(this.responseText);
//     }
// }
// function spotifyPlay(){
//     fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`, {
//     method: 'PUT',
//     headers: {
//     'Accept': 'application/json',
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${payload}`
//     },
//     body: JSON.stringify({
//     'context_uri': 'spotify:album:5ht7ItJgpBH7W6vJ5BqpPr',
//     'offset': {
//         'position': 5
//     },
//     'position_ms': 0
//     })
//     });
// }

// function spotifyPause(){
//     fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceID}`, {
//     method: 'PUT',
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${payload}`
//     }
//     });

// }
// // curl -X POST "https://api.spotify.com/v1/refresh" -H "Content-Type: application/x-www-form-urlencoded" --data "refresh_token=AQBWq5gKixyqBVKK629no29Jh8w8epBDNu1iFLvJcuG1G"
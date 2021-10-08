/* Foxes 71 Movie Poster */

// declare global song variable to determine what song (if any) is currently playing across all of my functions
let playing;
let soundtracks = {};

/*
Gets access token from Spotify API
using our client_id and client_secret
Handles Spotify API authorization
*/
const getToken = async () => {
    const clientID = '616b3b0f6c8a4ae3984ad23275a44dfb';
    const clientSecret = 'db06adcebbfa4bd7ad99dafc87e4b324';

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientID + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    })
    const token = await result.json();
    return token.access_token;
}

/*
@param song - string - song name to search for
@param token - string - bearer token for Spotify API authorization

Returns the top result for query of a song name to the Spotify API Search Endpoint

! No longer used. !
*/
let searchAPI = async (song, APItoken) => {
    let request = await fetch(`https://api.spotify.com/v1/search?q=${song}&type=track&limit=10`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${APItoken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    return request.json()
}

/*
Album API Call
*/
let albumAPI = async (album, APItoken) => {
    let request = await fetch(`https://api.spotify.com/v1/search?q=${album}&type=album&limit=10&market=US`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${APItoken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    return request.json();
}

let tracklistAPI = async (albumID, APItoken) => {
    let request = await fetch(`	https://api.spotify.com/v1/albums/${albumID}/tracks?limit=30&market=US`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${APItoken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    return request.json()
}

/*
Populates soundtracks for all present albums then uses Flask app to scrape out preview urls
*/
let shitThisIsInefficient = async (albumname, tagid, token) => {
    let data = await albumAPI(albumname, token);
    let dataID = data.albums.items[0].id;
    let tracklist = await tracklistAPI(dataID, token);
    tracklist = tracklist.items.map(e => e.external_urls.spotify.slice(0, 24) + '/embed' + e.external_urls.spotify.slice(24));
    // make api call to our foxes api
    let tracks = await foxesAPIcall(JSON.stringify(tracklist));
    soundtracks[tagid] = tracks;
}

/* 
Foxes API custom scraping function
@param - array - list of embed urls
returns list of preview_urls as JSON
*/
let foxesAPIcall = async (tracklist) => {
    let data = await fetch('http://localhost:5000/api/spotifyscraper', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: tracklist
    })
    let response = data.json();
    return response;
}


/*
Loads up all soundtracks utilizing our multiple API calls (SpotifyAPI album -> SpotifyAPI album tracklist -> FlaskAPI scraper preview_urls)
*/
let initialLoading = async () => {
    let token = await getToken();
    albums = {
        'gladiator':'Gladiator - Music From The Motion Picture',
        'ratatouille':'Ratatouille (Original Motion Picture Soundtrack)',
        'chef': 'Chef (Original Soundtrack Album)',
        'amadeus': 'Amadeus (The Complete Soundtrack Recording)',
        'casinoroyale': 'Casino Royale',
        'pirates': 'Pirates of the Caribbean: The Curse of the Black Pearl'
    }
    for(a in albums){
        await shitThisIsInefficient(albums[a], a, token);
    }
    console.log(soundtracks);
}

/*
Hider/shower so that user cannot click until soundtracks loaded
*/
let goGoGo = async () => {
    console.log('loading up');
    let gallerie = document.getElementsByClassName('gallery')[0];
    let loader = document.getElementById('loading');
    gallerie.style.visibility = 'hidden';
    await initialLoading();
    loader.style.visibility = 'hidden';
    gallerie.style.visibility = 'visible';
}

/*
Modified clickevent such that no API calls are made -> takes advantage of soundtracks object populated on load
*/
let clickEvent2 = async (id) => {
    console.log(id);

    song = soundtracks[id][Math.floor(Math.random()*soundtracks[id].length)];
    console.log(song);

    if (playing) {
        // check if we are about to play the same song and if it is currently playing
        if (playing.movie == id && playing.track.paused == false) {
            // if same song currently playing, pause it
            stopSong();
            return
        } else if (playing.movie == id) {
            // if same song currently paused, play it
            playing.track.play();
            return
        }
        // otherwise we assume we're working with a different song and pause any song playing
        stopSong();
    }

    // play our new song
    wahwah = new Audio(song);
    playing = {'movie': id, 'track': wahwah}
    console.log(playing);
    playing.track.play();
}

/*
Handles Movie Poster Click Event
Calls related API and other functions
*/
let clickEvent = async (id, songname) => {
    console.log(id, songname);

    let token = await getToken();

    if (id == 'gladiator' || id == 'ratatouille') {
        let songs = await initialLoading();
        return
    }

    let data = await searchAPI(songname, token);
    console.log(data.tracks.items[0]);
    let song = data.tracks.items[0].preview_url;
    console.log(song);

    // once we have the preview_url, we want to make this play the song
    // we're going to make use of some JS/browser built-in Audio stuff

    // first, if there already is a playing song, stop it
    if (playing) {
        // check if we are about to play the same song and if it is currently playing
        if (playing.src == song && playing.paused == false) {
            // if same song currently playing, pause it
            stopSong();
            return
        } else if (playing.src == song) {
            // if same song currently paused, play it
            playing.play();
            return
        }
        // otherwise we assume we're working with a different song and pause any song playing
        stopSong();
    }

    // play our new song
    playing = new Audio(song);
    console.log(playing);
    playing.play();
}


/*
The all-important stop button so that we don't go crazy
*/
let stopSong = () => {
    return playing.track.pause()
}


goGoGo();
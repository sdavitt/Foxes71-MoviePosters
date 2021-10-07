/* Foxes 71 Movie Poster */

// declare global song variable to determine what song (if any) is currently playing across all of my functions
let playing;

/*
Gets access token from Spotify API
using our client_id and client_secret
Handles Spotify API authorization
*/
const getToken = async () => {
    const clientID = 'your ID here';
    const clientSecret = 'your secret here';

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
    let request = await fetch(`https://api.spotify.com/v1/search?q=${album}&type=album&limit=10`, {
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
Handles Movie Poster Click Event
Calls related API and other functions
*/
let clickEvent = async (id, songname) => {
    console.log(id, songname);

    let token = await getToken();

    if (id == 'gladiator' || id == 'ratatouille') {
        let data = await albumAPI(songname, token);
        let dataID = data.albums.items[0].id;
        let tracklist = await tracklistAPI(dataID, token);
        let tracks = tracklist.items;
        console.log(tracks);
        tracks = tracks.filter(track => track.preview_url);
        console.log(tracks);
        return
    }

    let data = await searchAPI(songname, token);
    console.log(data.tracks.items[0]);
    let song = data.tracks.items[0].preview_url;

    // once we have the preview_url, we want to make this play the song
    // we're going to make use of some JS/browser built-in Audio stuff

    // first, if there already is a playing song, stop it
    if (playing){
        // check if we are about to play the same song and if it is currently playing
        if (playing.src == song && playing.paused == false){
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
    return playing.pause()
}
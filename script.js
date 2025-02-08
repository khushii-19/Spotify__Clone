console.log('Lets write some javascript');
let currentSong = new Audio();
let songs;
let currfolder;

// defining secondsToMinutesSeconds

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    //  getting folder
    currfolder = folder;

    let a = await fetch(`http://127.0.0.1:5500/${folder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all  the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = " ";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Khushi</div>
                            </div>    
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="playbtn.svg" alt="">
                                </div> 
                                </li>`;
    }



    // attach an event listener to every song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })

    return songs
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbumns() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    console.log(anchors)
    let cardsContainer = document.querySelector(".cardsContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0]

            //    get the metadata of the folder
            if (folder !== "songs") {
                let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
                let response = await a.json();
                cardsContainer.innerHTML = cardsContainer.innerHTML + `<div data-folder=${folder} class="card rounded">
        <div class="play"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="fille" class="injected-svg" data-src="/icons/play-stroke-sharp.svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
        <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path>
        </svg>
        </div>
        <img class="rounded" src="/songs/${folder}/cover.jpg" alt="">
        <h4>${response.title}</h4>
        <p>${response.description} </p>
        </div>`
            }
        }
    }

    // load the songs/playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getSongs(`songs/${items.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

async function main() {

    //getting list of songs
    await getSongs("songs/cs")

    // Display all the albums on the page
    displayAlbumns()

    // Do not play the song automatically
    currentSong.src = `/${currfolder}/` + songs[0];
    document.querySelector(".songinfo").innerHTML = decodeURI(songs[0]);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";


    // display all the albumns on the page



    //attach an event listerner to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = 'playbtn.svg'
        }
    })


    // listen for time update event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // add an event listener to previous and next
    prev.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])


        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })


    next.addEventListener("click", () => {
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])


        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })


    // add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";

    });


    // add event listener for hamburger close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";  // Hide menu
    });

    // add an event listener to mute the volumne
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })



}
main()



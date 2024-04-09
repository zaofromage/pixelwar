import { fetchTab, getTeam, getTime, listTeams, chooseTeam, putPixel } from './api.js';

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let cellSize;

const uti = {
    uid: "e6d7a2c5",
    nouvelleEquipe: 1
}

const zoom = 5;

let modif = true;

let mousePos;

let localTab;

window.onload =  async () => {
    afficheTab();
    printTeam();
    printPlayers();
    setInterval(afficheTab, 2000);
    setInterval(printTime, 1000);
    setInterval(printTeam, 3000);
    setInterval(printPlayers, 5000);
};

const getMousePos = (e) => { 
    let rect = canvas.getBoundingClientRect();
    return {
        x : Math.round(e.clientX - rect.left),
        y : Math.round(e.clientY - rect.top)
    }
}

canvas.addEventListener("mousemove", (e) => {
    mousePos = getMousePos(e);
    if (modif){
        let color = document.getElementById("couleur").value;
        afficheTab(localTab);
        ctx.fillStyle = color;
        ctx.fillRect(mousePos.x, mousePos.y, cellSize, cellSize);
    }
});

const printTime = async () => {
    let time = await getTime(document.getElementById("uid").value);
    let attente = document.getElementById("attente");
    if (time.code != 200) {
        attente.textContent = "Entrez un uid";
    }
    else if (time.data.tempsAttente <= 0){
        attente.textContent = "Vous pouvez modifier un pixel";
    }
    else {
        attente.textContent = `${Math.round(time.data.tempsAttente*0.001)} secondes avant de poser un pixel`;
    }
}

const printTeam = async () => {
    let equipe = await getTeam(document.getElementById("uid").value);
    let team = document.getElementById("actualTeam");
    if (equipe.data.equipe <= 0) {
        team.textContent = "Vous n'avez pas d'équipe";
        checkRadio();
    }
    else if (equipe.data.equipe <= 4) {
        team.textContent = `Vous êtes dans l'équipe ${equipe.data.equipe}`;
    }
    else {
        team.textContent = "L'uid n'existe pas";
    }
}

const printPlayers = async () => {
    let players = await listTeams(document.getElementById("uid").value);
    //remove all li from ul
    players.map((player) => {
        let li = document.createElement("li");
        li.textContent = `${player.nom} de l'équipe ${player.equipe} a posé ${player.nbPixelsModifies} pixels`;
        document.getElementById("listeJoueurs").appendChild(li);
    })
}

const changeTeam = async (radio) => {
    const uti = {
        uid: document.getElementById("uid").value,
        nouvelleEquipe: radio.value
    }
    let res = await chooseTeam(uti);
    if (res.code != 200){
        await checkRadio();
    }
    await printTeam();
}

document.getElementById("modifier").addEventListener("click", () => {
    modif = !modif;
    console.log(modif);
});


canvas.addEventListener("click", () => {
    if (modif){
        putPixel({
            color: document.getElementById("couleur").value,
            uid: document.getElementById("uid").value,
            row: Math.round(mousePos.y/zoom),
            col: Math.round(mousePos.x/zoom)
        });
        modif = !modif;
    }
 })

//affichage
const afficheTab = async () => {
    let tableau = await fetchTab();
    localTab = tableau;
    cellSize = canvas.clientWidth/tableau.length;
    canvas.width = tableau.length  * zoom;
    canvas.height = tableau.length * zoom;
    tableau.map((ligne, i) => {
        ligne.map((cell, j) => {
            ctx.fillStyle = cell;
            ctx.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
        })
    })
}

const checkRadio = async () => {
    let check = document.querySelector('input[type="radio"]:checked');
    if (check != null){
        check.checked = false;
        let team = await getTeam(document.getElementById("uid").value);
        if (team.data < 0 && team.data <= 4){
            document.querySelector(`input[value="${team.data.equipe}"]`).checked = true;
        }
    }
}

document.querySelectorAll("input").forEach((input) => {
    if (input.type === "radio"){
        input.addEventListener("click", () => changeTeam(input));
    }
})
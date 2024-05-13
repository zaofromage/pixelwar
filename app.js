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
    const fieldset = document.querySelector('fieldset');
    const main = document.querySelector('main');
    let content = document.querySelector('#attente');
    let progress = document.querySelector('progress');
    if (time.code != 200) {
        if (!content) {
            progress.remove();
            content = document.createElement('p');
            content.id = 'attente';
            main.insertBefore(content, fieldset);
        }
        content.textContent = "Entrez un uid";
        modif = false;
    }
    else if (time.data.tempsAttente <= 0){
        if (!content) {
            progress.remove();
            content = document.createElement('p');
            content.id = 'attente';
            main.insertBefore(content, fieldset);
        }
        content.textContent = "Vous pouvez modifier un pixel";
        modif = true;
    }
    else {
        if (!progress) {
            content.remove();
            progress = document.createElement('progress');
            progress.max = 15;
            main.insertBefore(progress, fieldset);
        }
        progress.value = 15 - Math.round(time.data.tempsAttente*0.001);
        main.insertBefore(progress, fieldset);
        modif = false;
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
    let body = document.querySelector('tbody');
    body.remove();
    body = document.createElement('tbody');
    players.map(p => {
        const tr = document.createElement('tr');
        let nom = document.createElement('td');
        nom.textContent = p.nom;
        let equipe = document.createElement('td');
        equipe.textContent = p.equipe;
        let lastMod = document.createElement('td');
        lastMod.textContent = p.lastModificationPixel;
        let banned = document.createElement('td');
        banned.textContent = p.banned;
        tr.appendChild(nom);
        tr.appendChild(equipe);
        tr.appendChild(lastMod);
        tr.appendChild(banned);
        body.appendChild(tr);
    })
    document.getElementById('tab').appendChild(body);
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
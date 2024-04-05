const url = "https://pixel-api.codenestedu.fr";

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let cellSize = canvas.clientWidth/tableau.length;

const zoom = 5;

let modif = false;

let mousePos;

let localTab;

const uti = {
    uid: "e6d7a2c5",
    nouvelleEquipe: 1
}

window.onload = () => {
    fetchTab();
    setInterval(fetchTab, 2000); 
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

function fetchTab() {
    fetch(`${url}/tableau`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        canvas.width = data.length * zoom;
        canvas.height = data.length * zoom;
        afficheTab(data);
        localTab = data;
    })
    .catch((error) => {
        console.log(error);
    });
}

document.getElementById("temps").addEventListener("click", () => {
    fetch(`${url}/temps-attente?uid=${uti.uid}`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.log(error);
    })
});

document.getElementById("equipe").addEventListener("click", () => {
    fetch(`${url}/equipe-utilisateur?uid=${uti.uid}`)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.log(error);
    })
});

document.getElementById("liste").addEventListener("click", () => {
    fetch(`${url}/liste-joueurs?uid=${uti.uid}`)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.log(error);
    })
});

document.getElementById("choisir").addEventListener("click", () => {
    fetch(`${url}/choisir-equipe`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(uti)
    })
    .then((response) => {
        if (!response.ok){
            return response.json().then(data => {console.log(data.msg)})
        }
        return response.json();
    })
    .then((data) => {
        console.log(data.msg);
    })
});


document.getElementById("modifier").addEventListener("click", () => {
    modif = !modif;
    console.log(modif);
});

canvas.addEventListener("click", () => {
    if (modif){
        fetch(`${url}/modifier-case`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "color": document.getElementById("couleur").value,
                "uid": uti.uid,
                "col": Math.round(mousePos.x/zoom),
                "row": Math.round(mousePos.y/zoom)
            })
        })
        .then((response) => {
            if (!response.ok){
                return response.json().then(data => {console.log(data.msg)})
            }
            return response.json();
        })
        .then((data) => {
            console.log(data.msg);
        })
        fetchTab();
        modif = false;
    }
 })

function update() {
    
    requestAnimationFrame(update);
};


//affichage
const afficheTab = (tableau) => {
    cellSize = canvas.clientWidth/tableau.length;
    tableau.map((ligne, i) => {
        ligne.map((cell, j) => {
            ctx.fillStyle = cell;
            ctx.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
        })
    })
}
const url = "https://pixel-api.codenestedu.fr";



export const fetchTab = async () => {
    let req = await fetch(`${url}/tableau`);
    let tab = await req.json();
    return tab;
}

export const getTime = async (uid) => {
    let req = await fetch(`${url}/temps-attente?uid=${uid}`);
    let time = await req.json();
    return {
        data: time,
        code: req.status
    };
};

export const getTeam = async (uid) => {
    let req = await fetch(`${url}/equipe-utilisateur?uid=${uid}`);
    let team = await req.json();
    return {
        data: team,
        code: req.status
    };
};

export const listTeams = async (uid) => {
    let req = await fetch(`${url}/liste-joueurs?uid=${uid}`);
    let teams = await req.json();
    return teams;
};

export const chooseTeam = async (uti) => {
    let req = await fetch(`${url}/choisir-equipe`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(uti)
    });
    let res = await req.json();
    return {
        data: res,
        code: req.status
    };
};


export const putPixel = async (_data) => {
    let req = await fetch(`${url}/modifier-case`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(_data)
    });
    let res = await req.json();
    return {
        data: res,
        code: req.status
    };
}

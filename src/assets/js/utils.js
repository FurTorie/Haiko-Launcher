/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 */

const { ipcRenderer } = require('electron')
const { Status } = require('minecraft-java-core')
const fs = require('fs');
const pkg = require('../package.json');

import config from './utils/config.js';
import database from './utils/database.js';
import logger from './utils/logger.js';
import popup from './utils/popup.js';
import { skin2D } from './utils/skin.js';
import slider from './utils/slider.js';

async function setBackground(theme) {
    if (typeof theme == 'undefined') {
        let databaseLauncher = new database();
        let configClient = await databaseLauncher.readData('configClient');
        theme = configClient?.launcher_config?.theme || "auto"
        theme = await ipcRenderer.invoke('is-dark-theme', theme).then(res => res)
    }
    let background
    let body = document.body;
    body.className = theme ? 'dark global' : 'light global';
    if (fs.existsSync(`${__dirname}/assets/images/background/easterEgg`) && Math.random() < 0.005) {
        let backgrounds = fs.readdirSync(`${__dirname}/assets/images/background/easterEgg`);
        let Background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        background = `url(./assets/images/background/easterEgg/${Background})`;
    } else if (fs.existsSync(`${__dirname}/assets/images/background/${theme ? 'dark' : 'light'}`)) {
        let backgrounds = fs.readdirSync(`${__dirname}/assets/images/background/${theme ? 'dark' : 'light'}`);
        let Background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        background = `linear-gradient(#00000080, #00000080), url(./assets/images/background/${theme ? 'dark' : 'light'}/${Background})`;
    }
    body.style.backgroundImage = background ? background : theme ? '#000' : '#fff';
    body.style.backgroundSize = 'cover';
}

async function changePanel(id) {
    let panel = document.querySelector(`.${id}`);
    let active = document.querySelector(`.active`);

    if (active && active !== panel) {
        active.querySelector('.container').style.opacity = 0;
        active.querySelector('.container').style.transform = "scale(0.95)";
        await new Promise(resolve => setTimeout(resolve, 400));

        active.classList.remove("active");
        active.querySelector('.container').style.visibility = "hidden";
    }

    panel.classList.add("active");
    panel.querySelector('.container').style.visibility = "visible";
    panel.querySelector('.container').style.opacity = 1;
    setTimeout(() => {
        panel.querySelector('.container').style.transform = "scale(1)";
    }, 100);
}

async function appdata() {
    return await ipcRenderer.invoke('appData').then(path => path)
}

async function addAccount(data) {
    let skin = false
    if (data?.profile?.skins[0]?.base64) skin = await new skin2D().creatHeadTexture(data.profile.skins[0].base64);
    let div = document.createElement("div");
    div.classList.add("account");
    div.id = data.ID;
    div.innerHTML = `
        <div class="profile-image" ${skin ? 'style="background-image: url(' + skin + ');"' : ''}></div>
        <div class="profile-infos">
            <div class="profile-pseudo">${data.name}</div>
            <div class="profile-uuid">${data.uuid}</div>
        </div>
        <div class="delete-profile" id="${data.ID}">
            <div class="icon-account-delete delete-profile-icon"></div>
        </div>
    `
    return document.querySelector('.accounts-list').appendChild(div);
}

async function accountSelect(data) {
    let account = document.getElementById(`${data.ID}`);
    let activeAccount = document.querySelector('.account-select')

    if (activeAccount) activeAccount.classList.toggle('account-select');
    account.classList.add('account-select');
    if (data?.profile?.skins[0]?.base64) await headplayer(data.profile.skins[0].base64);
}

async function headplayer(skinBase64) {
    let skin = await new skin2D().creatHeadTexture(skinBase64);
    document.querySelector(".player-head").style.backgroundImage = `url(${skin})`;
}

async function setStatus(opt) {
    let nameServerElement = document.querySelector('.server-status-name');
    let statusServerElement = document.querySelector('.server-status-text');
    let playersOnline = document.querySelector('.status-player-count .player-count');
    console.log('Initializing server status... (refresh every 15sec)')

    async function updateStatus() {
        if(!opt) {
            statusServerElement.innerHTML = `Hors ligne - 0 ms`;
            playersOnline.innerHTML = '0';
            return;
        }

        let { ip, port, nameServer } = opt;
        nameServerElement.innerHTML = nameServer;
        let status = new Status(ip, port);
        let statusServer = await status.getStatus().then(res => res).catch(err => err);

        if(!statusServer.error) {
            statusServerElement.classList.remove('red');
            statusServerElement.classList.add('green');
            document.querySelector('.status-player-count').classList.remove('red');
            document.querySelector('.status-player-count').classList.add('green');
            statusServerElement.innerHTML = `En ligne - ${statusServer.ms} ms`;
            playersOnline.innerHTML = statusServer.playersConnect;
        } else {
            statusServerElement.innerHTML = `Hors ligne - 0 ms`;
            playersOnline.innerHTML = '0';
        }
    }
    await updateStatus();

    setInterval(() => {
        updateStatus();
    }, 15000);
}


export {
    appdata as appdata,
    changePanel as changePanel,
    config as config,
    database as database,
    logger as logger,
    popup as popup,
    setBackground as setBackground,
    skin2D as skin2D,
    addAccount as addAccount,
    accountSelect as accountSelect,
    slider as Slider,
    pkg as pkg,
    setStatus as setStatus
}
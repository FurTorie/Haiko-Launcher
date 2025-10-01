/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 */

import Login from './panels/login.js';
import Home from './panels/home.js';
import Settings from './panels/settings.js';

import { logger, config, changePanel, database, popup, setBackground, accountSelect, addAccount, pkg } from './utils.js';
const { AZauth, Microsoft, Mojang } = require('minecraft-java-core');

const { ipcRenderer } = require('electron');
const fs = require('fs');
const os = require('os');

class Launcher {
    async init() {
        this.initLog();
        console.log('Initializing Launcher...');
        this.shortcut()
        await setBackground()
        this.initFrame();
        this.config = await config.GetConfig().then(res => res).catch(err => err);
        if(await this.config.error) return this.errorConnect()
        this.db = new database();
        await this.initConfigClient();
        this.createPanels(Login, Home, Settings);
        await this.startLauncher();
    }

    initLog() {
        document.addEventListener('keydown', e => {
            if(e.ctrlKey && e.shiftKey && e.keyCode === 73 || e.keyCode === 123) {
                ipcRenderer.send('main-window-dev-tools-close');
                ipcRenderer.send('main-window-dev-tools');
            }
        })
        new logger(pkg.name, '#7289da')
    }

    shortcut() {
        document.addEventListener('keydown', e => {
            if(e.ctrlKey && e.keyCode === 87) {
                ipcRenderer.send('main-window-close');
            }
        })
    }

    errorConnect() {
        new popup().openPopup({
            title: this.config.error.code,
            content: this.config.error.message,
            color: 'red',
            exit: true,
            options: true
        });
    }

    initFrame() {
        console.log('Initializing Frame...')
        const platform = os.platform() === 'darwin' ? "darwin" : "other";

        document.querySelector(`.${platform} .frame`).classList.toggle('hide')

        document.querySelector(`.${platform} .frame #minimize`).addEventListener('click', () => {
            ipcRenderer.send('main-window-minimize');
        });

        let maximized = false;
        let maximize = document.querySelector(`.${platform} .frame #maximize`);
        maximize.addEventListener('click', () => {
            if (maximized) ipcRenderer.send('main-window-maximize')
            else ipcRenderer.send('main-window-maximize');
            maximized = !maximized
            maximize.classList.toggle('icon-maximize')
            maximize.classList.toggle('icon-restore-down')
        });

        document.querySelector(`.${platform} .frame #close`).addEventListener('click', () => {
            ipcRenderer.send('main-window-close');
        })
    }

    async initConfigClient() {
        console.log('Initializing Config Client...')
        let configClient = await this.db.readData('configClient')

        if (!configClient) {
            await this.db.createData('configClient', {
                account_selected: null,
                instance_selct: null,
                java_config: {
                    java_path: null,
                    java_memory: {
                        min: 4,
                        max: 6
                    }
                },
                game_config: {
                    screen_size: {
                        width: 1280,
                        height: 720
                    }
                },
                launcher_config: {
                    download_multi: 5,
                    theme: 'sombre',
                    closeLauncher: 'close-launcher',
                    intelEnabledMac: true
                }
            })
        }
    }

    createPanels(...panels) {
        let panelsElem = document.querySelector('.panels')
        for(let panel of panels) {
            console.log(`Initializing ${panel.name} Panel...`);
            let div = document.createElement('div');
            div.classList.add('panel', panel.id)
            div.innerHTML = fs.readFileSync(`${__dirname}/panels/${panel.id}.html`, 'utf8');
            panelsElem.appendChild(div);
            new panel().init(this.config);
        }
    }

    async startLauncher() {
        console.debug(`[DEBUG] Démarrage du startLauncher`);
        let accounts = await this.db.readAllData('accounts')
        console.debug(`[DEBUG] Comptes trouvés dans la DB: ${accounts?.length || 0} comptes`);
        console.debug(`[DEBUG] Liste des comptes:`, accounts?.map(a => `${a.name} (${a.ID})`) || 'aucun');
        let configClient = await this.db.readData('configClient')
        let account_selected = configClient ? configClient.account_selected : null
        console.debug(`[DEBUG] Compte sélectionné: ${account_selected || 'aucun'}`);
        let popupRefresh = new popup();

        if(accounts?.length) {
            console.debug(`[DEBUG] Traitement de ${accounts.length} compte(s)`);
            for(let account of accounts) {
                let account_ID = account.ID
                console.debug(`[DEBUG] Traitement du compte: ${account.name} - ID: ${account_ID} - Type: ${account.meta?.type || 'inconnu'}`);

                // Vérifier si le compte a une erreur
                if(account.error) {
                    console.debug(`[DEBUG] Compte avec erreur détecté, suppression: ${account.error}`);
                    await this.db.deleteData('accounts', account_ID)
                    continue
                }

                if(account.meta.type === 'Xbox') {
                    console.log(`Account Type : ${account.meta.type} | Username : ${account.name}`);
                    console.debug(`[DEBUG] Données du compte Xbox - Nom: ${account.name}, ID: ${account_ID}`);
                    console.debug(`[DEBUG] Meta: ${JSON.stringify(account.meta)}`);
                    console.debug(`[DEBUG] Tokens disponibles: ${account.access_token ? 'OUI' : 'NON'}`);
                    popupRefresh.openPopup({
                        title: 'Connexion',
                        content: `Type de compte : ${account.meta.type} | Utilisateur : ${account.name}`,
                        color: 'var(--dark)',
                        background: false
                    });

                    console.debug(`[DEBUG] Tentative de rafraîchissement du compte Xbox...`);
                    let refresh_accounts = await new Microsoft(this.config.client_id).refresh(account);
                    console.debug(`[DEBUG] Réponse du rafraîchissement - Success: ${!refresh_accounts.error}`);
                    console.debug(`[DEBUG] Réponse complète:`, refresh_accounts);

                    if(refresh_accounts.error) {
                        console.debug(`[DEBUG] Échec du rafraîchissement`);
                        console.debug(`[DEBUG] Code d'erreur: ${refresh_accounts.error}`);
                        console.debug(`[DEBUG] Message d'erreur: ${refresh_accounts.errorMessage}`);
                        console.debug(`[DEBUG] Status code: ${refresh_accounts.statusCode || 'non défini'}`);
                        console.error(`[Account] ${account.name}: ${refresh_accounts.errorMessage || 'Erreur inconnue'}`);
                        // Supprimer le compte en cas d'erreur
                        await this.db.deleteData('accounts', account_ID)
                        if(account_ID === account_selected) {
                            configClient.account_selected = null
                            await this.db.updateData('configClient', configClient)
                        }
                        continue;
                    }

                    console.debug(`[DEBUG] Succès du rafraîchissement`);
                    console.debug(`[DEBUG] Nouveau nom: ${refresh_accounts.name}`);
                    console.debug(`[DEBUG] Nouvel UUID: ${refresh_accounts.uuid || 'non défini'}`);
                    console.debug(`[DEBUG] Nouveaux tokens: ${refresh_accounts.access_token ? 'OUI' : 'NON'}`);
                    refresh_accounts.ID = account_ID
                    await this.db.updateData('accounts', refresh_accounts, account_ID)
                    await addAccount(refresh_accounts)
                    if(account_ID === account_selected) await accountSelect(refresh_accounts)
                } else if(account.meta.type === 'AZauth') {
                    console.log(`Account Type : ${account.meta.type} | Username : ${account.name}`);
                    console.debug(`[DEBUG] Données du compte AZauth - Nom: ${account.name}, ID: ${account_ID}`);
                    console.debug(`[DEBUG] Meta: ${JSON.stringify(account.meta)}`);
                    console.debug(`[DEBUG] Tokens disponibles: ${account.access_token ? 'OUI' : 'NON'}`);
                    popupRefresh.openPopup({
                        title: 'Connexion',
                        content: `Type de compte : ${account.meta.type} | Utilisateur : ${account.name}`,
                        color: 'var(--dark)',
                        background: false
                    });
                    let refresh_accounts = await new AZauth(this.config.online).verify(account);
                    console.debug(`[DEBUG] Réponse AZauth - Success: ${!refresh_accounts.error}`);
                    console.debug(`[DEBUG] Réponse complète:`, refresh_accounts);

                    if(refresh_accounts.error) {
                        console.debug(`[DEBUG] Échec AZauth`);
                        console.debug(`[DEBUG] Message d'erreur: ${refresh_accounts.message}`);
                        await this.db.deleteData('accounts', account_ID)
                        if(account_ID === account_selected) {
                            configClient.account_selected = null
                            await this.db.updateData('configClient', configClient)
                        }
                        console.error(`[Account] ${account.name}: ${refresh_accounts.message}`);
                        continue;
                    }

                    console.debug(`[DEBUG] Succès AZauth`);
                    console.debug(`[DEBUG] Nouveau nom: ${refresh_accounts.name}`);
                    console.debug(`[DEBUG] Nouvel UUID: ${refresh_accounts.uuid || 'non défini'}`);
                    refresh_accounts.ID = account_ID
                    await this.db.updateData('accounts', refresh_accounts, account_ID)
                    await addAccount(refresh_accounts)
                    if(account_ID === account_selected) await accountSelect(refresh_accounts)
                } else if(account.meta.type === 'Mojang') {
                    console.log(`Account Type : ${account.meta.type} | Username : ${account.name}`);
                    console.debug(`[DEBUG] Données du compte Mojang - Nom: ${account.name}, ID: ${account_ID}`);
                    console.debug(`[DEBUG] Meta: ${JSON.stringify(account.meta)}`);
                    console.debug(`[DEBUG] Mode online: ${account.meta.online}`);
                    popupRefresh.openPopup({
                        title: 'Connexion',
                        content: `Type de compte : ${account.meta.type} | Utilisateur : ${account.name}`,
                        color: 'var(--dark)',
                        background: false
                    });
                    if(account.meta.online === false) {
                        let refresh_accounts = await Mojang.login(account.name);
                        console.debug(`[DEBUG] Réponse Mojang login - Success: ${!refresh_accounts.error}`);
                        console.debug(`[DEBUG] Réponse complète:`, refresh_accounts);

                        refresh_accounts.ID = account_ID
                        await addAccount(refresh_accounts)
                        await this.db.updateData('accounts', refresh_accounts, account_ID)
                        if(account_ID === account_selected) await accountSelect(refresh_accounts)
                        continue;
                    }

                    let refresh_accounts = await Mojang.refresh(account);
                    console.debug(`[DEBUG] Réponse Mojang refresh - Success: ${!refresh_accounts.error}`);
                    console.debug(`[DEBUG] Réponse complète:`, refresh_accounts);

                    if(refresh_accounts.error) {
                        console.debug(`[DEBUG] Échec Mojang refresh`);
                        console.debug(`[DEBUG] Message d'erreur: ${refresh_accounts.errorMessage}`);
                        await this.db.deleteData('accounts', account_ID)
                        if(account_ID === account_selected) {
                            configClient.account_selected = null
                            await this.db.updateData('configClient', configClient)
                        }
                        console.error(`[Account] ${account.name}: ${refresh_accounts.errorMessage}`);
                        continue;
                    }

                    console.debug(`[DEBUG] Succès Mojang refresh`);
                    console.debug(`[DEBUG] Nouveau nom: ${refresh_accounts.name}`);
                    console.debug(`[DEBUG] Nouvel UUID: ${refresh_accounts.uuid || 'non défini'}`);
                    refresh_accounts.ID = account_ID
                    await this.db.updateData('accounts', refresh_accounts, account_ID)
                    await addAccount(refresh_accounts)
                    if(account_ID === account_selected) await accountSelect(refresh_accounts)
                } else {
                    console.error(`[Account] ${account.name}: Account Type Not Found`);
                    console.debug(`[DEBUG] Type de compte non reconnu: ${account.meta?.type || 'undefined'}`);
                    console.debug(`[DEBUG] Données du compte:`, account);
                    await this.db.deleteData('accounts', account_ID)
                    if(account_ID === account_selected) {
                        configClient.account_selected = null
                        await this.db.updateData('configClient', configClient)
                    }
                }
            }

            // Vérifier l'état après traitement des comptes
            accounts = await this.db.readAllData('accounts')
            configClient = await this.db.readData('configClient')
            account_selected = configClient ? configClient.account_selected : null
            console.debug(`[DEBUG] Après traitement - Comptes restants: ${accounts?.length || 0}`);
            console.debug(`[DEBUG] Liste des comptes restants:`, accounts?.map(a => `${a.name} (${a.ID})`) || 'aucun');
            console.debug(`[DEBUG] Compte sélectionné après traitement: ${account_selected || 'aucun'}`);

            if(!account_selected) {
                console.debug(`[DEBUG] Aucun compte sélectionné, vérification des comptes disponibles...`);
                if(accounts && accounts.length > 0) {
                    let uuid = accounts[0].ID
                    console.debug(`[DEBUG] Sélection du premier compte disponible: ${accounts[0].name} - UUID: ${uuid}`);
                    if(uuid) {
                        configClient.account_selected = uuid
                        await this.db.updateData('configClient', configClient)
                        await accountSelect(uuid)
                    }
                } else {
                    console.debug(`[DEBUG] Aucun compte disponible après traitement`);
                }
            }

            if(!accounts.length) {
                console.debug(`[DEBUG] Aucun compte restant après traitement`);
                config.account_selected = null
                await this.db.updateData('configClient', config);
                popupRefresh.closePopup()
                return changePanel("login");
            }

            console.debug(`[DEBUG] Lancement du panneau principal`);
            popupRefresh.closePopup()
            await changePanel("home");
        } else {
            console.debug(`[DEBUG] Aucun compte trouvé dans la base de données`);
            popupRefresh.closePopup()
            await changePanel('login');
        }
    }
}

new Launcher().init();

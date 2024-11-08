// Fonction pour afficher l'heure actuelle
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;

    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = currentTime;
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const currentDate = now.toLocaleDateString('fr-FR', options);
    const currentDateElem = document.getElementById('currentDate');
    if (currentDateElem != null) {
        currentDateElem.textContent = currentDate;
    }

    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const allHourElements = document.getElementsByClassName('hour');
    for (const element of allHourElements) {
        element.style.color = settings.color || '#87CEEB';
    }
}

// Fonction pour afficher la liste des alarmes
function displayAlarms() {
    const alarmList = document.getElementById('alarmList');
    alarmList.innerHTML = ''; // Vider la liste pour la recharger
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];

    alarms.forEach((alarm, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${alarm.time} - ${alarm.days.join(', ')}`;

        // Créer le bouton de suppression avec une icône "poubelle"
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = "🗑️"; // Icône poubelle
        deleteButton.style.marginLeft = '10px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.title = 'Supprimer l\'alarme';

        deleteButton.addEventListener('click', () => {
            deleteAlarm(index); // Appel pour supprimer l'alarme
        });

        listItem.appendChild(deleteButton);
        alarmList.appendChild(listItem);
    });
}

// Fonction pour basculer l'état d'activation d'une alarme
function toggleAlarm(index) {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms[index].active = !alarms[index].active;
    localStorage.setItem('alarms', JSON.stringify(alarms));
    displayAlarms();
}

// Fonction pour supprimer une alarme
function deleteAlarm(index) {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.splice(index, 1);
    localStorage.setItem('alarms', JSON.stringify(alarms));
    displayAlarms();
}


// Fonction pour régler l'alarme
function setAlarm() {
    const hour = document.getElementById('hourSelect').value;
    const minute = document.getElementById('minuteSelect').value;
    const selectedDays = Array.from(document.querySelectorAll('#daysOfWeek input:checked')).map(checkbox => checkbox.value);

    if (!hour || !minute || selectedDays.length === 0) {
        alert("Veuillez définir l'heure et sélectionner au moins un jour pour l'alarme.");
        return;
    }

    const alarm = {
        time: `${hour}:${minute}`,
        days: selectedDays
    };

    let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms.push(alarm);
    localStorage.setItem('alarms', JSON.stringify(alarms));

    alert(`Réveil réglé pour ${hour}:${minute} les jours suivants : ${selectedDays.join(', ')}`);
    displayAlarms();
}

let alarmSound = null; // Déclarer une seule fois en dehors de la fonction pour éviter de recréer l'objet Audio
let isAlarmActive = false; // Flag pour vérifier si l'alarme est déjà active

function checkAlarm() {
    const alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    const now = new Date();
    
    // Récupération de l’heure et du jour actuels dans le bon format
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase(); // Conversion en minuscules

    alarms.forEach((alarm, index) => {
        const alarmTime = alarm.time;
        const alarmDays = alarm.days.map(day => day.toLowerCase()); // Conversion en minuscules pour comparaison

        // Vérification si l’alarme doit sonner (même jour et même heure) ET si l'alarme n'a pas été arrêtée
        if (alarmDays.includes(currentDay) && alarmTime === currentTime && !alarm.isStopped) {
            if (!isAlarmActive) {
                // Si l'alarme n'est pas déjà active, on lance le son une seule fois
                alarmSound = new Audio('alarm.mp3'); // Chemin du fichier MP3 local
                alarmSound.play();
                isAlarmActive = true; // Marquer que l'alarme est active

                // Créer un message personnalisé avec un bouton d'arrêt
                const alarmMessage = document.createElement('div');
                alarmMessage.innerText = "Réveil ! Il est l'heure !";
                alarmMessage.style.position = 'fixed';
                alarmMessage.style.top = '20%';
                alarmMessage.style.left = '50%';
                alarmMessage.style.transform = 'translateX(-50%)';
                alarmMessage.style.backgroundColor = '#FF0000';
                alarmMessage.style.color = 'white';
                alarmMessage.style.padding = '10px';
                alarmMessage.style.fontSize = '20px';
                alarmMessage.style.borderRadius = '5px';
                alarmMessage.style.zIndex = '1000';
                alarmMessage.style.display = 'block';  // Afficher le message

                // Ajouter un bouton pour fermer l'alarme
                const closeButton = document.createElement('button');
                closeButton.innerText = "Arrêter l'alarme";
                closeButton.style.marginTop = '10px';
                closeButton.onclick = function() {
                    // Lorsque l'utilisateur clique sur "Arrêter l'alarme"
                    alarmMessage.remove(); // Supprimer le message
                    alarmSound.pause(); // Arrêter le son
                    alarmSound.currentTime = 0; // Revenir au début du son
                    isAlarmActive = false; // Réinitialiser l'état de l'alarme
                    
                    // Marquer cette alarme comme arrêtée définitivement
                    alarm.isStopped = true;

                    // Sauvegarder l'état mis à jour dans localStorage
                    alarms[index] = alarm;  // Mettre à jour l'alarme modifiée
                    localStorage.setItem('alarms', JSON.stringify(alarms));
                };

                alarmMessage.appendChild(closeButton);
                document.body.appendChild(alarmMessage);
            }
        }
    });
}



// Sauvegarder les paramètres de couleur
function saveColorSetting(color) {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    settings.color = color;
    localStorage.setItem('settings', JSON.stringify(settings));
    updateClock();
}

// Appliquer la couleur au bouton "Définir l'Alarme"
function applyAlarmButtonColor() {
    const DEFAULT_COLOR = '#87CEEB';
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const alarmButton = document.getElementById('setAlarmButton');

    if (alarmButton) { // Vérifie que l'élément existe
        const buttonColor = settings.color || DEFAULT_COLOR;
        alarmButton.style.backgroundColor = buttonColor;
    } else {
        console.warn("Le bouton 'Définir l'Alarme' est introuvable dans le DOM.");
    }
}

// Appel de la fonction pour afficher les alarmes au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    applyAlarmButtonColor();
    setInterval(updateClock, 1000); // Mettre à jour l'heure toutes les secondes
    displayAlarms(); // Afficher la liste des alarmes
    setInterval(checkAlarm, 1000); // Vérifier les alarmes chaque secondes
});

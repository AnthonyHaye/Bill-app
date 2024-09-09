# Bill-app
Description des fonctionnalités

Page Login
➔ Possibilité de se connecter en tant qu’employé, ou en tant qu’administrateur RH


Connecté en tant qu’employé
➔ Après s’être connecté sur la page “Login”, l’employé arrive sur la liste des notes de
frais qu’il a déjà transmises, avec les données pertinentes notamment le statut de la
note de frais. Il peut savoir si sa dernière note de frais a été validée ou non. Il peut
voir le justificatif ou télécharger le PDF.
➔ S’il clique sur “Nouvelle note de frais”, il peut saisir les informations d’une nouvelle
note de frais. S’il clique sur “Envoyer”, la note de frais est envoyée aux
administrateurs RH.
➔ S’il navigue en arrière, il reste connecté.
➔ S’il clique sur le bouton “Se déconnecter”, il est envoyé sur la page Login.


Connecté en tant qu’administrateur RH :
➔ Après s’être connecté sur la page Login, l’administrateur arrive sur son dashboard. À
gauche, un feed avec l’ensemble des notes de frais des employés, regroupées par
statut (en attente, acceptées, refusées).
➔ S’il clique sur une des notes de frais en statut “pending”, il peut accepter ou refuser
la note de frais.
➔ S’il clique sur une note de frais déjà traitée, il peut consulter ses informations.
➔ S’il clique sur une note de frais, quel que soit son statut, il peut visualiser le justificatif
ou le télécharger.
➔ S’il navigue en arrière, il reste sur la même page.
➔ S’il clique sur le bouton “Se déconnecter”, il est envoyé sur la page Login.

npx jest src/__tests__/Bills.js --silent=false --verbose --testMatch="**/*.js"
// "test": "jest --coverage --noStackTrace --silent=false --verbose --testMatch=**/*.js"
/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      console.log("windowsIcone : " ,windowIcon);
      expect(windowIcon.classList.contains('active-icon')).toBe(true) 

    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })    
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      console.log("Dates triées :", datesSorted)  
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on the 'New Bill' button" ,() => {
    test("Then it should navigate to the NewBill page", () => {
      const onNavigate = jest.fn()
      console.log (onNavigate)
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage})
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      buttonNewBill.addEventListener('click', billsContainer.handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })
  describe("When I click on the eye icon of a bill", () => {
    test("Then a modal should open with the bill image", async () => {
      // Simule le HTML de la page des factures avec les données mockées
      document.body.innerHTML = BillsUI({ data: bills });
  
      // Simule jQuery modal dans Jest
      $.fn.modal = jest.fn(); 
  
      // Initialise onNavigate comme fonction simulée
      const onNavigate = jest.fn();
      
      // Crée l'instance de Bills avec les dépendances nécessaires
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      
      // Récupére l'icône de la première facture
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      
      // Simule le clic sur l'icône "œil"
      const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(iconEye));
      iconEye.addEventListener('click', handleClickIconEye);
      userEvent.click(iconEye);
  
      // Vérifie que la méthode a bien été appelée
      expect(handleClickIconEye).toHaveBeenCalled();
  
      // Attend que la modale soit ajoutée au DOM et visible
      const modal = await waitFor(() => document.getElementById('modaleFile'));
      expect(modal).toBeTruthy();
  
      // Vérifie que l'image dans la modale s'affiche correctement
      const img = modal.querySelector("img");
      expect(img).toBeTruthy();
      
      // Vérifie que l'URL de l'image est valide et commence par 'http' ou 'https'
      expect(img.src).toMatch(/^https?:\/\//); // Vérifier que l'URL commence par 'http' ou 'https'
  
      // Vérifie que jQuery modal est bien appelé avec 'show'
      expect($.fn.modal).toHaveBeenCalledWith('show');
    });
  });
  
})

